import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { dbStore } from "./src/server/store.ts";
import { generateVexaInsights, analyzeTransaction, chatWithVexa } from "./src/server/ai.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json());

  // Log requests in dev
  app.use((req, res, next) => {
    console.log(`[VEXA SERVER] ${req.method} ${req.url}`);
    next();
  });

  // API Routes (FIRST before Vite)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "VEXA AI Command Center", timestamp: new Date().toISOString() });
  });

  // Get overview and business profile
  app.get("/api/metrics", (req, res) => {
    try {
      const metrics = dbStore.getOverviewMetrics();
      res.json({
        metrics,
        profile: dbStore.profile
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update profile
  app.post("/api/profile", (req, res) => {
    try {
      const updated = dbStore.updateProfile(req.body);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get transactions list
  app.get("/api/transactions", (req, res) => {
    try {
      res.json(dbStore.transactions);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Add transaction (supports real-time AI analysis)
  app.post("/api/transactions", async (req, res) => {
    try {
      const { merchant, category, amount, type, status, date } = req.body;
      if (!merchant || !category || amount === undefined || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const transaction = dbStore.addTransaction({
        merchant,
        category,
        amount: Number(amount),
        type,
        status: status || 'cleared',
        date: date || new Date().toISOString().split('T')[0]
      });

      // Analyze transaction with VEXA AI asynchronously or inline
      const analysis = await analyzeTransaction(transaction);
      transaction.aiAnalysis = analysis;

      res.status(201).json(transaction);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get invoices list
  app.get("/api/invoices", (req, res) => {
    try {
      res.json(dbStore.invoices);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Add invoice
  app.post("/api/invoices", (req, res) => {
    try {
      const { client, amount, dueDate } = req.body;
      if (!client || !amount || !dueDate) {
        return res.status(400).json({ error: "Missing client, amount, or dueDate" });
      }

      const count = dbStore.invoices.length + 101;
      const invoiceNumber = `INV-2026-${count}`;

      const invoice = dbStore.addInvoice({
        invoiceNumber,
        client,
        amount: Number(amount),
        dueDate,
        status: 'pending',
        createdDate: new Date().toISOString().split('T')[0]
      });

      res.status(201).json(invoice);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Update invoice status
  app.post("/api/invoices/:id/status", (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!status || !['paid', 'pending', 'overdue'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const invoice = dbStore.updateInvoiceStatus(id, status);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.json(invoice);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get clients
  app.get("/api/clients", (req, res) => {
    try {
      res.json(dbStore.clients);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Add client
  app.post("/api/clients", (req, res) => {
    try {
      const { name, email, status } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Missing name or email" });
      }

      const client = dbStore.addClient({
        name,
        email,
        status: status || 'active'
      });

      res.status(201).json(client);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Get dynamic generative insights using Gemini
  app.get("/api/insights", async (req, res) => {
    try {
      const insights = await generateVexaInsights();
      res.json(insights);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Live interactive chatbot consultation
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Missing message query" });
      }

      const reply = await chatWithVexa(message, history || []);
      res.json({ reply });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Mount Vite middleware in development (when process.env.NODE_ENV !== "production")
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[VEXA] Mounted Vite dev middleware");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("[VEXA] Serving compiled production client");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VEXA COMMAND CENTER] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start VEXA server:", err);
});
