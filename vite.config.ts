import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";

function buildSourceCommit(): string {
  const source = process.env.VITE_BUILD_SOURCE_COMMIT
    ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (!/^[0-9a-f]{40}$/i.test(source)) {
    throw new Error("VITE_BUILD_SOURCE_COMMIT must be an immutable 40-character Git commit.");
  }
  return source;
}

export default defineConfig({
  // CI supplies this for a release; local builds use their checked-out commit
  // instead of shipping a mutable development placeholder.
  define: { __PULSE_BUILD_SOURCE_COMMIT__: JSON.stringify(buildSourceCommit()) },
  build: {
    outDir: "dist/site",
    target: "es2022",
    sourcemap: true,
    rollupOptions: { input: { main: "index.html", notFound: "404.html" } },
  },
  server: { port: 4173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
