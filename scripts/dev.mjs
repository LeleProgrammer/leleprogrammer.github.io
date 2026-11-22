import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "./build.mjs";
import { createStaticServer } from "./server.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = path.join(root, "dist");
const port = Number(process.env.PORT) || 4321;

let buildId = Date.now();
let building = false;
let queued = false;
let timer = null;

async function rebuild(reason) {
  if (building) {
    queued = true;
    return;
  }
  building = true;
  try {
    console.log("\n↻ rebuild (" + reason + ")");
    await build({ dev: true });
    buildId += 1;
  } catch (error) {
    console.error("build failed:", error);
  } finally {
    building = false;
    if (queued) {
      queued = false;
      schedule("queued change");
    }
  }
}

function schedule(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => rebuild(reason), 220);
}

const server = createStaticServer({
  distRoot,
  extraHandler(req, res, url) {
    if (url.pathname !== "/__dev-version") return false;
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(JSON.stringify({ id: buildId }));
    return true;
  }
});

await build({ dev: true });

server.listen(port, () => {
  console.log("\nLeleBlog dev server: http://localhost:" + port);
  console.log("watching content/, assets/, scripts/, site.config.json\n");
});

for (const entry of ["content", "assets", "scripts", "site.config.json"]) {
  const target = path.join(root, entry);
  if (!fs.existsSync(target)) continue;
  fs.watch(target, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (filename.includes("node_modules") || filename.startsWith("dist")) return;
    schedule(entry + "/" + filename);
  });
}
