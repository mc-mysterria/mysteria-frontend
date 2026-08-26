/*
 * Generates dist/sitemap.xml.
 *
 * The previous setup used vite-plugin-sitemap with no route list. Because this
 * is a SPA with no file-based routing, the plugin had nothing to enumerate and
 * shipped a two-entry sitemap: the home page and a JS chunk URL
 * (/assets/index-BJHg3gm1), which is not a page at all. Every real route was
 * missing, so nothing but "/" was being offered to search engines.
 *
 * This walks the app's own data files for the routes that actually exist, and
 * optionally folds in published news articles from the API. If the API is
 * unreachable the build still succeeds - it just omits the article URLs.
 *
 * Runs from `npm run build`, after vite build (so the output dirs exist).
 *
 * It writes to every build output root, not just dist/. vite-plugin-vercel
 * copies dist/ into .vercel/output/static during the build, and that Build
 * Output API directory is what Vercel actually deploys. Writing dist/ alone
 * (which is what this did originally) landed the file after that copy, so
 * sitemap.xml never shipped and /sitemap.xml fell through the catch-all
 * rewrite in vercel.json and served index.html instead.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://mysterria.net";
// dist/ is always written; .vercel/output/static only when the Vercel build
// output exists (it does on any real `vite build`, since vite-plugin-vercel is
// in the plugin list).
const OUT_DIRS = ["dist", ".vercel/output/static"];
const API = process.env.SITEMAP_API_URL || "https://api.mysterria.net";

const today = new Date().toISOString().slice(0, 10);

/*
 * Every page is served under a locale segment, so each route is offered to
 * search engines once per locale, and each entry carries xhtml:link alternates
 * naming all of them. That is what tells Google these are translations of one
 * page rather than duplicates competing with each other.
 *
 * The locale list comes from src/assets/sources/locales.json, which the app and
 * api/meta-proxy.ts also read - a private copy here silently drops a locale from
 * every page's alternate set, and nothing in the app would show it.
 */
const LOCALES = require("../src/assets/sources/locales.json").locales;
const DEFAULT_LOCALE = "en";

/** "/guide" under a locale -> "/zh-TW/guide"; "/" -> "/zh-TW". */
const withLocale = (code, route) => (route === "/" ? `/${code}` : `/${code}${route}`);

/** @type {Array<{loc: string, priority: string, changefreq: string, lastmod?: string, alternates?: Array<{hreflang: string, loc: string}>}>} */
const urls = [];

/**
 * Adds a translated route: one <url> per locale, each listing every locale as
 * an alternate. x-default points at English.
 */
const add = (route, priority, changefreq, lastmod = today) => {
    const alternates = [
        ...LOCALES.map(locale => ({hreflang: locale.hreflang, loc: withLocale(locale.code, route)})),
        {hreflang: "x-default", loc: withLocale(DEFAULT_LOCALE, route)},
    ];
    for (const locale of LOCALES) {
        urls.push({loc: withLocale(locale.code, route), priority, changefreq, lastmod, alternates});
    }
};

/* ---- stable routes ---- */
add("/", "1.0", "daily");
add("/guide", "0.9", "weekly");
add("/pathways", "0.9", "weekly");
add("/ascension", "0.8", "daily");
add("/news", "0.8", "daily");
add("/rules", "0.7", "monthly");
add("/store", "0.7", "weekly");
add("/staff", "0.5", "monthly");
add("/terms", "0.3", "yearly");
add("/privacy", "0.3", "yearly");
add("/sla", "0.3", "yearly");

/* ---- one page per Beyonder pathway ---- */
const pathwayData = require("../src/assets/sources/pathway-abilities.json");
const pathwayLastmod = (pathwayData.lastUpdated || today).slice(0, 10);
for (const pathway of pathwayData.pathways) {
    add(`/pathways/${pathway.id}`, "0.8", "monthly", pathwayLastmod);
}

/* ---- one page per guide topic ---- */
// Read the English copy directly: it is the one locale guaranteed to define
// every topic, and the other locales are translations of the same id set.
// The copy is JSON now (Crowdin writes it in place), so the topic ids are read
// from the structure rather than scraped with a regex over a `.ts` module.
const guideSource = JSON.parse(fs.readFileSync(path.join(root, "src/data/guide/en.json"), "utf8"));
const topicIds = [...new Set((guideSource.topics ?? []).map(topic => topic.id).filter(Boolean))];
if (!topicIds.length) throw new Error("build-sitemap: found no guide topics - has src/data/guide/en.json changed shape?");
for (const id of topicIds) add(`/guide/${id}`, "0.7", "monthly");

/* ---- published news, best effort ---- */
async function newsUrls() {
    const found = [];
    for (const locale of ["en", "uk"]) {
        try {
            const response = await fetch(`${API}/api/news/${locale}/latest`, {
                headers: {Accept: "application/json"},
                signal: AbortSignal.timeout(8000),
            });
            if (!response.ok) continue;
            const payload = await response.json();
            const articles = Array.isArray(payload) ? payload : payload.data;
            if (!Array.isArray(articles)) continue;
            for (const article of articles) {
                if (!article?.slug) continue;
                /*
                 * Articles exist only in the language they were written in, so
                 * they are not offered under the Chinese locales - a Chinese
                 * reader is served the English dispatch at its English URL.
                 */
                found.push({
                    loc: `/${locale}/news/${article.slug}`,
                    priority: "0.6",
                    changefreq: "monthly",
                    lastmod: (article.publishedAt || article.createdAt || today).slice(0, 10),
                });
            }
        } catch {
            // Offline build or API down - the stable routes above are still shipped.
        }
    }
    return found;
}

// Articles carry no alternates: each exists in exactly one language.
const articleUrls = await newsUrls();
urls.push(...articleUrls);

const body = urls
    .map(url => {
        const alternates = (url.alternates ?? [])
            .map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${SITE}${alt.loc}"/>\n`)
            .join("");
        return (
            `  <url>\n` +
            `    <loc>${SITE}${url.loc}</loc>\n` +
            `    <lastmod>${url.lastmod}</lastmod>\n` +
            `    <changefreq>${url.changefreq}</changefreq>\n` +
            `    <priority>${url.priority}</priority>\n` +
            alternates +
            `  </url>`
        );
    })
    .join("\n");

const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    `${body}\n</urlset>\n`;

const written = [];
for (const dir of OUT_DIRS) {
    const target = path.join(root, dir);
    // dist/ is the canonical output and is created if missing; the Vercel
    // output dir is only written when that build actually ran.
    if (dir !== "dist" && !fs.existsSync(target)) continue;
    fs.mkdirSync(target, {recursive: true});
    fs.writeFileSync(path.join(target, "sitemap.xml"), xml, "utf8");
    written.push(`${dir}/sitemap.xml`);
}

console.log(
    `Sitemap: ${urls.length} URLs across ${LOCALES.length} locales ` +
    `(${topicIds.length} guide topics, ${pathwayData.pathways.length} pathways, ${articleUrls.length} news) -> ${written.join(", ")}`,
);
