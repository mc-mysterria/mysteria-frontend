import source from "@/assets/sources/pathway-abilities.json";
import zhCNOverlay from "@/assets/sources/pathways.zh-CN.json";
import zhTWOverlay from "@/assets/sources/pathways.zh-TW.json";
import type {Language} from "@/locales";

/**
 * A string in every locale that has one. English is required and acts as the
 * fallback, so a locale can be added to the data incrementally without every
 * call site having to handle a missing value.
 */
export type Localized = { en: string } & Partial<Record<Language, string>>;

/** Reads a localized string, falling back to English. */
export const pick = (value: Localized, language: Language): string => value[language] || value.en;
export type Ability = { id: string; name: Localized; description: Localized };
export type Sequence = { sequence: number; name: Localized; abilities: Ability[] };
export type Pathway = { id: string; sequences: Sequence[] };

/*
 * Chinese pathway text lives in a separate overlay rather than inside
 * pathway-abilities.json, because that file is re-exported from the Circle of
 * Imagination plugin and would drop any locale added to it. The overlays are
 * keyed by pathway id / Sequence number / ability id and folded in here, once,
 * at module load - so every accessor below stays locale-agnostic.
 *
 * An overlay entry that is missing simply leaves English in place; `pick()`
 * handles the fallback.
 */
interface PathwayOverlay {
    sequenceRanks?: Record<string, string>;
    pathwayNames?: Record<string, string>;
    deityNames?: Record<string, string>;
    sequences?: Record<string, Record<string, string>>;
    abilities?: Record<string, Record<string, Record<string, { name?: string; description?: string }>>>;
}

const OVERLAYS: Partial<Record<Language, PathwayOverlay>> = {
    "zh-CN": zhCNOverlay as PathwayOverlay,
    "zh-TW": zhTWOverlay as PathwayOverlay,
};

function mergeOverlays(raw: Pathway[]): Pathway[] {
    return raw.map(pathway => ({
        ...pathway,
        sequences: pathway.sequences.map(sequence => {
            const key = String(sequence.sequence);

            const name: Localized = {...sequence.name};
            const abilities = sequence.abilities.map(ability => ({
                ...ability,
                name: {...ability.name} as Localized,
                description: {...ability.description} as Localized,
            }));

            for (const [language, overlay] of Object.entries(OVERLAYS) as Array<[Language, PathwayOverlay]>) {
                const sequenceName = overlay.sequences?.[pathway.id]?.[key];
                if (sequenceName) name[language] = sequenceName;

                const overlaid = overlay.abilities?.[pathway.id]?.[key];
                if (!overlaid) continue;
                for (const ability of abilities) {
                    const entry = overlaid[ability.id];
                    if (entry?.name) ability.name[language] = entry.name;
                    if (entry?.description) ability.description[language] = entry.description;
                }
            }

            return {...sequence, name, abilities};
        }),
    }));
}

export const pathways = mergeOverlays(source.pathways as Pathway[]);
/** ISO date the ability data was last regenerated from the plugin. */
export const pathwaysLastUpdated = source.lastUpdated as string;
/** Sigil file names that do not match the pathway id. */
export const pathwayAliases: Record<string, string> = {aeon: "eternalaeon"};

/**
 * Boon pathways are supplementary routes, not part of the canonical 22 the site
 * advertises. Same split PathwaysView uses for its browser groups.
 */
export const boonPathwayIds = new Set([
    "aeon",
    "chaos",
    "chaosmist",
    "condenser",
    "devouring",
    "edict",
    "everlasting",
    "patriarch",
    "secondlaw",
    "sublunary",
]);

/** The 22 canonical pathways, in source order. */
export const corePathways = pathways.filter(pathway => !boonPathwayIds.has(pathway.id));

const pathwayNames: Record<string, string> = {
    abyss: "Abyss",
    chained: "Chained",
    darkness: "Darkness",
    death: "Death",
    demoness: "Demoness",
    door: "Door",
    emperor: "Black Emperor",
    error: "Error",
    fool: "Fool",
    fortune: "Wheel of Fortune",
    giant: "Twilight Giant",
    hanged: "Hanged Man",
    hermit: "Hermit",
    justiciar: "Justiciar",
    moon: "Moon",
    mother: "Mother",
    paragon: "Paragon",
    priest: "Red Priest",
    sun: "Sun",
    tower: "White Tower",
    tyrant: "Tyrant",
    visionary: "Visionary",
    aeon: "Eternal Aeon",
    chaos: "Chaos",
    chaosmist: "Chaos Mist",
    condenser: "Condenser",
    devouring: "Devouring",
    edict: "Edict",
    everlasting: "Everlasting",
    patriarch: "Patriarch",
    secondlaw: "Second Law",
    sublunary: "Sublunary",
};

