/*
 * Shared plumbing for the scripts in this directory.
 *
 * Every script here needs the repo root, a path joiner, and read/write helpers
 * for the JSON data files. Each used to declare its own, which drifted: two
 * scripts exported a `readJson` taking a repo-relative path while a third took
 * an absolute one, under the same name. The write convention
 * (`JSON.stringify(x, null, 2)` plus a trailing newline) was spelled out in four
 * places, so changing it meant a noisy diff across every generated file.
 */
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

/** Repository root, resolved from this file rather than the cwd. */
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Joins repo-relative segments into an absolute path. */
export const p = (...parts) => path.join(root, ...parts);

/** Reads a JSON file. The path is repo-relative - always, in every script. */
export const readJson = file => JSON.parse(fs.readFileSync(p(file), "utf8"));

/** True if a repo-relative path exists. */
export const exists = file => fs.existsSync(p(file));

/**
 * Writes a JSON file in the repo's house style: two-space indent and a trailing
 * newline, so a regenerated file diffs against the committed one cleanly.
 */
export const writeJson = (file, value) =>
    fs.writeFileSync(p(file), `${JSON.stringify(value, null, 2)}\n`, "utf8");

/**
 * Normalises an English rung name for comparison: case-folded, punctuation
 * flattened to single spaces. Used to decide whether Mysterria's English name
 * for a Sequence still matches the novel's, which is what tells the seeder to
 * leave a rung blank and the canon report to flag it. The two must agree, so
 * they share this.
 */
export const norm = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
