import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "public-release-notices",
      generateBundle() {
        for (const fileName of ["LICENSE.md", "THIRD_PARTY_NOTICES.md"]) {
          this.emitFile({
            type: "asset",
            fileName,
            source: readFileSync(new URL(fileName, import.meta.url), "utf8"),
          });
        }
      },
    },
  ],
});