const pathwayNamesUk: Record<string, string> = {
    abyss: "Безодня",
    chained: "Прикутий",
    darkness: "Темрява",
    death: "Смерть",
    demoness: "Демонеса",
    door: "Двері",
    emperor: "Чорний Імператор",
    error: "Помилка",
    fool: "Дурень",
    fortune: "Колесо Фортуни",
    giant: "Сутінковий Велетень",
    hanged: "Повішений",
    hermit: "Відлюдник",
    justiciar: "Юстиціар",
    moon: "Місяць",
    mother: "Мати",
    paragon: "Парагон",
    priest: "Червоний Жрець",
    sun: "Сонце",
    tower: "Біла Вежа",
    tyrant: "Тиран",
    visionary: "Візіонер",
    aeon: "Вічний Еон",
    patriarch: "Патріарх",
    sublunary: "Підмісячний",
};

const images = import.meta.glob("/src/assets/images/pathways/*.webp", {
    eager: true,
    query: "?url",
    import: "default",
}) as Record<string, string>;

export const titleCase = (id: string) =>
    id.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, character => character.toUpperCase());

/** Sigil file name for a pathway id, for building absolute asset URLs. */
export function pathwayImageName(id: string): string {
    const key = id.toLowerCase();
    return pathwayAliases[key] || key;
}

/**
 * Per-locale pathway labels. English is the fallback for every other locale.
 *
 * The Chinese labels are the canonical *Sequence 9* names, because that is how
 * Chinese names a pathway: English "Fool pathway" is 占卜家途径 (Seer pathway).
 * The Sequence 0 name is the god at the summit, not the route - see `deityName`.
 *
 * Ukrainian has its own table; the Chinese names are read straight out of
 * OVERLAYS rather than copied into a second locale->data map, so there is one
 * place a locale's pathway data is registered.
 */
export function pathwayName(id: string, language: Language = "en"): string {
    const key = id.toLowerCase();
    const localized = language === "uk" ? pathwayNamesUk[key] : OVERLAYS[language]?.pathwayNames?.[key];
    return localized || pathwayNames[key] || titleCase(key);
}

/**
 * The Sequence 0 deity title for a pathway.
 *
 * In English the pathway and its god share a name ("Fool"), so this is just the
 * pathway name. In Chinese they differ - the 占卜家 pathway is crowned by 愚者 -
 * and the Ascension registry needs the god's name for the Sequence 0 throne.
 * Boon pathways stop at Sequence 5 and have no deity, so they fall back to the
 * label.
 */
export function deityName(id: string, language: Language = "en"): string {
    return OVERLAYS[language]?.deityNames?.[id.toLowerCase()] || pathwayName(id, language);
}

export function pathwayImage(id: string): string | undefined {
    const key = id.toLowerCase();
    return images[`/src/assets/images/pathways/${pathwayAliases[key] || key}.webp`];
}

export function pathwayById(id: string): Pathway | undefined {
    return pathways.find(pathway => pathway.id === id.toLowerCase());
}

/**
 * Sequence rungs 9 → 0 for a pathway, localized. Pathways that stop short of
 * Sequence 0 simply return fewer rungs.
 */
export function pathwayLadder(id: string, language: Language = "en"): Array<{ sequence: number; name: string }> {
    const pathway = pathwayById(id);
    if (!pathway) return [];
    return [...pathway.sequences]
        .sort((a, b) => b.sequence - a.sequence)
        .map(sequence => ({
            sequence: sequence.sequence,
            name: pick(sequence.name, language),
        }));
}

/**
 * Server-enforced seat caps for the high Sequences: at most this many
 * Beyonders per pathway may hold each rung at once. Mirrors catwalk config.
 */
export const HIGH_SEAT_LIMITS: Record<number, number> = {0: 1, 1: 3, 2: 9, 3: 18};

/** Divine rank titles for Sequences 4-0, shared by the archive and the registry. */
const sequenceRankNames: Record<"en" | "uk", Record<number, string>> = {
    en: {4: "Demigod", 3: "Saint", 2: "Angel", 1: "Archangel", 0: "Deity"},
    uk: {4: "Напівбог", 3: "Святий", 2: "Янгол", 1: "Архангел", 0: "Божество"},
};

export function sequenceRank(n: number, language: Language = "en"): string {
    if (n < 0 || n > 4) return "";
    const localized = language === "uk"
        ? sequenceRankNames.uk[n]
        : OVERLAYS[language]?.sequenceRanks?.[String(n)];
    return localized || sequenceRankNames.en[n];
}

/** Sequence 9 role name - used for the "SEQ 9 · SEER" tarot labels. */
export function sequenceNineName(id: string, language: Language = "en"): string {
    const rung = pathwayById(id)?.sequences.find(sequence => sequence.sequence === 9);
    if (!rung) return "";
    return pick(rung.name, language);
}
