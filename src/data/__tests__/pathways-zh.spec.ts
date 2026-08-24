import {describe, expect, it} from "vitest";
import {
    deityName,
    pathwayLadder,
    pathwayName,
    pathways,
    pick,
    sequenceNineName,
    sequenceRank,
} from "@/data/pathways";
import {LANGUAGES} from "@/locales";

describe("Chinese pathway data", () => {
    /*
     * These are the strings the source fandom will judge the server on, so they
     * are asserted literally rather than "is not empty". If the overlay wiring
     * breaks, these fail loudly instead of quietly falling back to English.
     *
     * Chinese names a pathway after its SEQUENCE 9, English after its Sequence 0.
     * English "Fool pathway" is 占卜家途径 (Seer pathway); 愚者 is the god at the
     * summit, not the route. Confirmed by a native reader and by the Chinese LOTM
     * wiki, which files this route under 占卜家途径.
     */
    it("labels pathways by their canonical Sequence 9 name", () => {
        expect(pathwayName("fool", "zh-CN")).toBe("占卜家");
        expect(pathwayName("fool", "zh-TW")).toBe("占卜家");
        expect(pathwayName("tower", "zh-CN")).toBe("阅读者");
        expect(pathwayName("fortune", "zh-TW")).toBe("怪物");
        expect(pathwayName("visionary", "zh-CN")).toBe("观众");
        expect(pathwayName("paragon", "zh-CN")).toBe("通识者");
        expect(pathwayName("chained", "zh-CN")).toBe("囚犯");

        // English is unaffected: it names the route after its Sequence 0.
        expect(pathwayName("fool", "en")).toBe("Fool");
        expect(pathwayName("tower", "en")).toBe("White Tower");
    });

    it("keeps the Sequence 0 deity title separate from the pathway label", () => {
        expect(deityName("fool", "zh-CN")).toBe("愚者");
        expect(deityName("fool", "zh-TW")).toBe("愚者");
        expect(deityName("tower", "zh-CN")).toBe("白塔");
        expect(deityName("chained", "zh-TW")).toBe("被縛者");

        // The two must never collapse for a canonical pathway - that was the bug.
        for (const id of ["fool", "tower", "visionary", "paragon", "chained", "fortune"]) {
            expect(deityName(id, "zh-CN")).not.toBe(pathwayName(id, "zh-CN"));
        }

        // In English the god and the route share a name, so deityName is a no-op.
        expect(deityName("fool", "en")).toBe(pathwayName("fool", "en"));

        // Boon pathways stop at Sequence 5 and have no deity; fall back to the label.
        expect(deityName("aeon", "zh-CN")).toBe(pathwayName("aeon", "zh-CN"));
    });

    /*
     * Boon pathways are Outer God (外神) routes from the novel, so their labels are
     * the Outer God's own canon name rather than a translation of Mysterria's
     * English. That also distinguishes them at a glance from the 22, which are
     * labelled by their Sequence 9 rung.
     */
    it("labels boon pathways with their Outer God's canon name", () => {
        expect(pathwayName("aeon", "zh-CN")).toBe("宿命之环");
        expect(pathwayName("devouring", "zh-CN")).toBe("原初饥饿");
        expect(pathwayName("secondlaw", "zh-CN")).toBe("衰败君王");
        expect(pathwayName("sublunary", "zh-TW")).toBe("高維俯視者");
    });

    /*
     * Mysterria's English boon ladders turn out to be direct translations of the
     * canon Chinese ones - 34 of 35 rungs line up position for position - so these
     * are canon lookups, not translation choices. Asserted literally because the
     * source fandom will judge the server on them.
     */
    it("uses the novel's canonical boon Sequence names", () => {
        expect(pathwayLadder("aeon", "zh-CN").map(rung => rung.name))
            .toEqual(["舞蹈家", "托钵僧侣", "受契之人", "苦修士", "猎命师"]);
        expect(pathwayLadder("chaosmist", "zh-CN").map(rung => rung.name))
            .toEqual(["掮客", "阴影商人", "公诉人", "野心家", "暗箱"]);
        expect(pathwayLadder("devouring", "zh-CN").map(rung => rung.name))
            .toEqual(["流浪汉", "贪吃者", "美食家", "厨师", "剥夺者"]);

        // Sequence 0 of 欲望母树 is 主父, which is what Mysterria's English
        // label "Patriarch" names - the pathway itself is 吝啬鬼 at Sequence 9.
        expect(pathwayLadder("patriarch", "zh-CN")[0].name).toBe("吝啬鬼");
    });

    /*
     * Two boon ladders are SHUFFLED against canon: the novel puts 瘟疫医生 at
     * Sequence 9 and 画家 at Sequence 9, where Mysterria puts Carrier and Shaman.
     * The canon words are therefore used at Mysterria's own positions, and mapping
     * boon rungs by sequence number would be wrong.
     */
    it("places canon boon rungs at Mysterria's positions, not canon's", () => {
        const secondlaw = pathwayLadder("secondlaw", "zh-CN");
        expect(secondlaw.find(rung => rung.sequence === 9)?.name).toBe("带菌者");
        expect(secondlaw.find(rung => rung.sequence === 7)?.name).toBe("瘟疫医生");

        const sublunary = pathwayLadder("sublunary", "zh-CN");
        expect(sublunary.find(rung => rung.sequence === 7)?.name).toBe("画家");
        expect(sublunary.find(rung => rung.sequence === 5)?.name).toBe("妖精");
    });

    it("uses the novel's canonical Sequence names", () => {
        const fool = pathwayLadder("fool", "zh-CN").map(rung => rung.name);
        expect(fool).toEqual([
            "占卜家", "小丑", "魔术师", "无面人", "秘偶大师",
            "诡法师", "古代学者", "奇迹师", "诡秘侍者",
        ]);
    });

    it("keeps 面 as face, not noodles, after Traditional conversion", () => {
        // opencc s2twp renders 无面人 as 無麵人 without the override in
        // i18n/zh-TW.overrides.json. Guard the fix.
        const faceless = pathwayLadder("fool", "zh-TW").find(rung => rung.sequence === 6);
        expect(faceless?.name).toBe("無面人");
    });

    it("localizes the divine rank titles", () => {
        expect(sequenceRank(4, "zh-CN")).toBe("半神");
        expect(sequenceRank(0, "zh-CN")).toBe("神灵");
        expect(sequenceRank(3, "zh-TW")).toBe("聖者");
        expect(sequenceRank(0, "zh-TW")).toBe("神靈");
    });

    it("localizes Sequence 9 role names used on the tarot cards", () => {
        expect(sequenceNineName("fool", "zh-CN")).toBe("占卜家");
        expect(sequenceNineName("death", "zh-TW")).toBe("收屍人");
    });

    it("has a name and description in both Chinese locales for every ability", () => {
        const missing: string[] = [];

        for (const pathway of pathways) {
            for (const sequence of pathway.sequences) {
                for (const ability of sequence.abilities) {
                    for (const language of ["zh-CN", "zh-TW"] as const) {
                        if (!ability.name[language]) missing.push(`${pathway.id}:${ability.id} name ${language}`);
                        if (!ability.description[language]) {
                            missing.push(`${pathway.id}:${ability.id} description ${language}`);
                        }
                    }
                }
            }
        }

        expect(missing).toEqual([]);
    });

    it("never leaves a Simplified-only character in the Traditional data", () => {
        // A sample of characters with distinct Traditional forms. Finding one
        // means the conversion missed a string.
        const simplifiedOnly = /[这个国说话让为门开关东车马达发无爱见错误练]/u;
        const offenders: string[] = [];

        for (const pathway of pathways) {
            for (const sequence of pathway.sequences) {
                const values = [
                    sequence.name["zh-TW"],
                    ...sequence.abilities.flatMap(a => [a.name["zh-TW"], a.description["zh-TW"]]),
                ];
                for (const value of values) {
                    if (value && simplifiedOnly.test(value)) offenders.push(`${pathway.id}: ${value}`);
                }
            }
        }

        expect(offenders).toEqual([]);
    });

    it("falls back to English when a locale is absent, and uses it when present", () => {
        // Every locale currently has ability text, so the fallback is exercised
        // against a value that deliberately omits one.
        expect(pick({en: "Criminal Proficiency"}, "zh-CN")).toBe("Criminal Proficiency");
        expect(pick({en: "Divination", uk: "Ворожіння"}, "zh-TW")).toBe("Divination");
        expect(pick({en: "Divination", "zh-CN": "占卜"}, "zh-CN")).toBe("占卜");

        // And the source file's own Ukrainian text is preserved, not overwritten
        // by the Chinese overlay merge.
        const criminal = pathways
            .find(p => p.id === "abyss")!
            .sequences.find(s => s.sequence === 9)!;
        expect(pick(criminal.abilities[0].name, "uk")).toBe("Майстерність Злочинця");
    });

    it("resolves a name for every pathway in every locale", () => {
        for (const pathway of pathways) {
            for (const language of LANGUAGES) {
                expect(pathwayName(pathway.id, language), `${pathway.id} ${language}`).toBeTruthy();
            }
        }
    });
});

