import path from "node:path";
import { fileURLToPath } from "node:url";
import { createStaticServer } from "./server.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const distRoot = path.join(root, "dist");
const port = Number(process.env.PORT) || 4321;

const server = createStaticServer({ distRoot });
server.listen(port, () => {
  console.log("LeleBlog preview: http://localhost:" + port);
});
