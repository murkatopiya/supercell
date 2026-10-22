import { createServer as createHttpServer } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import { loadEvidence } from "./evidence.ts";

// Explicit server entry only; no collector/Simulation dependencies. Validate before listen.
if (process.env.LEARN_DEMO_SEED_VERIFICATION !== undefined) throw new Error("Viewer requires absent collection opt-in");
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const viewerRoot = resolve(repoRoot, "tools/learn-demo-seed-verification/viewer");
const bundle = loadEvidence(repoRoot);
const payload = JSON.stringify(bundle); // One verified, in-memory input for this server lifetime.
const threeRoot = resolve(repoRoot, "node_modules/three").replaceAll("\\", "/");
const viteClientRoot = resolve(repoRoot, "node_modules/vite/dist/client").replaceAll("\\", "/");
const port = 4177;
const vite = await createViteServer({
  configFile: false, envFile: false, root: viewerRoot, publicDir: false,
  cacheDir: resolve(repoRoot, "node_modules/.vite-learn-demo-viewer"),
  appType: "mpa", optimizeDeps: { noDiscovery: true, include: [], exclude: ["three"] },
  server: { middlewareMode: true, hmr: false, cors: false,
    fs: { strict: true, allow: [viewerRoot, threeRoot, viteClientRoot] } },
});
const http = createHttpServer((req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  if (!['127.0.0.1:4177', 'localhost:4177'].includes(req.headers.host ?? "")
    || (req.method !== "GET" && req.method !== "HEAD")) { res.writeHead(403).end(); return; }
  let path: string;
  try { path = decodeURIComponent(new URL(req.url ?? "/", "http://127.0.0.1:4177").pathname); }
  catch { res.writeHead(400).end(); return; }
  if (path === "/saved-result") {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(req.method === "HEAD" ? undefined : payload); return;
  }
  const source = path.startsWith("/@fs/") ? path.slice(5) : "";
  const allowed = ["/", "/index.html", "/main.ts", "/model.ts", "/framing.ts", "/cleanup.ts", "/style.css", "/@vite/client"].includes(path)
    || source.startsWith(threeRoot + "/") || source.startsWith(viteClientRoot + "/");
  if (!allowed) { res.writeHead(404).end("Viewer resource not available"); return; }
  vite.middlewares(req, res, () => res.writeHead(404).end());
});
try {
  await new Promise<void>((done, reject) => { http.once("error", reject); http.listen(port, "127.0.0.1", done); });
  console.log(`Saved Trajectory Viewer: http://127.0.0.1:${port}/\nVerified ${bundle.verifiedFiles} checksums; result ${bundle.resultSha256}`);
} catch (error) { await vite.close(); throw error; }
let closing = false;
async function close() {
  if (closing) return; closing = true;
  await new Promise<void>(done => http.close(() => done()));
  await vite.close();
}
process.once("SIGINT", () => { void close(); });
process.once("SIGTERM", () => { void close(); });
