/*
 * Translation engine. The strings themselves live in src/locales/<code>.ts;
 * this file only resolves keys against the active locale.
 *
 * The active locale is driven by the URL. Every route carries a locale segment
 * (/zh-TW/guide), the router calls applyLanguage() with it, and this module is
 * the single place that holds the resulting state. Nothing else should write
 * currentLanguage - to change language, navigate.
 */

import {computed, ref} from "vue";
import {
    DEFAULT_LANGUAGE,
    type Language,
    LANGUAGE_STORAGE_KEY,
    type LocaleMeta,
    LOCALES,
    resolveLanguage,
    translations,
} from "@/locales";

const currentLanguage = ref<Language>(DEFAULT_LANGUAGE);

let initialized = false;

/**
 * Picks up the stored choice, or the browser's preference for a first-time
 * visitor. Called once, lazily, so that importing this module never touches
 * localStorage on its own.
 */
function ensureInitialized() {
    if (initialized) return;
    initialized = true;
    currentLanguage.value = resolveLanguage();
}

/**
 * Switches locale and remembers it. The URL is the source of truth, so this is
 * called by the router once it has resolved the locale segment - not from
 * components. Use the router to change language.
 */
export function applyLanguage(language: Language) {
    initialized = true;
    if (currentLanguage.value !== language) currentLanguage.value = language;
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
        // Blocked storage: the URL still carries the locale, so this is survivable.
    }
}

/** Walks a dotted key path. Returns undefined rather than throwing. */
function lookup(tree: unknown, path: readonly string[]): unknown {
    let value = tree;
    for (const segment of path) {
        if (value && typeof value === "object" && segment in value) {
            value = (value as Record<string, unknown>)[segment];
        } else {
            return undefined;
        }
    }
    return value;
}

/**
 * Resolves a key in the active locale, falling back to English.
 *
 * The fallback matters for Chinese: the locale files are generated and reviewed
 * in batches, so a key can legitimately be missing mid-review. Showing the
 * English string is a far better failure than showing a raw dotted key to a
 * reader.
 */
function resolve(key: string): unknown {
    const path = key.split(".");
    const active = lookup(translations[currentLanguage.value], path);
    if (active !== undefined) return active;
    return lookup(translations[DEFAULT_LANGUAGE], path);
}

export function useI18n() {
    ensureInitialized();

    const t = (key: string): string => {
        const value = resolve(key);
        if (typeof value === "string") return value;
        if (Array.isArray(value)) return value.join(" ");
        return key;
    };

    const tArray = (key: string): string[] => {
        const value = resolve(key);
        return Array.isArray(value) ? (value as string[]) : [];
    };

    /**
     * Returns a whole subtree rather than one string, for views that render a
     * block of related copy (`ui.title`, `ui.badges.deity`) instead of calling
     * `t()` per label. Completeness is guaranteed by the `Translations` type, so
     * the returned object always has every key.
     */
    const tree = <T>(key: string): T => resolve(key) as T;

    const locale = computed<LocaleMeta>(() => LOCALES[currentLanguage.value]);

    return {
        currentLanguage: computed(() => currentLanguage.value),
        /** Full metadata for the active locale (html lang, og:locale, hreflang…). */
        locale,
        /** Locale tag for `Intl` and `toLocale*String`. */
        intlLocale: computed(() => locale.value.intlLocale),
        t,
        tArray,
        tree,
        /**
         * Picks the right plural form for a count under the active locale's
         * rule. English needs one/many, Ukrainian the Slavic one/few/many, and
         * Chinese has no plural - so callers just supply all three forms.
         */
        plural: (count: number, forms: { one: string; few: string; many: string }): string => {
            switch (locale.value.pluralStyle) {
                case "none":
                    return forms.many;
                case "slavic": {
                    const mod10 = count % 10;
                    const mod100 = count % 100;
                    if (mod10 === 1 && mod100 !== 11) return forms.one;
                    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms.few;
                    return forms.many;
                }
                default:
                    return count === 1 ? forms.one : forms.many;
            }
        },
    };
}

export type {Language};
