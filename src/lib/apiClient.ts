// ============================================================================
// VEXA — API Client
// The single entry point for all frontend data access. Components should never
// call fetch() directly — they use this client. When the backend changes from
// the current Express/MockStore to Go/PostgreSQL, only this file needs updating.
// ============================================================================

import {
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
  VexaInsight,
} from "../types.ts";

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const apiClient = {
  // Metrics
  getMetrics: () => api<{ metrics: DashboardMetrics; profile: BusinessProfile }>("/api/metrics"),

  // Transactions
  getTransactions: () => api<Transaction[]>("/api/transactions"),
  addTransaction: (tx: Omit<Transaction, "id" | "aiAnalysis">) =>
    api<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(tx) }),

  // Invoices
  getInvoices: () => api<Invoice[]>("/api/invoices"),
  addInvoice: (inv: { client: string; amount: number; dueDate: string }) =>
    api<Invoice>("/api/invoices", { method: "POST", body: JSON.stringify(inv) }),
  updateInvoiceStatus: (id: string, status: Invoice["status"]) =>
    api<Invoice>(`/api/invoices/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),

  // Clients
  getClients: () => api<Client[]>("/api/clients"),
  addClient: (c: { name: string; email: string; phone?: string }) =>
    api<Client>("/api/clients", { method: "POST", body: JSON.stringify(c) }),

  // Products
  getProducts: () => api<Product[]>("/api/products"),
  addProduct: (p: Omit<Product, "id" | "createdAt">) =>
    api<Product>("/api/products", { method: "POST", body: JSON.stringify(p) }),
  updateProduct: (id: string, updates: Partial<Product>) =>
    api<Product>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),

  // Sales
  getSales: () => api<Sale[]>("/api/sales"),
  addSale: (sale: Omit<Sale, "id">) =>
    api<Sale>("/api/sales", { method: "POST", body: JSON.stringify(sale) }),

  // Expenses
  getExpenses: () => api<Expense[]>("/api/expenses"),
  addExpense: (exp: Omit<Expense, "id">) =>
    api<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(exp) }),

  // Suppliers
  getSuppliers: () => api<Supplier[]>("/api/suppliers"),
  addSupplier: (s: Omit<Supplier, "id" | "totalPurchased" | "outstandingPayable" | "joinedDate">) =>
    api<Supplier>("/api/suppliers", { method: "POST", body: JSON.stringify(s) }),

  // Partners
  getPartners: () => api<Partner[]>("/api/partners"),
  addPartner: (p: Omit<Partner, "id" | "joinedDate">) =>
    api<Partner>("/api/partners", { method: "POST", body: JSON.stringify(p) }),

  // Notifications
  getNotifications: () => api<Notification[]>("/api/notifications"),
  markNotificationRead: (id: string) =>
    api<void>(`/api/notifications/${id}/read`, { method: "POST" }),

  // Timeline
  getTimeline: () => api<TimelineEvent[]>("/api/timeline"),

  // Profile
  getProfile: () => api<BusinessProfile>("/api/profile"),
  updateProfile: (profile: Partial<BusinessProfile>) =>
    api<BusinessProfile>("/api/profile", { method: "POST", body: JSON.stringify(profile) }),

  // AI
  getInsights: () => api<VexaInsight[]>("/api/insights"),
  chat: (message: string, history: { role: string; parts: { text: string }[] }[]) =>
    api<{ reply: string }>("/api/chat", { method: "POST", body: JSON.stringify({ message, history }) }),
};
