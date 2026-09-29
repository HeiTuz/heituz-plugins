#!/usr/bin/env node
// Pin a plugin to a release tag in both catalogs, or add a new plugin entry.
//   node scripts/bump.mjs <plugin> <tag>
//   node scripts/bump.mjs <plugin> <tag> --url <git url> --path ./plugins/<plugin> --description "<text>" [--category Productivity]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const CODEX = path.join(root, ".agents", "plugins", "marketplace.json");
export const CLAUDE = path.join(root, ".claude-plugin", "marketplace.json");

export function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n"); }

export function resolveTag(url, tag) {
  const result = spawnSync("git", ["ls-remote", url, "refs/tags/" + tag, "refs/tags/" + tag + "^{}"], { encoding: "utf8" });
  if (result.status !== 0) throw new Error("git ls-remote failed for " + url + ": " + result.stderr);
  const lines = result.stdout.trim().split("\n").filter(Boolean).map((line) => line.split("\t"));
  const peeled = lines.find(([, ref]) => ref.endsWith("^{}")) || lines[0];
  if (!peeled) throw new Error("tag " + tag + " not found in " + url);
  return peeled[0];
}

function parse(argv) {
  const [name, tag, ...rest] = argv;
  if (!name || !tag) throw new Error("usage: bump.mjs <plugin> <tag> [--url <git url> --path <dir> --description <text> --category <name>]");
  const opts = { name, tag };
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i].replace(/^--/u, "");
    if (!["url", "path", "description", "category"].includes(key) || rest[i + 1] === undefined) throw new Error("bad option " + rest[i]);
    opts[key] = rest[i + 1];
  }
  return opts;
}

function main() {
  const opts = parse(process.argv.slice(2));
  const codex = readJson(CODEX);
  const claude = readJson(CLAUDE);
  let codexEntry = codex.plugins.find((plugin) => plugin.name === opts.name);
  let claudeEntry = claude.plugins.find((plugin) => plugin.name === opts.name);
  if (!codexEntry || !claudeEntry) {
    if (codexEntry || claudeEntry) throw new Error(opts.name + " exists in only one catalog; fix that first");
    if (!opts.url || !opts.path || !opts.description) throw new Error("adding " + opts.name + " needs --url, --path and --description");
    const category = opts.category || "Productivity";
    codexEntry = { name: opts.name, source: { source: "git-subdir", url: opts.url, path: opts.path }, policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" }, category };
    claudeEntry = { name: opts.name, source: { source: "git-subdir", url: opts.url, path: opts.path }, description: opts.description, category: category.toLowerCase() };
    codex.plugins.push(codexEntry);
    claude.plugins.push(claudeEntry);
  }
  const url = opts.url || codexEntry.source.url;
  const sha = resolveTag(url, opts.tag);
  for (const entry of [codexEntry, claudeEntry]) {
    entry.source.url = url;
    if (opts.path) entry.source.path = opts.path;
    entry.source.ref = opts.tag;
    entry.source.sha = sha;
  }
  writeJson(CODEX, codex);
  writeJson(CLAUDE, claude);
  console.log("pinned " + opts.name + " to " + opts.tag + " (" + sha + ")");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error("bump: " + error.message); process.exitCode = 1; }
}
