import {describe, expect, it} from "vitest";
import fs from "node:fs";
import path from "node:path";

/*
 * Every internal link must carry the active locale segment, which the app does
 * by wrapping the path in the global $lp() helper (src/main.ts).
 *
 * Nothing in the type system enforces that. A plain `to="/store"` compiles,
 * renders, and looks like it works, because the router's catch-all redirects it
 * - but that costs an extra navigation, permanently loses router-link-active
 * styling on the link, and resolves the target locale from localStorage rather
 * than the URL, so a first-visit zh-TW reader who clicks it lands in English.
 * Correct-looking, review-proof, and only reproducible on a cold browser: worth
 * a test rather than a convention.
 */
const VUE_DIR = path.resolve(__dirname, "../..");

/** Every .vue file under src/, recursively. */
function vueFiles(dir: string): string[] {
    return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return entry.name === "node_modules" ? [] : vueFiles(full);
        return entry.name.endsWith(".vue") ? [full] : [];
    });
}

/*
 * A literal internal path in a `to` binding: to="/x", :to="'/x'", :to="`/x`".
 * Named-route objects (:to="{name: 'home'}") and external hrefs are untouched,
 * and so is anything already going through $lp().
 */
const RAW_TO = /(?::to="[`']\/(?!\/)|\bto="\/(?!\/))/g;

describe("locale-prefixed links", () => {
    it("routes every internal RouterLink through $lp()", () => {
        const offenders: string[] = [];

        for (const file of vueFiles(VUE_DIR)) {
            const source = fs.readFileSync(file, "utf8");
            const template = source.slice(0, source.indexOf("<script") + 1 || source.length);
            for (const match of template.matchAll(RAW_TO)) {
                const line = template.slice(0, match.index).split("\n").length;
                const rel = path.relative(VUE_DIR, file).replace(/\\/g, "/");
                offenders.push(`${rel}:${line} - ${match[0]}… should be :to="$lp('/…')"`);
            }
        }

        expect(offenders).toEqual([]);
    });
});
