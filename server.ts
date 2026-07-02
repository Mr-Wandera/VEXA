import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateVexaInsights, analyzeTransaction, chatWithVexa, AIContext } from "./src/server/ai.ts";
import type { Transaction, BusinessProfile } from "./src/types.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  app.use((req, res, next) => {
    console.log(`[VEXA SERVER] ${req.method} ${req.url}`);
    next();
  });

  // --- Health ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "VEXA AI Command Center", timestamp: new Date().toISOString() });
  });

  // --- AI Insights (context provided by frontend) ---
  app.post("/api/insights", async (req, res) => {
    try {
      const ctx = req.body as AIContext;
      if (!ctx?.metrics || !ctx?.profile) {
        return res.status(400).json({ error: "Missing AI context" });
      }
      const insights = await generateVexaInsights(ctx);
      res.json(insights);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- AI Chat (context provided by frontend) ---
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;
      if (!message) return res.status(400).json({ error: "Missing message" });
      if (!context?.metrics || !context?.profile) {
        return res.status(400).json({ error: "Missing AI context" });
      }
      const reply = await chatWithVexa(message, history || [], context);
      res.json({ reply });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Transaction analysis (context provided by frontend) ---
  app.post("/api/analyze-transaction", async (req, res) => {
    try {
      const { transaction, profile } = req.body as { transaction: Transaction; profile: BusinessProfile };
      if (!transaction || !profile) return res.status(400).json({ error: "Missing transaction or profile" });
      const analysis = await analyzeTransaction(transaction, profile);
      res.json({ analysis });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Vite / Static ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
    console.log("[VEXA] Mounted Vite dev middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => { res.sendFile(path.join(distPath, "index.html")); });
    console.log("[VEXA] Serving compiled production client");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VEXA COMMAND CENTER] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => { console.error("Failed to start VEXA server:", err); });