describe("Ukrainian pathway data", () => {
    /*
     * The Ukrainian labels used to live in a private table inside pathways.ts.
     * They moved to pathways.uk.json so api/meta-proxy.ts could serve them in
     * link previews, and pathwayName() lost its `language === "uk"` special
     * case. These assert the overlay is actually wired up, since a broken
     * registration would silently fall back to English.
     */
    it("labels pathways from the Ukrainian overlay", () => {
        expect(pathwayName("fool", "uk")).toBe("Блазень");
        expect(pathwayName("tower", "uk")).toBe("Біла Вежа");
        expect(pathwayName("visionary", "uk")).toBe("Провидець");
        expect(pathwayName("emperor", "uk")).toBe("Чорний Імператор");
    });

    it("leaves English in place for a pathway the overlay omits", () => {
        // Boon pathways were never translated; that is the existing behaviour.
        expect(pathwayName("secondlaw", "uk")).toBe("Second Law");
        expect(pathwayName("chaos", "uk")).toBe("Chaos");
    });

    it("shares the pathway label with the Sequence 0 deity", () => {
        // Unlike Chinese, Ukrainian names the route after its god, as English does.
        expect(deityName("fool", "uk")).toBe(pathwayName("fool", "uk"));
        expect(deityName("tower", "uk")).toBe(pathwayName("tower", "uk"));
    });

    it("keeps Ukrainian Sequence names, which ship in the source file", () => {
        // The overlay has no `sequences` block, so these must survive the merge -
        // it is what the proxy reads for Ukrainian pathway previews.
        expect(pathwayLadder("fool", "uk")[0].name).toBe("Провидець");
        expect(pathwayLadder("tower", "uk")[0].name).toBe("Читець");
    });
});
