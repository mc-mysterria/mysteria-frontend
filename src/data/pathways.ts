import source from "@/assets/sources/pathway-abilities.json";
import type {Language} from "@/composables/useI18n";

export type Localized = { en: string; uk: string };
export type Ability = { id: string; name: Localized; description: Localized };
export type Sequence = { sequence: number; name: Localized; abilities: Ability[] };
export type Pathway = { id: string; sequences: Sequence[] };

export const pathways = source.pathways as Pathway[];
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

export const pathwayNames: Record<string, string> = {
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

export const pathwayNamesUk: Record<string, string> = {
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

export function pathwayName(id: string, language: Language = "en"): string {
    const key = id.toLowerCase();
    if (language === "uk") return pathwayNamesUk[key] || pathwayNames[key] || titleCase(key);
    return pathwayNames[key] || titleCase(key);
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
            name: sequence.name[language] || sequence.name.en,
        }));
}

/**
 * Server-enforced seat caps for the high Sequences: at most this many
 * Beyonders per pathway may hold each rung at once. Mirrors catwalk config.
 */
export const HIGH_SEAT_LIMITS: Record<number, number> = {0: 1, 1: 3, 2: 9, 3: 18};

/** Divine rank titles for Sequences 4–0, shared by the archive and the registry. */
export const sequenceRankNames = {
    en: {4: "Demigod", 3: "Saint", 2: "Angel", 1: "Archangel", 0: "Deity"},
    uk: {4: "Напівбог", 3: "Святий", 2: "Янгол", 1: "Архангел", 0: "Божество"},
} as const;

export function sequenceRank(n: number, language: Language = "en"): string {
    return n <= 4 && n >= 0 ? sequenceRankNames[language][n as keyof typeof sequenceRankNames.en] : "";
}

/** Sequence 9 role name - used for the "SEQ 9 · SEER" tarot labels. */
export function sequenceNineName(id: string, language: Language = "en"): string {
    const rung = pathwayById(id)?.sequences.find(sequence => sequence.sequence === 9);
    if (!rung) return "";
    return rung.name[language] || rung.name.en;
}
