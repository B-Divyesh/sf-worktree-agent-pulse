import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const port = 4174;
const origin = `http://127.0.0.1:${port}`;
const outputPath = resolve(process.argv[2] ?? "test-results/lighthouse-mobile.json");
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
const preview = spawn(process.execPath, [
  "node_modules/vite/bin/vite.js",
  "preview",
  "--host",
  "127.0.0.1",
  "--port",
  String(port),
  "--strictPort",
], { stdio: ["ignore", "pipe", "pipe"] });

async function waitForPreview() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(origin);
      if (response.ok) return;
    } catch {
      // The preview process may still be binding the port.
    }
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }
  throw new Error("Vite preview did not become ready within 8 seconds.");
}

function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", rejectRun);
    child.once("exit", (code) => code === 0
      ? resolveRun()
      : rejectRun(new Error(`${command} exited with code ${code ?? "unknown"}.`)));
  });
}

function requireFloor(actual, floor, label) {
  if (actual < floor) throw new Error(`${label} was ${Math.round(actual * 100)}; required ${Math.round(floor * 100)} or higher.`);
}

try {
  await waitForPreview();
  await mkdir(dirname(outputPath), { recursive: true });
  await run(npxCommand, [
    "--yes",
    "lighthouse@12.8.2",
    `${origin}/`,
    "--quiet",
    "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
    "--only-categories=performance,accessibility,best-practices,seo",
    "--emulated-form-factor=mobile",
    "--output=json",
    `--output-path=${outputPath}`,
  ], { env: { ...process.env, CHROME_PATH: chromium.executablePath() } });

  const report = JSON.parse(await readFile(outputPath, "utf8"));
  requireFloor(report.categories.performance.score, 0.9, "Mobile Lighthouse performance");
  requireFloor(report.categories.accessibility.score, 0.95, "Mobile Lighthouse accessibility");
  requireFloor(report.categories["best-practices"].score, 0.9, "Mobile Lighthouse best practices");
  requireFloor(report.categories.seo.score, 0.9, "Mobile Lighthouse SEO");

  const tbt = report.audits["total-blocking-time"].numericValue;
  const lcp = report.audits["largest-contentful-paint"].numericValue;
  const cls = report.audits["cumulative-layout-shift"].numericValue;
  if (tbt >= 200) throw new Error(`Total blocking time was ${Math.round(tbt)} ms; required under 200 ms.`);
  if (lcp >= 2500) throw new Error(`Largest Contentful Paint was ${Math.round(lcp)} ms; required under 2500 ms.`);
  if (cls >= 0.1) throw new Error(`Cumulative Layout Shift was ${cls}; required under 0.1.`);

  console.log(JSON.stringify({
    lighthouseVersion: report.lighthouseVersion,
    benchmarkIndex: report.environment.benchmarkIndex,
    scores: Object.fromEntries(Object.entries(report.categories).map(([key, value]) => [key, Math.round(value.score * 100)])),
    metrics: { tbtMs: Math.round(tbt), lcpMs: Math.round(lcp), cls },
    outputPath,
  }, null, 2));
} finally {
  preview.kill("SIGTERM");
}
