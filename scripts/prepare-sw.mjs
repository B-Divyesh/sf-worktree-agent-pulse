import { readFileSync, writeFileSync } from "node:fs";

const index = readFileSync("dist/site/index.html", "utf8");
const assets = [...index.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
const path = "dist/site/sw.js";
const worker = readFileSync(path, "utf8").replace("const BUILD_ASSETS = [];", `const BUILD_ASSETS = ${JSON.stringify(assets)};`);
writeFileSync(path, worker);
