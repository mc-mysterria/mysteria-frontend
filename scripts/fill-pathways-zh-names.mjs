/*
 * Fills the Sequence names that scripts/seed-pathways-zh.mjs deliberately left
 * blank, in two clearly separate groups.
 *
 * GROUP 1 - canonical rungs Mysterria renamed in English.
 * Mysterria's English drifted from the novel (a typo, a synonym, or a rewrite),
 * but the rung itself is canonical, so the Chinese is still the novel's word.
 * Each entry records what Mysterria calls it and why the canon name still wins.
 * The Darkness pathway is the significant case: all nine rungs were renamed, so
 * shipping canon Chinese means the Chinese ladder will not read as a
 * translation of the English one. See README-i18n.md.
 *
 * GROUP 2 - boon pathways. These are Outer God (外神) routes from the novel, not
 * Mysterria inventions: the 22 are the Primordial Creator's routes plus six taken
 * from Outer Gods, and the Outer Gods have many more of their own. The names below
 * are therefore PROVISIONAL TRANSLATIONS standing in for canon nobody has looked
 * up yet. Confirmed so far: devouring belongs to 原初饥饿 (its Gourmet really is
 * 美食家) and aeon to 宿命之环 (whose Dancer looks like 舞蹈家, not 舞者).
 * Everything here needs a native pass - see i18n/checklist.boon-pathways.md.
 *
 * Run: node scripts/fill-pathways-zh-names.mjs
 */
import {readJson, writeJson} from "./lib/repo.mjs";

const FILE = "src/assets/sources/pathways.zh-CN.json";
const data = readJson(FILE);

/* ---- Group 1: canonical rungs, Mysterria's English differs ---- */
const CANON_RENAMED = {
    abyss: {1: "污秽君王"},                 // "Flithy Monarch" - typo of Filthy Monarch
    priest: {4: "铁血骑士"},                // "Iron-bloodied" - typo of Iron-blooded
    death: {6: "死灵导师"},                 // "Spirit Guide" - synonym of Mentor of Spirits
    hermit: {5: "星象师", 3: "预言大师"},    // "Constellations Master", "Clairvoyant"
    paragon: {6: "机械专家"},               // "Artisan"
    fortune: {
        7: "幸运儿",                        // "Lucky 1"
        5: "赢家",                          // "Lucky 1" again - English data bug, canon rung is Winner
    },
    // Whole ladder renamed in English. Canon names shipped per the terminology
    // policy; flagged for review because it diverges from the English ladder.
    darkness: {
        9: "不眠者",   // en: Shadow Wanderer
        8: "午夜诗人", // en: Night Singer
        7: "梦魇",     // en: Nightmare Weaver
        6: "安魂师",   // en: Keeper of Souls
        5: "灵巫",     // en: Lord of Spirits
        4: "守夜人",   // en: Harbinger of Twilight
        3: "恐惧主教", // en: Endless Night
        2: "隐秘之仆", // en: Eternal Darkness
        1: "厄难骑士", // en: Lord of the Void
    },
};

/* ---- Group 2: boon pathways (Outer God routes) - PROVISIONAL, needs canon ---- */
const BOONS = {
    aeon: {9: "舞者", 8: "化缘僧", 7: "契约者", 6: "苦修者", 5: "织命人"},
    chaos: {9: "恶徒", 8: "园丁", 7: "异端咒师", 6: "播种者", 5: "报丧女妖"},
    chaosmist: {9: "经纪人", 8: "暗影商人", 7: "检察官", 6: "野心家", 5: "台面之下"},
    condenser: {9: "天文爱好者", 8: "星辰信徒", 7: "献星者", 6: "领航者", 5: "潮汐学者"},
    devouring: {9: "流浪汉", 8: "暴食者", 7: "美食家", 6: "厨师", 5: "剥夺者"},
    edict: {9: "无梦者", 8: "乐师", 7: "窥命者", 6: "缄默者", 5: "亡者"},
    everlasting: {9: "入门者", 8: "评述者", 7: "演说家", 6: "歌者", 5: "密传者"},
    // "Ex Saddict" is unclear in the source data - the Ukrainian locale simply
    // transliterated it. 戒断者 ("one in withdrawal") follows the mechanic:
    // isolation stacks lethal debuffs until you find another player.
    patriarch: {9: "吝啬鬼", 8: "戒断者", 7: "演员", 6: "受赠者", 5: "倒木之灵"},
    secondlaw: {9: "带菌者", 8: "接种者", 7: "瘟疫医生", 6: "疫病学者", 5: "大疫贤者"},
    sublunary: {9: "萨满", 8: "记者", 7: "画家", 6: "文学爱好者", 5: "小妖精"},
};

let filled = 0;
let skipped = 0;

for (const group of [CANON_RENAMED, BOONS]) {
    for (const [pathway, rungs] of Object.entries(group)) {
        data.sequences[pathway] ??= {};
        for (const [sequence, name] of Object.entries(rungs)) {
            if (data.sequences[pathway][sequence]) {
                skipped++;
                continue;
            }
            data.sequences[pathway][sequence] = name;
            filled++;
        }
    }
}

/* Sequence keys read best high-to-low, the way the ladder is displayed. */
for (const pathway of Object.keys(data.sequences)) {
    const rungs = data.sequences[pathway];
    data.sequences[pathway] = Object.fromEntries(
        Object.keys(rungs).sort((a, b) => Number(b) - Number(a)).map(key => [key, rungs[key]]),
    );
}

writeJson(FILE, data);
console.log(`filled ${filled} sequence name(s), left ${skipped} existing untouched`);
