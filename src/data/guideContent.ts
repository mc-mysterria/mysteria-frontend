/*
 * Guide registry. The copy itself lives in src/data/guide/<code>.ts, one file
 * per locale, mirroring how src/locales/ is laid out.
 *
 * en and uk are authored. zh-CN is authored and zh-TW is GENERATED from it by
 * scripts/build-zh-tw.mjs - never edit src/data/guide/zh-TW.ts by hand.
 */
import type {Language} from "@/locales";
import en from "./guide/en";
import uk from "./guide/uk";
import zhCN from "./guide/zh-CN";
import zhTW from "./guide/zh-TW";
import type {GuideContent} from "./guide/types";

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

/*
 * Total, not Partial: every locale has a guide, and typing it that way is the
 * only thing that will flag a locale added to `Language` but not translated
 * here. A Partial plus a `?? en` fallback silently accepted that instead.
 */
export const guideContent: Record<Language, GuideContent> = {
    en,
    uk,
    "zh-CN": zhCN,
    "zh-TW": zhTW,
};

export const guideFor = (language: Language): GuideContent => guideContent[language];
