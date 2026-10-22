import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL("../../../", import.meta.url)),
  cacheDir: "node_modules/.vite-learn-demo-viewer-test",
  test: { include: ["tools/learn-demo-seed-verification/viewer-server/viewer.test.ts", "tools/learn-demo-seed-verification/viewer-server/initialization.test.ts"],
    environment: "node", watch: false, retry: 0, fileParallelism: false, maxWorkers: 1 },
});
