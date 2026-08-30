import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";

const sourceCommit = "c".repeat(40);
execFileSync("npm", ["run", "build:site"], {
  stdio: "inherit",
  env: { ...process.env, VITE_BUILD_SOURCE_COMMIT: sourceCommit },
});

const bundles = readdirSync("dist/site/assets")
  .filter((name) => name.endsWith(".js"))
  .map((name) => readFileSync(`dist/site/assets/${name}`, "utf8"))
  .join("\n");

if (!bundles.includes(sourceCommit)) throw new Error("The built WebView does not expose the immutable source commit.");
if (bundles.includes("local-development")) throw new Error("The built WebView still contains a mutable development build identity.");
console.log(`build-identity PASS: dist/site embeds immutable source ${sourceCommit}.`);
