/*
 * Self-hosted replacement for the Vercel deployment of the main site.
 *
 * One process does what the Vercel router plus its five functions did: it
 * serves the built dist/, applies the vercel.json redirect/rewrite table (see
 * routing.ts) and mounts api/*.ts unchanged.
 *
 * The handlers in api/ are imported *as they are*. Their VercelRequest /
 * VercelResponse types are structurally what Express passes - req.query,
 * req.headers, req.body, res.status().json(), res.setHeader(), res.send() - and
 * the @vercel/node import in each is type-only, so it erases at runtime. Not
 * forking them means a Vercel deploy of the same commit still works, which is
 * the rollback path while DNS moves.
 */
import express, {type Request, type Response} from 'express';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import metaProxy from '../api/meta-proxy.js';
import beyonderStats from '../api/beyonder-stats.js';
import beyonderSelf from '../api/beyonder-self.js';
import balanceReport from '../api/balance-report.js';
import catwalkProxy from '../api/catwalk-proxy.js';

import {CRAWLER_UA, LOCALE_PREFIXED_SECTIONS, localeFromAcceptLanguage, matchMetaProxy} from './routing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '../dist');
const UPSTREAM_API = 'https://api.mysterria.net';
const PORT = Number(process.env.PORT ?? 3000);

const app = express();
// Behind host nginx behind Cloudflare, so the client IP is only in the
// forwarded chain, and req.protocol must read from it for redirects to stay
// on https.
app.set('trust proxy', true);
app.disable('x-powered-by');
app.set('etag', 'strong');

/* --- headers, the `headers` block of vercel.json ------------------------- */

app.use((req, res, next) => {
    // The bare `/` answer varies by Accept-Language (see the redirect below),
    // so it must not be cached as if it were one page for every reader.
    if (req.path === '/') res.setHeader('Vary', 'Accept-Language');

    if (req.path === '/sentry') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Sentry-Auth, Origin');
    }

    if (req.path === '/sitemap.xml') {
        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    next();
});

/* --- redirects ----------------------------------------------------------- */

/*
 * `/` picks a locale from Accept-Language. 302 rather than 301 (vercel.json set
 * permanent: false): the target depends on the request, so it must never be
 * cached as a permanent move for everyone.
 */
app.get('/', (req, res) => {
    const locale = localeFromAcceptLanguage(req.headers['accept-language']);
    res.redirect(302, `/${locale}`);
});

// Bare section paths live only under a locale. Permanent, as in vercel.json.
const sectionPattern = new RegExp(`^/(${LOCALE_PREFIXED_SECTIONS.join('|')})(/.*)?$`);
app.use((req, res, next) => {
    const m = req.path.match(sectionPattern);
    if (!m) return next();
    const suffix = m[2] ?? '';
    const query = req.originalUrl.slice(req.path.length);
    res.redirect(301, `/en/${m[1]}${suffix}${query}`);
});

/* --- the five functions -------------------------------------------------- */

const wrap = (h: (req: never, res: never) => unknown) =>
    (req: Request, res: Response) => Promise.resolve(h(req as never, res as never)).catch(err => {
        console.error('Unhandled error in handler:', err);
        if (!res.headersSent) res.status(500).json({error: 'Internal error'});
    });

/*
 * Express 5 exposes req.query as a getter-only accessor on the prototype, so a
 * plain `req.query = {...}` throws TypeError. The rewrites below have to hand
 * synthesised params to handlers that read them from req.query (the shape the
 * Vercel rewrites gave them), so shadow the accessor with an own property
 * instead of assigning through it.
 */
function setQuery(req: Request, extra: Record<string, string>): void {
    Object.defineProperty(req, 'query', {
        value: {...req.query, ...extra},
        configurable: true,
        enumerable: true,
        writable: true,
    });
}

app.use('/api', express.json({limit: '2mb'}));

