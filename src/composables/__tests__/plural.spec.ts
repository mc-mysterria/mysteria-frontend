import {afterEach, describe, expect, it} from "vitest";
import {applyLanguage, useI18n} from "@/composables/useI18n";

const forms = {one: "one", few: "few", many: "many"};

describe("locale plural rules", () => {
    afterEach(() => applyLanguage("en"));

    it("uses Romanian's one/few/many cases", () => {
        applyLanguage("ro");
        const {plural} = useI18n();

        expect([0, 1, 2, 19, 20, 101].map(count => plural(count, forms)))
            .toEqual(["few", "one", "few", "few", "many", "many"]);
    });

    it("keeps the one/many rule for the other new Latin-script locales", () => {
        for (const language of ["de", "es", "fr"] as const) {
            applyLanguage(language);
            const {plural} = useI18n();
            expect(plural(1, forms), language).toBe("one");
            expect(plural(2, forms), language).toBe("many");
        }
    });
});
