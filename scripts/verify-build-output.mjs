// @claim:build-output
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";

execFileSync("npm", ["run", "build:site"], { stdio: "inherit" });
if (!existsSync("dist/site/index.html")) throw new Error("dist/site/index.html was not produced");
const assets = readdirSync("dist/site/assets");
if (!assets.some((name) => name.endsWith(".js")) || !assets.some((name) => name.endsWith(".css"))) {
  throw new Error("dist/site is missing built JavaScript or CSS");
}
const jsBytes = assets.filter((name) => name.endsWith(".js")).reduce((sum, name) => sum + statSync(`dist/site/assets/${name}`).size, 0);
if (jsBytes > 200_000) throw new Error(`built JavaScript is ${jsBytes} bytes, over the 200 KB budget`);
console.log(`build-output PASS: dist/site exists; JavaScript is ${jsBytes} bytes`);
