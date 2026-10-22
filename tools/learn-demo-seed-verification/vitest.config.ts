import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  root: fileURLToPath(new URL("../../", import.meta.url)),
  cacheDir: "node_modules/.vite-learn-demo-infrastructure",
  test: {
    // Never mix refusal tests with an explicitly enabled future observation batch.
    include: [process.env.LEARN_DEMO_SEED_VERIFICATION === "collect"
      ? "tools/learn-demo-seed-verification/collector.run.test.ts"
      : "tools/learn-demo-seed-verification/collector.infrastructure.test.ts"],
    environment: "node", watch: false, retry: 0, fileParallelism: false,
    maxWorkers: 1, isolate: true,
  },
});
