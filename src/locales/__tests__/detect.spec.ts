import {describe, expect, it} from "vitest";
import {contentLocale, detectLanguage, LANGUAGES, LOCALES, matchLanguage} from "@/locales";

describe("matchLanguage", () => {
    it("resolves plain language tags", () => {
        expect(matchLanguage("en")).toBe("en");
        expect(matchLanguage("uk")).toBe("uk");
        expect(matchLanguage("ro")).toBe("ro");
        expect(matchLanguage("de")).toBe("de");
        expect(matchLanguage("es")).toBe("es");
        expect(matchLanguage("fr")).toBe("fr");
    });

    it("resolves regional tags to their locale", () => {
        expect(matchLanguage("en-GB")).toBe("en");
        expect(matchLanguage("uk-UA")).toBe("uk");
        expect(matchLanguage("ro-MD")).toBe("ro");
        expect(matchLanguage("de-AT")).toBe("de");
        expect(matchLanguage("es-MX")).toBe("es");
        expect(matchLanguage("fr-CA")).toBe("fr");
    });

    /*
     * The whole point of two Chinese locales: a Taiwan or Hong Kong reader must
     * land on Traditional, and a mainland or Singapore reader on Simplified.
     * Getting this backwards is the most visible possible localization failure.
     */
    it("routes Traditional-Chinese regions to zh-TW", () => {
        const traditional = ["zh-TW", "zh-HK", "zh-MO", "zh-Hant", "zh-Hant-HK", "zh-hant-tw"];
        expect(traditional.map(matchLanguage)).toEqual(traditional.map(() => "zh-TW"));
    });

    it("routes Simplified-Chinese regions to zh-CN", () => {
        const simplified = ["zh-CN", "zh-SG", "zh-Hans", "zh-Hans-CN", "zh-hans"];
        expect(simplified.map(matchLanguage)).toEqual(simplified.map(() => "zh-CN"));
    });

    it("treats a bare zh as Simplified", () => {
        expect(matchLanguage("zh")).toBe("zh-CN");
    });

    it("is case-insensitive and tolerates underscores", () => {
        expect(matchLanguage("ZH_TW")).toBe("zh-TW");
        expect(matchLanguage("EN_US")).toBe("en");
    });

    it("returns null for languages the site does not serve", () => {
        expect(matchLanguage("ja")).toBeNull();
        // Deliberately not matched by the `zh` prefix rule.
        expect(matchLanguage("zu")).toBeNull();
        expect(matchLanguage("")).toBeNull();
    });
});

describe("detectLanguage", () => {
    it("takes the first supported entry in the browser's preference order", () => {
        expect(detectLanguage(["ja", "zh-TW", "en"])).toBe("zh-TW");
        expect(detectLanguage(["de-CH", "fr"])).toBe("de");
        expect(detectLanguage(["ja-JP", "en-US"])).toBe("en");
    });

    it("falls back to English when nothing is supported", () => {
        expect(detectLanguage(["ja", "ko", "it"])).toBe("en");
        expect(detectLanguage([])).toBe("en");
    });

    it("prefers an earlier Chinese variant over a later one", () => {
        expect(detectLanguage(["zh-HK", "zh-CN"])).toBe("zh-TW");
        expect(detectLanguage(["zh-CN", "zh-TW"])).toBe("zh-CN");
    });
});

describe("locale registry", () => {
    it("lists every locale in the picker", () => {
        expect([...LANGUAGES].sort()).toEqual(Object.keys(LOCALES).sort());
    });

    it("gives each locale a distinct hreflang", () => {
        const hreflangs = LANGUAGES.map(code => LOCALES[code].hreflang);
        expect(new Set(hreflangs).size).toBe(hreflangs.length);
    });

    it("keys each locale entry by its own code", () => {
        for (const [code, meta] of Object.entries(LOCALES)) {
            expect(meta.code).toBe(code);
        }
    });

    it("only asks the news backend for languages it publishes", () => {
        for (const code of LANGUAGES) {
            expect(["en", "uk"]).toContain(LOCALES[code].articleLocale);
        }
    });

    /*
     * Ukrainian is the only non-English edition, so English is the fallback for
     * everyone else. A locale silently pointed at "uk" is the bug moderators
     * reported: a German interface serving a Ukrainian store.
     */
    it("falls back to English, never Ukrainian, for locales without content", () => {
        for (const code of LANGUAGES) {
            if (code === "uk") continue;
            expect(contentLocale(code)).toBe("en");
        }
    });

    it("keeps Ukrainian on its own edition", () => {
        expect(contentLocale("uk")).toBe("uk");
    });
});
