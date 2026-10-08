/*
 * The vercel.json routing table, reimplemented.
 *
 * Vercel applied, in this order: headers, then `redirects`, then the
 * filesystem, then `rewrites`. That order is load-bearing here and the
 * middleware in index.ts is mounted to match it - in particular the bare-path
 * redirects run before the crawler rewrites, so a crawler asking for
 * /pathways is 301'd to /en/pathways and then matched by the :lang crawler
 * rule, not by the bare one. Both are kept anyway, as vercel.json had both.
 *
 * Everything in this file is data, so it can be asserted against vercel.json
 * rather than read as prose.
 */

/** The eight locales the app serves, in language-picker order. */
export const LOCALES = ['en', 'uk', 'ro', 'de', 'es', 'fr', 'zh-CN', 'zh-TW'] as const;
export type Locale = (typeof LOCALES)[number];

const LOCALE_SET: ReadonlySet<string> = new Set(LOCALES);
export const isLocale = (v: string): v is Locale => LOCALE_SET.has(v);

/*
 * Link-preview crawlers, verbatim from the `has: user-agent` conditions in
 * vercel.json. These get server-rendered OG tags from meta-proxy instead of
 * the SPA shell, which has no per-page tags for them to read.
 */
export const CRAWLER_UA =
    /(facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|SkypeUriPreview|pinterest|reddit)/i;

/*
 * Accept-Language -> locale, in vercel.json's order. Order matters twice over:
 * zh-TW/HK/MO/Hant must be tested before the generic zh (or Traditional
 * readers land on Simplified), and the list is first-match-wins against the
 * START of the header, which is why each pattern is anchored.
 */
export const ACCEPT_LANGUAGE_REDIRECTS: ReadonlyArray<{pattern: RegExp; locale: Locale}> = [
    {pattern: /^\s*zh-(TW|HK|MO|Hant)/i, locale: 'zh-TW'},
    {pattern: /^\s*zh/i, locale: 'zh-CN'},
    {pattern: /^\s*uk/i, locale: 'uk'},
    {pattern: /^\s*ro/i, locale: 'ro'},
    {pattern: /^\s*de/i, locale: 'de'},
    {pattern: /^\s*es/i, locale: 'es'},
    {pattern: /^\s*fr/i, locale: 'fr'},
];

/** Locale chosen for a bare `/` request. Falls back to en, as vercel.json did. */
export function localeFromAcceptLanguage(header: string | undefined): Locale {
    if (!header) return 'en';
    for (const {pattern, locale} of ACCEPT_LANGUAGE_REDIRECTS) {
        if (pattern.test(header)) return locale;
    }
    return 'en';
}

/*
 * Top-level sections that exist only under a locale prefix. A bare /store is
 * permanently redirected to /en/store, both alone and with any sub-path - the
 * `source: "/x"` plus `source: "/x/:path*"` pair that vercel.json spelled out
 * twice for each of these.
 */
export const LOCALE_PREFIXED_SECTIONS: readonly string[] = [
    'store', 'rules', 'staff', 'terms', 'privacy', 'sla', 'ascension', 'wiki',
    'game', 'login', 'logout', 'profile', 'notifications', 'commissions',
    'admin', 'edit', 'guide', 'pathways', 'news', 'services', 'tools',
];

/*
 * Paths whose link previews meta-proxy can render, mapped to the `path`
 * argument it expects. Matched against the path AFTER any locale prefix has
 * been stripped. Order matters: the more specific pattern has to win, so
 * /news/uk/slug is not read as /news/:slug with slug="uk".
 */
export const META_PROXY_ROUTES: ReadonlyArray<{pattern: RegExp; path: (m: RegExpMatchArray) => string}> = [
    {pattern: /^\/pathways\/([^/]+)\/?$/, path: m => `pathways/${m[1]}`},
    {pattern: /^\/pathways\/?$/, path: () => 'pathways'},
    {pattern: /^\/news\/(en|uk)\/([^/]+)\/?$/, path: m => `news/${m[1]}/${m[2]}`},
    {pattern: /^\/news\/([^/]+)\/?$/, path: m => `news/${m[1]}`},
    {pattern: /^\/news\/?$/, path: () => 'news'},
    {pattern: /^\/services\/([^/]+)\/?$/, path: m => `services/${m[1]}`},
    {pattern: /^\/rules\/?$/, path: () => 'rules'},
    {pattern: /^\/store\/?$/, path: () => 'store'},
    {pattern: /^\/guide\/?$/, path: () => 'guide'},
    {pattern: /^\/ascension\/?$/, path: () => 'ascension'},
    {pattern: /^\/profile\/?$/, path: () => 'profile'},
    {pattern: /^\/staff\/?$/, path: () => 'staff'},
    {pattern: /^\/terms\/?$/, path: () => 'terms'},
    {pattern: /^\/privacy\/?$/, path: () => 'privacy'},
    {pattern: /^\/sla\/?$/, path: () => 'sla'},
];

export interface MetaProxyMatch {
    /** The `path` query argument for meta-proxy. */
    path: string;
    /** The `lang` query argument, absent for an unprefixed URL. */
    lang?: Locale;
}

/**
 * Resolves a request path to meta-proxy arguments, or null if this path has no
 * server-rendered preview. `/:lang` on its own maps to path=home, which is the
 * one case with no equivalent unprefixed rule in vercel.json.
 */
export function matchMetaProxy(pathname: string): MetaProxyMatch | null {
    let rest = pathname;
    let lang: Locale | undefined;

    const prefix = pathname.match(/^\/([^/]+)(\/.*)?$/);
    if (prefix && isLocale(prefix[1])) {
        lang = prefix[1];
        rest = prefix[2] ?? '/';
        if (rest === '/') return {path: 'home', lang};
    }

    for (const route of META_PROXY_ROUTES) {
        const m = rest.match(route.pattern);
        if (m) return lang ? {path: route.path(m), lang} : {path: route.path(m)};
    }
    return null;
}
