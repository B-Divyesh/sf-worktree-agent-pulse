import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

let [tag, sourceCommit] = process.argv.slice(2);
if (!tag) {
  throw new Error("Usage: npm run test:release-provenance -- <tag> [40-character-source-commit]");
}
sourceCommit ??= execFileSync("git", ["rev-parse", `${tag}^{commit}`], { encoding: "utf8" }).trim();
if (!/^[0-9a-f]{40}$/i.test(sourceCommit)) throw new Error("Expected a 40-character source commit");

const repository = "B-Divyesh/sf-worktree-agent-pulse";
const api = `https://api.github.com/repos/${repository}/releases/tags/${encodeURIComponent(tag)}`;
const headers = { Accept: "application/vnd.github+json" };
const response = await fetch(api, { headers });
if (!response.ok) throw new Error(`Release ${tag} returned HTTP ${response.status}`);
const release = await response.json();
if (release.target_commitish !== sourceCommit) {
  throw new Error(`Release ${tag} targets ${release.target_commitish}, expected ${sourceCommit}`);
}

const assetByName = new Map(release.assets.map((asset) => [asset.name, asset]));
const latest = assetByName.get("latest.json");
const sums = assetByName.get("SHA256SUMS");
if (!latest || !sums) throw new Error("Release is missing latest.json or SHA256SUMS");

const manifestResponse = await fetch(latest.browser_download_url);
if (!manifestResponse.ok) throw new Error(`latest.json returned HTTP ${manifestResponse.status}`);
const manifest = await manifestResponse.json();
if (manifest.version !== tag || manifest.source_commit !== sourceCommit) {
  throw new Error(`latest.json provenance is ${manifest.version} / ${manifest.source_commit}, expected ${tag} / ${sourceCommit}`);
}

const required = ["mac_arm64", "mac_x64", "windows", "linux_appimage", "linux_deb"];
for (const platform of required) {
  const url = manifest.platforms?.[platform];
  if (typeof url !== "string") throw new Error(`latest.json is missing ${platform}`);
  const name = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
  if (!assetByName.has(name)) throw new Error(`latest.json advertises missing asset ${name}`);
}

const sumResponse = await fetch(sums.browser_download_url);
if (!sumResponse.ok) throw new Error(`SHA256SUMS returned HTTP ${sumResponse.status}`);
const expected = new Map((await sumResponse.text()).trim().split("\n").map((line) => {
  const [hash, file] = line.trim().split(/\s+/, 2);
  return [file?.replace(/^\.\//, ""), hash];
}));

for (const platform of required) {
  const url = manifest.platforms[platform];
  const name = decodeURIComponent(new URL(url).pathname.split("/").pop());
  const asset = assetByName.get(name);
  const advertised = expected.get(name);
  if (!asset || !advertised) throw new Error(`Missing checksum for ${name}`);
  const fileResponse = await fetch(asset.browser_download_url);
  if (!fileResponse.ok) throw new Error(`${name} returned HTTP ${fileResponse.status}`);
  const actual = createHash("sha256").update(Buffer.from(await fileResponse.arrayBuffer())).digest("hex");
  if (actual !== advertised) throw new Error(`Checksum mismatch for ${name}`);
}

console.log(`Verified ${tag}: source ${sourceCommit} and five checksummed desktop artifacts.`);
// @claim:release-source-provenance
