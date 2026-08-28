import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/site",
    target: "es2022",
    sourcemap: true,
    rollupOptions: { input: { main: "index.html", notFound: "404.html" } },
  },
  server: { port: 4173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});
