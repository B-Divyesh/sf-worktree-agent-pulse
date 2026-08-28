import { readdirSync, writeFileSync } from "node:fs";

const [tag, repository] = process.argv.slice(2);
if (!tag || !repository) throw new Error("Usage: release-manifest.mjs <tag> <owner/repo>");
const files = readdirSync(".").filter((name) => !["SHA256SUMS", "latest.json"].includes(name));
const url = (name) => `https://github.com/${repository}/releases/download/${tag}/${encodeURIComponent(name)}`;
const pick = (patterns) => files.find((name) => patterns.some((pattern) => pattern.test(name)));
const platforms = {
  mac_arm64: pick([/aarch64.*\.dmg$/i, /aarch64.*\.app\.tar\.gz$/i]),
  mac_x64: pick([/x64.*\.dmg$/i, /x86_64.*\.dmg$/i]),
  windows: pick([/\.msi$/i, /setup.*\.exe$/i]),
  linux_appimage: pick([/\.appimage$/i]),
  linux_deb: pick([/\.deb$/i]),
};
writeFileSync("latest.json", `${JSON.stringify({ version: tag, platforms: Object.fromEntries(Object.entries(platforms).map(([key, name]) => [key, name ? url(name) : null])), checksums: url("SHA256SUMS") }, null, 2)}\n`);
