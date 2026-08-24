/*
 * Guide registry. The copy itself lives in src/data/guide/<code>.json, one file
 * per locale, mirroring how src/locales/ is laid out.
 *
 * en and uk are authored. zh-CN is authored and zh-TW is GENERATED from it by
 * scripts/build-zh-tw.mjs - never edit src/data/guide/zh-TW.json by hand.
 *
 * The copy is JSON rather than TypeScript so Crowdin can read and write it in
 * place; see crowdin.yml.
 */
import type {Language} from "@/locales";
import en from "./guide/en.json";
import uk from "./guide/uk.json";
import zhCN from "./guide/zh-CN.json";
import zhTW from "./guide/zh-TW.json";
import type {GuideContent, Jsonified} from "./guide/types";

export type {
    GuideCategory,
    GuideChoice,
    GuideCommand,
    GuideContent,
    GuideDirection,
    GuideExpectation,
    GuideFact,
    GuideStep,
    GuideTask,
    GuideTopic,
    GuideTopicSection,
} from "./guide/types";

/**
 * Re-narrows `category` from `string` back to `GuideCategory`. The parameter
 * type is what does the work: the whole tree is still shape-checked, so a
 * locale with a missing or misspelt field fails here.
 */
const asGuide = (raw: Jsonified<GuideContent>): GuideContent => raw as GuideContent;

/*
 * Total, not Partial: every locale has a guide, and typing it that way is the
 * only thing that will flag a locale added to `Language` but not translated
 * here. A Partial plus a `?? en` fallback silently accepted that instead.
 */
export const guideContent: Record<Language, GuideContent> = {
    en: asGuide(en),
    uk: asGuide(uk),
    "zh-CN": asGuide(zhCN),
    "zh-TW": asGuide(zhTW),
};

export const guideFor = (language: Language): GuideContent => guideContent[language];
