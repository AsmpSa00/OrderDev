import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, log } from "./vite";

const app = express();

(async () => {
  const server = await registerRoutes(app);
  await setupVite(app, server); // only run vite in dev
  server.listen(5173, () => {
    log("dev server running on http://localhost:5173");
  });
})();