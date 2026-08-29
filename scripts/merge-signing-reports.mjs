import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const directory = process.argv[2];
const files = readdirSync(directory, { recursive: true }).filter((name) => name.endsWith(".json"));
const reports = files.map((name) => JSON.parse(readFileSync(`${directory}/${name}`, "utf8")));
const macosReports = reports.filter((report) => report.platform === "macos");
const macosUnsigned = macosReports.length === 2 && macosReports.every((report) => report.signed === false);
const output = {
  macos: { signed: false, architectures: macosReports },
  windows: reports.find((report) => report.platform === "windows"),
  linux: reports.find((report) => report.platform === "linux"),
};
if (!macosUnsigned || output.windows?.signed !== false) throw new Error("missing unsigned macOS or Windows runner evidence");
writeFileSync("release-assets/signing-status.json", `${JSON.stringify(output, null, 2)}\n`);
