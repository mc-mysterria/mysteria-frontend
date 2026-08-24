/*
 * Locale registry. Everything that varies per language lives here rather than
 * being re-derived with `currentLanguage === "uk" ? ... : ...` at each call
 * site, which is what the codebase did while there were only two locales.
 *
 * Chinese ships as two locales on purpose. Traditional (zh-TW) is the
 * official-facing one for Taiwan and Hong Kong; Simplified (zh-CN) serves
 * mainland readers who arrive on their own. They are separate locales, not a
 * render-time character conversion, so a reviewer can correct either one
 * without touching the other.
 */

import localeTable from "@/assets/sources/locales.json";
import {en, type Translations} from "./en";
import {uk} from "./uk";
import {zhCN} from "./zh-CN";
import {zhTW} from "./zh-TW";

export type Language = "en" | "uk" | "zh-CN" | "zh-TW";

export interface LocaleMeta {
    code: Language;
    /** Endonym, for the language picker. Readers look for their own name. */
    nativeName: string;
    /** Compact label for the collapsed picker. */
    short: string;
    /** `<html lang>` value. */
    htmlLang: string;
    /**
     * hreflang value. Chinese uses script subtags rather than regions so one
     * page serves every Traditional (TW/HK/MO) or Simplified (CN/SG) reader
     * instead of only one country.
     */
    hreflang: string;
    /** Locale for `Intl` / `toLocaleDateString`. */
    intlLocale: string;
    /** Open Graph `og:locale`. */
    ogLocale: string;
    /**
     * BCP-47 tags this locale claims during browser detection, matched as
     * prefixes against `navigator.languages`. Longest match wins.
     */
    accepts: string[];
    /**
     * Locales that quote the store in points instead of real currency.
     * Ukrainian players buy with points; English and Chinese readers see
     * USD/EUR, since TW/HK players pay by card.
     */
    pointsOnly: boolean;
    /**
     * Which plural rule applies. "english" is one/many, "slavic" is the
     * Ukrainian one/few/many, and "none" is Chinese, which has no plural.
     */
    pluralStyle: "english" | "slavic" | "none";
    /**
     * Which language the news backend should be asked for.
     *
     * News articles are authored in the CMS, not translated here, and it only
     * carries English and Ukrainian - so Chinese readers are served the English
     * dispatches rather than an empty news page. Change a locale's value to its
     * own code once articles exist for it.
     */
    articleLocale: ArticleLocale;
}

/**
 * Languages the news backend actually publishes articles in. The array is the
 * source of truth - the type is derived from it - so a locale gaining its own
 * edition is one edit here rather than a union and a Set in a view.
 */
export const ARTICLE_LOCALES = ["en", "uk"] as const;
export type ArticleLocale = typeof ARTICLE_LOCALES[number];


export const DEFAULT_LANGUAGE: Language = "en";

/** Kept from the two-locale era so existing visitors keep their choice. */
export const LANGUAGE_STORAGE_KEY = "mysterria-language";

/*
 * The table itself lives in src/assets/sources/locales.json, because the app is
 * only one of its four consumers: build-sitemap.mjs, i18n-coverage.mjs and
 * api/meta-proxy.ts read the same file. They each used to keep a private copy
 * under a "keep in step" comment, and a missed entry there is invisible in the
 * app - it just drops a locale from the sitemap or mislabels <html lang>.
 */
export const LOCALES: Record<Language, LocaleMeta> = Object.fromEntries(
    (localeTable.locales as LocaleMeta[]).map(meta => [meta.code, meta]),
) as Record<Language, LocaleMeta>;

/** Picker order, also the order alternates are emitted in: the file's own order. */
export const LANGUAGES: Language[] = (localeTable.locales as LocaleMeta[]).map(meta => meta.code);

/** Whether a locale has its own articles, rather than borrowing another's. */
export const hasOwnArticles = (language: Language): boolean =>
    LOCALES[language].articleLocale === language;

export const translations: Record<Language, Translations> = {
    en,
    uk,
    "zh-CN": zhCN,
    "zh-TW": zhTW,
};

export function isLanguage(value: unknown): value is Language {
    return typeof value === "string" && value in LOCALES;
}

/**
 * Every `accepts` prefix, longest first, so a specific tag beats a generic one.
 * Built once: `matchLanguage` runs per Accept-Language entry on a cold visit.
 */
const ACCEPTS: ReadonlyArray<{code: Language; pattern: string}> = Object.values(LOCALES)
    .flatMap(meta => meta.accepts.map(pattern => ({code: meta.code, pattern})))
    .sort((a, b) => b.pattern.length - a.pattern.length);

/**
 * Resolves an arbitrary BCP-47 tag to a supported locale, or null.
 *
 * Matching is case-insensitive and prefix-based against each locale's
 * `accepts` list, longest first, so `zh-TW` beats the bare `zh` fallback.
 */
export function matchLanguage(tag: string): Language | null {
    const normalized = tag.toLowerCase().replace(/_/g, "-");
    if (!normalized) return null;

    /*
     * Script subtags can sit anywhere in a Chinese tag - zh-Hant-HK, zh-yue-Hant -
     * so they are read before the prefix table rather than after it. After it they
     * were unreachable: the bare `zh` entry matches zh-yue-Hant first and would
     * hand a Cantonese Traditional reader the Simplified locale.
     */
    if (normalized.startsWith("zh")) {
        if (normalized.includes("hant")) return "zh-TW";
        if (normalized.includes("hans")) return "zh-CN";
    }

    for (const {code, pattern} of ACCEPTS) {
        if (normalized === pattern || normalized.startsWith(`${pattern}-`)) return code;
    }
    return null;
}

/**
 * The locale a first-time visitor should get, from their browser preferences.
 * Falls back to English when nothing matches, so a reader with an unsupported
 * language still lands on a page they are most likely to be able to read.
 */
export function detectLanguage(preferred: readonly string[] = navigator.languages ?? []): Language {
    const tags = preferred.length ? preferred : [navigator.language].filter(Boolean);
    for (const tag of tags) {
        const match = matchLanguage(tag);
        if (match) return match;
    }
    return DEFAULT_LANGUAGE;
}

/** The stored choice, if the visitor has made one. */
export function storedLanguage(): Language | null {
    try {
        const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        return isLanguage(saved) ? saved : null;
    } catch {
        // Private mode / blocked storage: fall through to detection.
        return null;
    }
}

/** An explicit choice wins; otherwise honour the browser. */
export function resolveLanguage(): Language {
    return storedLanguage() ?? detectLanguage();
}

export type {Translations};
