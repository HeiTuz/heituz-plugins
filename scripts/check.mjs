#!/usr/bin/env node
// Validate both catalogs: same plugins in the same order, identical pins, and pins that exist upstream.
//   node scripts/check.mjs [--offline]
import { CODEX, CLAUDE, readJson, resolveTag } from "./bump.mjs";

const offline = process.argv.includes("--offline");
const problems = [];
const codex = readJson(CODEX);
const claude = readJson(CLAUDE);
if (codex.name !== "heituz" || claude.name !== "heituz") problems.push("marketplace name must be heituz in both catalogs");
if (!claude.owner?.name) problems.push("Claude catalog needs owner.name");
const names = (catalog) => catalog.plugins.map((plugin) => plugin.name);
if (JSON.stringify(names(codex)) !== JSON.stringify(names(claude))) problems.push("plugin lists differ: " + names(codex) + " vs " + names(claude));
for (const entry of codex.plugins) {
  const twin = claude.plugins.find((plugin) => plugin.name === entry.name);
  if (!/^[a-z0-9][a-z0-9-]*$/u.test(entry.name)) problems.push(entry.name + ": invalid plugin name");
  for (const key of ["policy", "category"]) if (!(key in entry)) problems.push(entry.name + ": Codex entry lacks " + key);
  if (!entry.policy?.installation || !entry.policy?.authentication) problems.push(entry.name + ": policy needs installation and authentication");
  if (!twin) continue;
  if (!twin.description) problems.push(entry.name + ": Claude entry lacks description");
  const a = entry.source; const b = twin.source;
  if (typeof a !== "object" || typeof b !== "object") continue;
  for (const key of ["source", "url", "path", "ref", "sha"]) if (a[key] !== b[key]) problems.push(entry.name + ": source." + key + " differs between catalogs");
  if (a.source === "git-subdir") {
    if (!/^[0-9a-f]{40}$/u.test(a.sha || "")) problems.push(entry.name + ": sha must be a 40-character commit");
    if (!a.ref || a.ref === "main") problems.push(entry.name + ": ref must be a release tag");
    if (!offline && /^[0-9a-f]{40}$/u.test(a.sha || "")) {
      try {
        const upstream = resolveTag(a.url, a.ref);
        if (upstream !== a.sha) problems.push(entry.name + ": " + a.ref + " points to " + upstream + ", catalog pins " + a.sha);
      } catch (error) { problems.push(entry.name + ": " + error.message); }
    }
  }
}
if (problems.length) {
  for (const problem of problems) console.error("  " + problem);
  process.exit(1);
}
console.log("catalogs OK (" + codex.plugins.length + " plugin" + (codex.plugins.length === 1 ? "" : "s") + (offline ? ", offline" : ", pins verified upstream") + ")");
