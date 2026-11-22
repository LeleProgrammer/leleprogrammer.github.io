import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = path.join(root, "dist");
fs.rmSync(distRoot, { recursive: true, force: true });
console.log("removed dist/");
