import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { repository } from "./src/server/repository.ts";
import { generateVexaInsights, analyzeTransaction, chatWithVexa } from "./src/server/ai.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`[VEXA SERVER] ${req.method} ${req.url}`);
    next();
  });

  // --- Health ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "VEXA AI Command Center", timestamp: new Date().toISOString() });
  });

  // --- Metrics & Profile ---
  app.get("/api/metrics", async (req, res) => {
    try {
      const [metrics, profile] = await Promise.all([repository.getMetrics(), repository.getProfile()]);
      res.json({ metrics, profile });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/profile", async (req, res) => {
    try { res.json(await repository.getProfile()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/profile", async (req, res) => {
    try { res.json(await repository.updateProfile(req.body)); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Transactions ---
  app.get("/api/transactions", async (req, res) => {
    try { res.json(await repository.getTransactions()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const { merchant, category, amount, type, status, date } = req.body;
      if (!merchant || !category || amount === undefined || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const transaction = await repository.addTransaction({
        merchant, category, amount: Number(amount), type,
        status: status || "cleared",
        date: date || new Date().toISOString().split("T")[0],
      });
      const analysis = await analyzeTransaction(transaction);
      transaction.aiAnalysis = analysis;
      res.status(201).json(transaction);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Invoices ---
  app.get("/api/invoices", async (req, res) => {
    try { res.json(await repository.getInvoices()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const { client, amount, dueDate } = req.body;
      if (!client || !amount || !dueDate) {
        return res.status(400).json({ error: "Missing client, amount, or dueDate" });
      }
      const invoice = await repository.addInvoice({
        invoiceNumber: `INV-2026-${Date.now().toString().slice(-3)}`,
        client, amount: Number(amount), dueDate,
        status: "pending",
        createdDate: new Date().toISOString().split("T")[0],
      });
      res.status(201).json(invoice);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/invoices/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!["paid", "pending", "overdue"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const invoice = await repository.updateInvoiceStatus(req.params.id, status);
      res.json(invoice);
    } catch (e: any) { res.status(404).json({ error: e.message }); }
  });

  // --- Clients / Customers ---
  app.get("/api/clients", async (req, res) => {
    try { res.json(await repository.getClients()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const { name, email, phone, status } = req.body;
      if (!name || !email) return res.status(400).json({ error: "Missing name or email" });
      const client = await repository.addClient({ name, email, phone, status: status || "active" });
      res.status(201).json(client);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Products / Inventory ---
  app.get("/api/products", async (req, res) => {
    try { res.json(await repository.getProducts()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const { name, sku, category, price, cost, stock, reorderLevel, unit } = req.body;
      if (!name || !sku || price === undefined) return res.status(400).json({ error: "Missing required fields" });
      const product = await repository.addProduct({
        name, sku, category, price: Number(price), cost: Number(cost || 0),
        stock: Number(stock || 0), reorderLevel: Number(reorderLevel || 10), unit: unit || "pcs",
      });
      res.status(201).json(product);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try { res.json(await repository.updateProduct(req.params.id, req.body)); }
    catch (e: any) { res.status(404).json({ error: e.message }); }
  });

  // --- Sales ---
  app.get("/api/sales", async (req, res) => {
    try { res.json(await repository.getSales()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const sale = await repository.addSale(req.body);
      res.status(201).json(sale);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Expenses ---
  app.get("/api/expenses", async (req, res) => {
    try { res.json(await repository.getExpenses()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = await repository.addExpense(req.body);
      res.status(201).json(expense);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Suppliers ---
  app.get("/api/suppliers", async (req, res) => {
    try { res.json(await repository.getSuppliers()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const { name, contactPerson, email, phone, category, status } = req.body;
      if (!name || !email) return res.status(400).json({ error: "Missing name or email" });
      const supplier = await repository.addSupplier({
        name, contactPerson, email, phone, category,
        status: status || "active",
      });
      res.status(201).json(supplier);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Partners ---
  app.get("/api/partners", async (req, res) => {
    try { res.json(await repository.getPartners()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/partners", async (req, res) => {
    try {
      const { name, role, equity, contribution, email, phone, status } = req.body;
      if (!name || !role) return res.status(400).json({ error: "Missing name or role" });
      const partner = await repository.addPartner({
        name, role, equity: Number(equity || 0), contribution: Number(contribution || 0),
        email, phone, status: status || "active",
      });
      res.status(201).json(partner);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Notifications ---
  app.get("/api/notifications", async (req, res) => {
    try { res.json(await repository.getNotifications()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    try { await repository.markNotificationRead(req.params.id); res.json({ success: true }); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- Timeline ---
  app.get("/api/timeline", async (req, res) => {
    try { res.json(await repository.getTimeline()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // --- AI ---
  app.get("/api/insights", async (req, res) => {
    try { res.json(await generateVexaInsights()); }
    catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) return res.status(400).json({ error: "Missing message" });
      const reply = await chatWithVexa(message, history || []);
      res.json({ reply });
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
