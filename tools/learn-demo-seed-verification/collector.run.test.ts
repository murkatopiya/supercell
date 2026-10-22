import { test } from "vitest";
import { OPT_IN, runCollector } from "./collector.js";

// Explicit future execution entry, not part of ordinary src test discovery.
test.skipIf(process.env[OPT_IN] !== "collect")("collect the five Demo candidate cases", async () => {
  await runCollector();
}, 120_000);
