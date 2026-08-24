import {describe, expect, it} from "vitest";
import {localePath, stripLocale} from "@/composables/useLocalePath";
import {LANGUAGES} from "@/locales";

describe("localePath", () => {
    it("prefixes an absolute path", () => {
        expect(localePath("/guide", "zh-TW")).toBe("/zh-TW/guide");
        expect(localePath("/pathways/fool", "uk")).toBe("/uk/pathways/fool");
    });

    it("maps the root to the bare locale segment", () => {
        expect(localePath("/", "en")).toBe("/en");
        expect(localePath("/", "zh-CN")).toBe("/zh-CN");
    });

    /*
     * "/#companion" is a link to a section of the home page. Prefixing it
     * naively yields "/zh-TW/#companion", whose trailing slash stops the home
     * route matching, so the hash target never renders.
     */
    it("keeps a hash attached to the locale root, not to a trailing slash", () => {
        expect(localePath("/#companion", "zh-TW")).toBe("/zh-TW#companion");
    });

    it("preserves query strings and hashes", () => {
        expect(localePath("/store?tab=ranks", "en")).toBe("/en/store?tab=ranks");
        expect(localePath("/guide/brewing#step-2", "zh-CN")).toBe("/zh-CN/guide/brewing#step-2");
        expect(localePath("/commissions?resubmit=7#form", "uk")).toBe("/uk/commissions?resubmit=7#form");
    });

    it("leaves anything that is not an absolute internal path alone", () => {
        expect(localePath("https://wiki.mysterria.net/", "zh-TW")).toBe("https://wiki.mysterria.net/");
        expect(localePath("mailto:hi@mysterria.net", "en")).toBe("mailto:hi@mysterria.net");
        expect(localePath("#section", "en")).toBe("#section");
        expect(localePath("relative/path", "en")).toBe("relative/path");
    });
});

describe("stripLocale", () => {
    it("removes a leading locale segment", () => {
        expect(stripLocale("/zh-TW/guide")).toBe("/guide");
        expect(stripLocale("/uk/pathways/fool")).toBe("/pathways/fool");
    });

    it("turns a bare locale segment back into the root", () => {
        expect(stripLocale("/en")).toBe("/");
        expect(stripLocale("/zh-CN")).toBe("/");
    });

    it("leaves paths without a locale segment untouched", () => {
        // /auth/callback is deliberately served outside the locale prefix.
        expect(stripLocale("/auth/callback")).toBe("/auth/callback");
        expect(stripLocale("/guide")).toBe("/guide");
        expect(stripLocale("/")).toBe("/");
    });

    it("does not mistake a path segment for a locale", () => {
        expect(stripLocale("/english/guide")).toBe("/english/guide");
        expect(stripLocale("/zh/guide")).toBe("/zh/guide");
    });

    it("round-trips with localePath for every locale", () => {
        for (const code of LANGUAGES) {
            for (const route of ["/", "/guide", "/pathways/fool", "/news/some-slug"]) {
                expect(stripLocale(localePath(route, code)), `${code} ${route}`).toBe(route);
            }
        }
    });
});
