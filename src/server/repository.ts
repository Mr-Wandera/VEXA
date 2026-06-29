// ============================================================================
// VEXA — In-Memory Data Repository
// Phase 1 implementation of the DataRepository contract.
// This is the "workshop" data layer — it uses an in-memory store with seeded
// demo data. When Phase 2 begins, this file is replaced with a Supabase-backed
// repository (or a Go REST client) that implements the same DataRepository
// interface. No frontend code needs to change.
// ============================================================================

import {
  DataRepository,
  DashboardMetrics,
  Transaction,
  Invoice,
  Client,
  Product,
  Sale,
  Expense,
  Supplier,
  Partner,
  Notification,
  TimelineEvent,
  BusinessProfile,
} from "../types.ts";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function nowISO(): string {
  return new Date().toISOString();
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

class InMemoryRepository implements DataRepository {
  private transactions: Transaction[] = [];
  private invoices: Invoice[] = [];
  private clients: Client[] = [];
  private products: Product[] = [];
  private sales: Sale[] = [];
  private expenses: Expense[] = [];
  private suppliers: Supplier[] = [];
  private partners: Partner[] = [];
  private notifications: Notification[] = [];
  private timeline: TimelineEvent[] = [];
  private profile: BusinessProfile = {
    name: "Aesthetic Lab LLC",
    industry: "Design & Software Engineering",
    currency: "KSh",
    taxRate: 16,
    country: "Kenya",
    city: "Nairobi",
    phone: "+254 700 000 000",
    email: "founder@aestheticlab.co",
    stripeConnected: true,
  };

  constructor() {
    this.seed();
  }

  private seed() {
    // Clients / Customers
    this.clients = [
      { id: "c1", name: "Brian Kamau", email: "brian@example.com", phone: "+254 700 111 222", status: "active", totalInvoiced: 48000, outstandingBalance: 0, joinedDate: daysAgo(120) },
      { id: "c2", name: "Aisha Mohammed", email: "aisha@example.com", phone: "+254 700 333 444", status: "active", totalInvoiced: 124000, outstandingBalance: 8400, joinedDate: daysAgo(90) },
      { id: "c3", name: "Vercel Inc", email: "payouts@vercel.com", status: "active", totalInvoiced: 72000, outstandingBalance: 0, joinedDate: daysAgo(60) },
      { id: "c4", name: "Raycast Studio", email: "accounting@raycast.com", status: "active", totalInvoiced: 15000, outstandingBalance: 7500, joinedDate: daysAgo(30) },
      { id: "c5", name: "Arc Software", email: "billing@thebrowser.company", status: "inactive", totalInvoiced: 9500, outstandingBalance: 4500, joinedDate: daysAgo(45) },
    ];

    // Invoices
    this.invoices = [
      { id: "inv-101", invoiceNumber: "INV-2026-101", client: "Aisha Mohammed", amount: 18500, dueDate: daysAgo(10), status: "paid", createdDate: daysAgo(25) },
      { id: "inv-102", invoiceNumber: "INV-2026-102", client: "Vercel Inc", amount: 12000, dueDate: daysAgo(5), status: "paid", createdDate: daysAgo(20) },
      { id: "inv-103", invoiceNumber: "INV-2026-103", client: "Brian Kamau", amount: 8400, dueDate: daysFromNow(7), status: "pending", createdDate: daysAgo(10) },
      { id: "inv-104", invoiceNumber: "INV-2026-104", client: "Arc Software", amount: 4500, dueDate: daysAgo(15), status: "overdue", createdDate: daysAgo(35) },
      { id: "inv-105", invoiceNumber: "INV-2026-105", client: "Raycast Studio", amount: 7500, dueDate: daysFromNow(14), status: "pending", createdDate: daysAgo(2) },
    ];

    // Products / Inventory
    this.products = [
      { id: "p1", name: "Premium Hoodie", sku: "HD-001", category: "Apparel", price: 2500, cost: 1200, stock: 45, reorderLevel: 15, unit: "pcs", createdAt: daysAgo(60) },
      { id: "p2", name: "T-Shirt (White)", sku: "TS-002", category: "Apparel", price: 1200, cost: 450, stock: 8, reorderLevel: 20, unit: "pcs", createdAt: daysAgo(55) },
      { id: "p3", name: "Coffee Mug (Branded)", sku: "MG-003", category: "Merchandise", price: 600, cost: 200, stock: 120, reorderLevel: 30, unit: "pcs", createdAt: daysAgo(40) },
      { id: "p4", name: "Sticker Pack", sku: "ST-004", category: "Merchandise", price: 300, cost: 80, stock: 3, reorderLevel: 25, unit: "pack", createdAt: daysAgo(30) },
      { id: "p5", name: "Design Service (1hr)", sku: "SV-005", category: "Services", price: 5000, cost: 0, stock: 999, reorderLevel: 0, unit: "hr", createdAt: daysAgo(90) },
      { id: "p6", name: "Web Hosting (Monthly)", sku: "SV-006", category: "Services", price: 3500, cost: 500, stock: 999, reorderLevel: 0, unit: "mo", createdAt: daysAgo(90) },
    ];

    // Sales
    this.sales = [
      { id: "s1", date: daysAgo(0), productId: "p1", productName: "Premium Hoodie", quantity: 2, unitPrice: 2500, totalAmount: 5000, customerName: "Walk-in Customer", paymentMethod: "mpesa", status: "completed" },
      { id: "s2", date: daysAgo(1), productId: "p3", productName: "Coffee Mug (Branded)", quantity: 5, unitPrice: 600, totalAmount: 3000, customerName: "Aisha Mohammed", customerId: "c2", paymentMethod: "cash", status: "completed" },
      { id: "s3", date: daysAgo(2), productId: "p5", productName: "Design Service (1hr)", quantity: 3, unitPrice: 5000, totalAmount: 15000, customerName: "Brian Kamau", customerId: "c1", paymentMethod: "mpesa", status: "completed" },
      { id: "s4", date: daysAgo(3), productId: "p2", productName: "T-Shirt (White)", quantity: 4, unitPrice: 1200, totalAmount: 4800, customerName: "Walk-in Customer", paymentMethod: "card", status: "completed" },
      { id: "s5", date: daysAgo(4), productId: "p6", productName: "Web Hosting (Monthly)", quantity: 1, unitPrice: 3500, totalAmount: 3500, customerName: "Vercel Inc", customerId: "c3", paymentMethod: "mpesa", status: "completed" },
      { id: "s6", date: daysAgo(5), productId: "p1", productName: "Premium Hoodie", quantity: 1, unitPrice: 2500, totalAmount: 2500, customerName: "Raycast Studio", customerId: "c4", paymentMethod: "credit", status: "pending" },
    ];

    // Expenses
    this.expenses = [
      { id: "e1", date: daysAgo(1), description: "Vercel Hosting", category: "SaaS Infrastructure", amount: 480, paymentMethod: "card", vendor: "Vercel", status: "recorded" },
      { id: "e2", date: daysAgo(2), description: "AWS Cloud Servers", category: "Cloud Servers", amount: 1420, paymentMethod: "card", vendor: "Amazon Web Services", status: "recorded" },
      { id: "e3", date: daysAgo(3), description: "GitHub Enterprise", category: "Developer Tools", amount: 210, paymentMethod: "card", vendor: "GitHub", status: "recorded" },
      { id: "e4", date: daysAgo(4), description: "Figma Professional", category: "Design Software", amount: 150, paymentMethod: "card", vendor: "Figma", status: "recorded" },
      { id: "e5", date: daysAgo(5), description: "Staff Payroll", category: "Human Resources", amount: 8500, paymentMethod: "bank", vendor: "Gusto", status: "recorded" },
      { id: "e6", date: daysAgo(6), description: "Office Rent", category: "Rent & Real Estate", amount: 1800, paymentMethod: "bank", vendor: "WeWork", status: "recorded" },
      { id: "e7", date: daysAgo(7), description: "Google Workspace", category: "Business Operations", amount: 84, paymentMethod: "card", vendor: "Google", status: "recorded" },
      { id: "e8", date: daysAgo(8), description: "Facebook Ads Campaign", category: "Marketing & Growth", amount: 1200, paymentMethod: "card", vendor: "Meta", status: "recorded" },
    ];

    // Suppliers
    this.suppliers = [
      { id: "sup1", name: "Nairobi Textile Co.", contactPerson: "John Mwangi", email: "john@nairobitextile.co.ke", phone: "+254 720 111 111", category: "Apparel Manufacturing", totalPurchased: 85000, outstandingPayable: 12000, status: "active", joinedDate: daysAgo(100) },
      { id: "sup2", name: "PrintHub Kenya", contactPerson: "Sarah Wanjiku", email: "sarah@printhub.co.ke", phone: "+254 720 222 222", category: "Printing Services", totalPurchased: 32000, outstandingPayable: 0, status: "active", joinedDate: daysAgo(80) },
      { id: "sup3", name: "CloudHost Africa", contactPerson: "David Otieno", email: "david@cloudhost.africa", phone: "+254 720 333 333", category: "Cloud Infrastructure", totalPurchased: 45000, outstandingPayable: 4500, status: "active", joinedDate: daysAgo(90) },
      { id: "sup4", name: "Office Supplies Ltd", contactPerson: "Mary Akinyi", email: "mary@officesupplies.co.ke", phone: "+254 720 444 444", category: "Office Supplies", totalPurchased: 15000, outstandingPayable: 0, status: "inactive", joinedDate: daysAgo(70) },
    ];

    // Partners
    this.partners = [
      { id: "pt1", name: "Founder One", role: "CEO & Founder", equity: 60, contribution: 500000, email: "founder@vexa.co", phone: "+254 700 000 001", status: "active", joinedDate: daysAgo(365) },
      { id: "pt2", name: "Co-Founder Two", role: "CTO & Co-Founder", equity: 25, contribution: 200000, email: "cto@vexa.co", phone: "+254 700 000 002", status: "active", joinedDate: daysAgo(365) },
      { id: "pt3", name: "Investor Three", role: "Angel Investor", equity: 10, contribution: 150000, email: "investor@vc.com", phone: "+254 700 000 003", status: "active", joinedDate: daysAgo(180) },
      { id: "pt4", name: "Advisor Four", role: "Strategic Advisor", equity: 5, contribution: 50000, email: "advisor@vc.com", phone: "+254 700 000 004", status: "active", joinedDate: daysAgo(120) },
    ];

    // Notifications
    this.notifications = [
      { id: "n1", type: "alert", title: "Overdue Invoice", description: "INV-2026-104 for Arc Software (KSh 4,500) is 15 days overdue.", timestamp: nowISO(), read: false, actionText: "Draft Reminder", actionCode: "remind_overdue_inv-104" },
      { id: "n2", type: "ai", title: "VEXA AI: Low Stock Alert", description: "Sticker Packs will run out in 2 days. Reorder recommended.", timestamp: nowISO(), read: false, actionText: "Reorder", actionCode: "reorder_p4" },
      { id: "n3", type: "success", title: "Payment Received", description: "KSh 18,500 from Aisha Mohammed has been received and reconciled.", timestamp: nowISO(), read: false },
      { id: "n4", type: "info", title: "New Sale Recorded", description: "2x Premium Hoodie sold to Walk-in Customer via M-Pesa.", timestamp: nowISO(), read: true },
      { id: "n5", type: "alert", title: "Expense Spike", description: "Marketing costs increased 18% this week compared to last.", timestamp: nowISO(), read: false, actionText: "Analyze", actionCode: "analyze_marketing" },
    ];

    // Timeline
    this.timeline = [
      { id: "tl1", type: "sale", title: "Sale Recorded", description: "2x Premium Hoodie sold to Walk-in Customer", timestamp: nowISO(), amount: 5000, actor: "System" },
      { id: "tl2", type: "ai", title: "VEXA AI Insight", description: "Identified low stock on Sticker Packs — reorder suggested", timestamp: nowISO(), actor: "VEXA AI" },
      { id: "tl3", type: "invoice", title: "Invoice Paid", description: "INV-2026-101 from Aisha Mohammed settled", timestamp: nowISO(), amount: 18500, actor: "System" },
      { id: "tl4", type: "expense", title: "Expense Logged", description: "AWS Cloud Servers — KSh 1,420", timestamp: nowISO(), amount: 1420, actor: "Founder" },
      { id: "tl5", type: "client", title: "New Client Onboarded", description: "Raycast Studio added to customer base", timestamp: nowISO(), actor: "Founder" },
      { id: "tl6", type: "inventory", title: "Stock Updated", description: "Premium Hoodie restocked to 45 units", timestamp: nowISO(), actor: "Founder" },
    ];

    // Transactions (legacy ledger — derived from sales + expenses for backward compat)
    this.transactions = [
      { id: "t1", date: daysAgo(0), merchant: "Walk-in Customer", category: "Product Sale", amount: 5000, type: "income", status: "cleared", aiAnalysis: "Strong product sale. Hoodie margins at 52%." },
      { id: "t2", date: daysAgo(1), merchant: "Vercel Hosting", category: "SaaS Infrastructure", amount: -480, type: "expense", status: "cleared", aiAnalysis: "Hosting cost increased 4% MoM. Traffic expansion." },
      { id: "t3", date: daysAgo(2), merchant: "Amazon Web Services", category: "Cloud Servers", amount: -1420, type: "expense", status: "cleared", aiAnalysis: "AI GPU processing. Tax-deductible R&D." },
      { id: "t4", date: daysAgo(3), merchant: "GitHub Enterprise", category: "Developer Tools", amount: -210, type: "expense", status: "cleared", aiAnalysis: "Fixed operational subscription." },
      { id: "t5", date: daysAgo(4), merchant: "Figma Professional", category: "Design Software", amount: -150, type: "expense", status: "cleared", aiAnalysis: "Design seat licensing." },
      { id: "t6", date: daysAgo(5), merchant: "Aisha Mohammed", category: "Client Retainer", amount: 18500, type: "income", status: "cleared", aiAnalysis: "Recurring retainer. Account health excellent." },
      { id: "t7", date: daysAgo(6), merchant: "Gusto Payroll", category: "Human Resources", amount: -8500, type: "expense", status: "cleared", aiAnalysis: "Primary payroll. Core operational cost." },
      { id: "t8", date: daysAgo(7), merchant: "Google Workspace", category: "Business Operations", amount: -84, type: "expense", status: "cleared", aiAnalysis: "Standard email hosting." },
      { id: "t9", date: daysAgo(8), merchant: "WeWork NYC", category: "Rent & Real Estate", amount: -1800, type: "expense", status: "cleared", aiAnalysis: "Hybrid office lease." },
      { id: "t10", date: daysAgo(9), merchant: "Meta Ads", category: "Marketing & Growth", amount: -1200, type: "expense", status: "cleared", aiAnalysis: "Facebook ad campaign. Monitor ROAS." },
    ];
  }

  // --- Metrics ---------------------------------------------------------------

  async getMetrics(): Promise<DashboardMetrics> {
    const totalIncome = this.transactions
      .filter((t) => t.type === "income" && t.status === "cleared")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = Math.abs(
      this.transactions
        .filter((t) => t.type === "expense" && t.status === "cleared")
        .reduce((sum, t) => sum + t.amount, 0)
    );
    const netProfit = totalIncome - totalExpense;
    const monthlyBurn = totalExpense;
    const cashReserve = 148500;
    const runwayMonths = monthlyBurn > 0 ? Number((cashReserve / monthlyBurn).toFixed(1)) : 99;
    const totalSales = this.sales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const inventoryValue = this.products.reduce((sum, p) => sum + p.stock * p.cost, 0);
    const outstandingInvoices = this.invoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      cashReserve,
      mrr: 38900,
      monthlyBurn,
      runwayMonths,
      netProfit,
      totalIncome,
      totalExpense,
      totalSales,
      totalCustomers: this.clients.length,
      inventoryValue,
      outstandingInvoices,
    };
  }

  // --- Transactions ----------------------------------------------------------

  async getTransactions(): Promise<Transaction[]> {
    return [...this.transactions];
  }

  async addTransaction(tx: Omit<Transaction, "id" | "aiAnalysis">): Promise<Transaction> {
    const transaction: Transaction = { ...tx, id: uid("t"), aiAnalysis: "Analyzing with VEXA AI..." };
    this.transactions.unshift(transaction);
    return transaction;
  }

  // --- Invoices --------------------------------------------------------------

  async getInvoices(): Promise<Invoice[]> {
    return [...this.invoices];
  }

  async addInvoice(inv: Omit<Invoice, "id">): Promise<Invoice> {
    const count = this.invoices.length + 101;
    const invoice: Invoice = {
      ...inv,
      id: uid("inv"),
      invoiceNumber: `INV-2026-${count}`,
    };
    this.invoices.unshift(invoice);
    return invoice;
  }

  async updateInvoiceStatus(id: string, status: Invoice["status"]): Promise<Invoice> {
    const inv = this.invoices.find((i) => i.id === id);
    if (!inv) throw new Error("Invoice not found");
    inv.status = status;
    if (status === "paid") {
      this.transactions.unshift({
        id: uid("t"),
        date: new Date().toISOString().split("T")[0],
        merchant: inv.client,
        category: "Invoice Cleared",
        amount: inv.amount,
        type: "income",
        status: "cleared",
      });
    }
    return inv;
  }

  // --- Clients ---------------------------------------------------------------

  async getClients(): Promise<Client[]> {
    return [...this.clients];
  }

  async addClient(c: Omit<Client, "id" | "totalInvoiced" | "outstandingBalance" | "joinedDate">): Promise<Client> {
    const client: Client = {
      ...c,
      id: uid("c"),
      totalInvoiced: 0,
      outstandingBalance: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    this.clients.unshift(client);
    return client;
  }

  // --- Products --------------------------------------------------------------

  async getProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async addProduct(p: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const product: Product = { ...p, id: uid("p"), createdAt: new Date().toISOString().split("T")[0] };
    this.products.unshift(product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new Error("Product not found");
    Object.assign(product, updates);
    return product;
  }

  // --- Sales -----------------------------------------------------------------

  async getSales(): Promise<Sale[]> {
    return [...this.sales];
  }

  async addSale(sale: Omit<Sale, "id">): Promise<Sale> {
    const s: Sale = { ...sale, id: uid("s") };
    this.sales.unshift(s);
    // Decrement stock
    const product = this.products.find((p) => p.id === sale.productId);
    if (product && product.stock < 999) {
      product.stock = Math.max(0, product.stock - sale.quantity);
    }
    return s;
  }

  // --- Expenses --------------------------------------------------------------

  async getExpenses(): Promise<Expense[]> {
    return [...this.expenses];
  }

  async addExpense(exp: Omit<Expense, "id">): Promise<Expense> {
    const e: Expense = { ...exp, id: uid("e") };
    this.expenses.unshift(e);
    return e;
  }

  // --- Suppliers -------------------------------------------------------------

  async getSuppliers(): Promise<Supplier[]> {
    return [...this.suppliers];
  }

  async addSupplier(s: Omit<Supplier, "id" | "totalPurchased" | "outstandingPayable" | "joinedDate">): Promise<Supplier> {
    const supplier: Supplier = {
      ...s,
      id: uid("sup"),
      totalPurchased: 0,
      outstandingPayable: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    this.suppliers.unshift(supplier);
    return supplier;
  }

  // --- Partners --------------------------------------------------------------

  async getPartners(): Promise<Partner[]> {
    return [...this.partners];
  }

  async addPartner(p: Omit<Partner, "id" | "joinedDate">): Promise<Partner> {
    const partner: Partner = { ...p, id: uid("pt"), joinedDate: new Date().toISOString().split("T")[0] };
    this.partners.unshift(partner);
    return partner;
  }

  // --- Notifications ----------------------------------------------------------

  async getNotifications(): Promise<Notification[]> {
    return [...this.notifications];
  }

  async markNotificationRead(id: string): Promise<void> {
    const n = this.notifications.find((n) => n.id === id);
    if (n) n.read = true;
  }

  // --- Timeline --------------------------------------------------------------

  async getTimeline(): Promise<TimelineEvent[]> {
    return [...this.timeline];
  }

  // --- Profile ---------------------------------------------------------------

  async getProfile(): Promise<BusinessProfile> {
    return { ...this.profile };
  }

  async updateProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    this.profile = { ...this.profile, ...profile };
    return { ...this.profile };
  }
}

// Singleton instance — the current "workshop" data layer.
// Phase 2: replace this export with a Supabase-backed repository.
export const repository: DataRepository = new InMemoryRepository();

// Backward-compatible export for existing server.ts code that imports dbStore
import { MockStore } from "./store.ts";
export const dbStore = new MockStore();