app.all('/api/meta-proxy', wrap(metaProxy));
app.all('/api/beyonder-stats', wrap(beyonderStats));
app.all('/api/beyonder-self', wrap(beyonderSelf));
app.all('/api/balance-report', wrap(balanceReport));
app.all('/api/catwalk-proxy', wrap(catwalkProxy));

/*
 * /catwalk/* is the public, token-injecting passthrough. catwalk-proxy reads
 * its target from req.query.path, so the sub-path is moved there - the shape
 * the `/catwalk/:path*` -> `/api/catwalk-proxy?path=:path*` rewrite produced.
 */
app.use((req, res, next) => {
    const m = req.path.match(/^\/catwalk\/(.+)$/);
    if (!m) return next();
    setQuery(req, {path: m[1]});
    return wrap(catwalkProxy)(req, res);
});

/*
 * Everything else under /api goes to the Spring backend. The browser calls the
 * site own origin so it never needs CORS from api.mysterria.net - that is what
 * the `/api/:path*` rewrite did, and dropping it would break every
 * authenticated call the SPA makes.
 */
app.use(async (req, res, next) => {
    const m = req.path.match(/^\/api\/(.*)$/);
    if (!m) return next();
    const target = `${UPSTREAM_API}/api/${m[1]}${req.originalUrl.slice(req.path.length)}`;
    try {
        const headers: Record<string, string> = {Accept: req.headers.accept ?? 'application/json'};
        if (req.headers.authorization) headers.Authorization = req.headers.authorization;
        if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];

        const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
        const upstream = await fetch(target, {
            method: req.method,
            headers,
            body: hasBody && req.body !== undefined ? JSON.stringify(req.body) : undefined,
        });

        res.status(upstream.status);
        const ct = upstream.headers.get('content-type');
        if (ct) res.setHeader('Content-Type', ct);
        res.send(Buffer.from(await upstream.arrayBuffer()));
    } catch (err) {
        console.error('Upstream API proxy failed:', target, err);
        res.status(502).json({success: false, message: 'Failed to reach upstream API'});
    }
});

/* --- filesystem ---------------------------------------------------------- */

app.use(express.static(DIST, {
    index: false,
    redirect: false,
    setHeaders(res, filePath) {
        // Vite fingerprints everything under assets/, so those may be pinned
        // for a year. Everything else gets the shorter image/font window.
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (/\.(webp|png|jpg|jpeg|svg|ico|woff2?)$/i.test(filePath)) {
            res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        }
    },
}));

/* --- rewrites ------------------------------------------------------------ */

/*
 * Link-preview crawlers get server-rendered OG tags instead of the SPA shell,
 * which carries no per-page tags. This sits after the filesystem and before
 * the SPA fallback, exactly where the vercel.json rewrites sat: a crawler
 * asking for a real file still gets the file.
 */
app.use((req, res, next) => {
    const ua = req.headers['user-agent'];
    if (!ua || !CRAWLER_UA.test(ua)) return next();

    const match = matchMetaProxy(req.path);
    if (!match) return next();

    setQuery(req, {path: match.path, ...(match.lang ? {lang: match.lang} : {})});
    return wrap(metaProxy)(req, res);
});

// SPA fallback - the `/(.*) -> /index.html` catch-all.
app.use((req, res) => {
    res.sendFile(path.join(DIST, 'index.html'), err => {
        if (err) {
            console.error('Failed to send index.html:', err);
            if (!res.headersSent) res.status(500).send('Internal error');
        }
    });
});

app.listen(PORT, () => {
    console.log(`[mysterria-frontend] listening on ${PORT}, serving ${DIST}`);
    if (!process.env.CATWALK_API_TOKEN) {
        // Not fatal: the catwalk-backed routes degrade to whatever catwalk
        // returns unauthenticated, which is a 401/403 rather than a crash.
        // Worth one loud line, because the symptom is otherwise subtle.
        console.warn('[mysterria-frontend] CATWALK_API_TOKEN is not set - catwalk-backed routes will fail');
    }
});
