/*
 * Builds locale-prefixed internal paths.
 *
 * Every page lives under a locale segment, so a bare "/guide" is not a valid
 * internal target any more - it would land on the redirect catch-all, cost an
 * extra navigation, and stop `router-link` from marking itself active (the href
 * would never equal the current path). `localePath("/guide")` gives
 * "/zh-TW/guide" instead.
 *
 * Templates reach this as the global `$lp`, registered in main.ts, so link
 * markup stays `:to="$lp('/guide')"` without a per-file import. Script blocks
 * and stores use `useLocalePath()` or the bare `localePath()`.
 */

import {computed} from "vue";
import {useRoute} from "vue-router";
import {useI18n} from "@/composables/useI18n";
import {isLanguage, type Language} from "@/locales";

/**
 * Prefixes an absolute internal path with a locale segment, preserving any
 * query string and hash. Anything that is not an absolute path - an external
 * URL, a bare fragment, a mailto: - is returned untouched.
 */
export function localePath(path: string, language: Language): string {
    if (typeof path !== "string" || !path.startsWith("/")) return path;

    // Split off ?query and #hash so they end up after the prefixed path, not
    // inside it. "/#companion" has to become "/zh-TW#companion", not
    // "/zh-TW/#companion", or the home route stops matching.
    const [, pathname, suffix] = /^([^?#]*)(.*)$/.exec(path) as RegExpExecArray;
    const base = pathname === "/" ? "" : pathname.replace(/\/$/, "");

    return `/${language}${base}${suffix}`;
}

/**
 * Inverse of `localePath`: drops a leading locale segment so a path can be
 * compared against unprefixed route definitions.
 *
 * `/zh-TW/guide` -> `/guide`, `/en` -> `/`. Paths without a recognised locale
 * segment come back unchanged, which keeps this safe on the unlocalized routes
 * and on hrefs from outside the app.
 */
export function stripLocale(path: string): string {
    const match = /^\/([^/?#]+)(.*)$/.exec(path);
    if (!match || !isLanguage(match[1])) return path;
    return match[2].startsWith("/") || match[2] === "" ? match[2] || "/" : `/${match[2]}`;
}

export function useLocalePath() {
    const {currentLanguage} = useI18n();
    const route = useRoute();

    return {
        localePath: (path: string) => localePath(path, currentLanguage.value),
        stripLocale,
        /** Current path with the locale segment removed. */
        unprefixedPath: computed(() => stripLocale(route.path)),
    };
}
