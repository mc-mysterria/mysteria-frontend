/**
 * The season currently being played. Season II opened on the date below, so the
 * hero's countdown cell stays retired until a future season is announced — set
 * SEASON_START to that future date to bring the countdown back automatically.
 */
export const SEASON_NUMERAL = "II";
export const SEASON_START = new Date("2026-08-15T00:00:00Z");

/** News slug the announcement bar links to. Empty string falls back to /news. */
export const SEASON_ANNOUNCEMENT_SLUG = "the-great-reset";

export function daysUntilSeason(now: Date = new Date()): number {
    const diff = SEASON_START.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / 86_400_000));
}

/** True once the season has opened — the countdown is meaningless after that. */
export function seasonHasBegun(now: Date = new Date()): boolean {
    return now.getTime() >= SEASON_START.getTime();
}
