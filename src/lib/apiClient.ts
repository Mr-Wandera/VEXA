// ============================================================================
// VEXA — API Client (Supabase-backed)
// The single entry point for all frontend data access. Components should never
// call supabase directly — they use this client. All data is scoped to the
// authenticated user via RLS.
// ============================================================================

import { supabase } from "./supabase";
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
} from "../types";

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    date: row.date,
    merchant: row.merchant,
    category: row.category,
    amount: Number(row.amount),
    type: row.type,
    status: row.status,
    aiAnalysis: row.ai_analysis ?? undefined,
  };
}

function mapInvoice(row: any): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    client: row.client,
    amount: Number(row.amount),
    dueDate: row.due_date,
    status: row.status,
    createdDate: row.created_date,
  };
}

function mapClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    status: row.status,
    totalInvoiced: Number(row.total_invoiced),
    outstandingBalance: Number(row.outstanding_balance),
    joinedDate: row.joined_date,
  };
}

function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    price: Number(row.price),
    cost: Number(row.cost),
    stock: row.stock,
    reorderLevel: row.reorder_level,
    unit: row.unit,
    createdAt: row.created_at,
  };
}

function mapSale(row: any): Sale {
  return {
    id: row.id,
    date: row.date,
    productId: row.product_id ?? "",
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    totalAmount: Number(row.total_amount),
    customerId: row.customer_id ?? undefined,
    customerName: row.customer_name,
    paymentMethod: row.payment_method,
    status: row.status,
  };
}

function mapExpense(row: any): Expense {
  return {
    id: row.id,
    date: row.date,
    description: row.description,
    category: row.category,
    amount: Number(row.amount),
    paymentMethod: row.payment_method,
    vendor: row.vendor,
    status: row.status,
    receiptUrl: row.receipt_url ?? undefined,
  };
}

function mapSupplier(row: any): Supplier {
  return {
    id: row.id,
    name: row.name,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    category: row.category,
    totalPurchased: Number(row.total_purchased),
    outstandingPayable: Number(row.outstanding_payable),
    status: row.status,
    joinedDate: row.joined_date,
  };
}

function mapPartner(row: any): Partner {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    equity: Number(row.equity),
    contribution: Number(row.contribution),
    email: row.email,
    phone: row.phone,
    status: row.status,
    joinedDate: row.joined_date,
  };
}

function mapNotification(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp,
    read: row.read,
    actionText: row.action_text ?? undefined,
    actionCode: row.action_code ?? undefined,
  };
}

function mapTimeline(row: any): TimelineEvent {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp,
    amount: row.amount !== null ? Number(row.amount) : undefined,
    actor: row.actor,
  };
}

function mapProfile(row: any): BusinessProfile {
  return {
    name: row.name,
    industry: row.industry,
    currency: row.currency,
    taxRate: Number(row.tax_rate),
    country: row.country,
    city: row.city,
    phone: row.phone,
    email: row.email,
    logoUrl: row.logo_url ?? undefined,
    stripeConnected: row.stripe_connected,
  };
}

async function addTimelineEvent(event: Omit<TimelineEvent, 'id' | 'timestamp'>) {
  await supabase.from("timeline_events").insert({
    type: event.type,
    title: event.title,
    description: event.description,
    amount: event.amount ?? null,
    actor: event.actor,
  });
}

async function addNotification(n: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
  await supabase.from("notifications").insert({
    type: n.type,
    title: n.title,
    description: n.description,
    action_text: n.actionText ?? null,
    action_code: n.actionCode ?? null,
  });
}

export const apiClient = {
  // --- Metrics ---
  async getMetrics(): Promise<{ metrics: DashboardMetrics; profile: BusinessProfile }> {
    const profile = await this.getProfile();
    const [txRes, salesRes, productsRes, invoicesRes, clientsRes] = await Promise.all([
      supabase.from("transactions").select("*"),
      supabase.from("sales").select("*"),
      supabase.from("products").select("*"),
      supabase.from("invoices").select("*"),
      supabase.from("clients").select("*"),
    ]);

    const transactions = (txRes.data ?? []).map(mapTransaction);
    const sales = (salesRes.data ?? []).map(mapSale);
    const products = (productsRes.data ?? []).map(mapProduct);
    const invoices = (invoicesRes.data ?? []).map(mapInvoice);

    const totalIncome = transactions
      .filter((t) => t.type === "income" && t.status === "cleared")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = Math.abs(
      transactions
        .filter((t) => t.type === "expense" && t.status === "cleared")
        .reduce((sum, t) => sum + t.amount, 0)
    );
    const netProfit = totalIncome - totalExpense;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentExpenses = Math.abs(
      transactions
        .filter((t) => t.type === "expense" && t.status === "cleared" && new Date(t.date) >= thirtyDaysAgo)
        .reduce((sum, t) => sum + t.amount, 0)
    );
    const monthlyBurn = recentExpenses > 0 ? recentExpenses : totalExpense;

    const cashReserve = netProfit > 0 ? totalIncome - totalExpense : totalIncome;
    const runwayMonths = monthlyBurn > 0 ? Number((cashReserve / monthlyBurn).toFixed(1)) : 99;

    const monthlyIncome = transactions
      .filter((t) => t.type === "income" && t.status === "cleared" && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + t.amount, 0);
    const mrr = monthlyIncome;

    const totalSales = sales
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.totalAmount, 0);
    const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);
    const outstandingInvoices = invoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      metrics: {
        cashReserve,
        mrr,
        monthlyBurn,
        runwayMonths,
        netProfit,
        totalIncome,
        totalExpense,
        totalSales,
        totalCustomers: clientsRes.data?.length ?? 0,
        inventoryValue,
        outstandingInvoices,
      },
      profile,
    };
  },

  // --- Transactions ---
  async getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTransaction);
  },

  async addTransaction(tx: Omit<Transaction, "id" | "aiAnalysis">): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        date: tx.date,
        merchant: tx.merchant,
        category: tx.category,
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        ai_analysis: "Analyzing with VEXA AI...",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await addTimelineEvent({
      type: tx.type === "income" ? "sale" : "expense",
      title: tx.type === "income" ? "Income Recorded" : "Expense Recorded",
      description: `${tx.merchant} — ${tx.category}`,
      amount: Math.abs(tx.amount),
      actor: "You",
    });

    return mapTransaction(data);
  },

  async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Invoices ---
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapInvoice);
  },

  async addInvoice(inv: Omit<Invoice, "id">): Promise<Invoice> {
    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);

    const count = (existing?.length ?? 0) + 101;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${count}`;

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        client: inv.client,
        amount: inv.amount,
        due_date: inv.dueDate,
        status: inv.status,
        created_date: inv.createdDate,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await addTimelineEvent({
      type: "invoice",
      title: "Invoice Created",
      description: `${invoiceNumber} for ${inv.client}`,
      amount: inv.amount,
      actor: "You",
    });

    return mapInvoice(data);
  },

  async updateInvoiceStatus(id: string, status: Invoice["status"]): Promise<Invoice> {
    const { data: existing } = await supabase.from("invoices").select("*").eq("id", id).single();
    const { data, error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);

    if (status === "paid" && existing && existing.status !== "paid") {
      await supabase.from("transactions").insert({
        date: new Date().toISOString().split("T")[0],
        merchant: existing.client,
        category: "Invoice Cleared",
        amount: Number(existing.amount),
        type: "income",
        status: "cleared",
      });
      await addTimelineEvent({
        type: "invoice",
        title: "Invoice Paid",
        description: `${existing.invoice_number} from ${existing.client} settled`,
        amount: Number(existing.amount),
        actor: "System",
      });
    }

    return mapInvoice(data);
  },

  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Clients ---
  async getClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapClient);
  },

  async addClient(c: Omit<Client, "id" | "totalInvoiced" | "outstandingBalance" | "joinedDate">): Promise<Client> {
    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: c.name,
        email: c.email,
        phone: c.phone ?? null,
        status: c.status ?? "active",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await addTimelineEvent({
      type: "client",
      title: "New Client Onboarded",
      description: `${c.name} added to customer base`,
      actor: "You",
    });

    return mapClient(data);
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.totalInvoiced !== undefined) dbUpdates.total_invoiced = updates.totalInvoiced;
    if (updates.outstandingBalance !== undefined) dbUpdates.outstanding_balance = updates.outstandingBalance;

    const { data, error } = await supabase
      .from("clients")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapClient(data);
  },

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Products ---
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProduct);
  },

  async addProduct(p: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        reorder_level: p.reorderLevel,
        unit: p.unit,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await addTimelineEvent({
      type: "inventory",
      title: "Product Added",
      description: `${p.name} (${p.sku}) added to inventory`,
      actor: "You",
    });

    return mapProduct(data);
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.reorderLevel !== undefined) dbUpdates.reorder_level = updates.reorderLevel;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;

    const { data, error } = await supabase
      .from("products")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapProduct(data);
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Sales ---
  async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase
      .from("sales")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSale);
  },

  async addSale(sale: Omit<Sale, "id">): Promise<Sale> {
    const { data, error } = await supabase
      .from("sales")
      .insert({
        date: sale.date,
        product_id: sale.productId || null,
        product_name: sale.productName,
        quantity: sale.quantity,
        unit_price: sale.unitPrice,
        total_amount: sale.totalAmount,
        customer_id: sale.customerId || null,
        customer_name: sale.customerName,
        payment_method: sale.paymentMethod,
        status: sale.status,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Decrement stock
    if (sale.productId) {
      const { data: product } = await supabase
        .from("products")
        .select("stock, unit")
        .eq("id", sale.productId)
        .maybeSingle();
      if (product && product.stock < 999) {
        await supabase
          .from("products")
          .update({ stock: Math.max(0, product.stock - sale.quantity) })
          .eq("id", sale.productId);
      }
    }

    await addTimelineEvent({
      type: "sale",
      title: "Sale Recorded",
      description: `${sale.quantity}x ${sale.productName} sold to ${sale.customerName}`,
      amount: sale.totalAmount,
      actor: "You",
    });

    return mapSale(data);
  },

  async updateSaleStatus(id: string, status: Sale["status"]): Promise<Sale> {
    const { data, error } = await supabase
      .from("sales")
      .update({ status })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapSale(data);
  },

  async deleteSale(id: string): Promise<void> {
    const { error } = await supabase.from("sales").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Expenses ---
  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapExpense);
  },

  async addExpense(exp: Omit<Expense, "id">): Promise<Expense> {
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        date: exp.date,
        description: exp.description,
        category: exp.category,
        amount: exp.amount,
        payment_method: exp.paymentMethod,
        vendor: exp.vendor,
        status: exp.status,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    await addTimelineEvent({
      type: "expense",
      title: "Expense Logged",
      description: `${exp.description} — ${exp.vendor}`,
      amount: exp.amount,
      actor: "You",
    });

    return mapExpense(data);
  },

  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Suppliers ---
  async getSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSupplier);
  },

  async addSupplier(s: Omit<Supplier, "id" | "totalPurchased" | "outstandingPayable" | "joinedDate">): Promise<Supplier> {
    const { data, error } = await supabase
      .from("suppliers")
      .insert({
        name: s.name,
        contact_person: s.contactPerson,
        email: s.email,
        phone: s.phone,
        category: s.category,
        status: s.status ?? "active",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapSupplier(data);
  },

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.contactPerson !== undefined) dbUpdates.contact_person = updates.contactPerson;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.outstandingPayable !== undefined) dbUpdates.outstanding_payable = updates.outstandingPayable;

    const { data, error } = await supabase
      .from("suppliers")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapSupplier(data);
  },

  async deleteSupplier(id: string): Promise<void> {
    const { error } = await supabase.from("suppliers").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Partners ---
  async getPartners(): Promise<Partner[]> {
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapPartner);
  },

  async addPartner(p: Omit<Partner, "id" | "joinedDate">): Promise<Partner> {
    const { data, error } = await supabase
      .from("partners")
      .insert({
        name: p.name,
        role: p.role,
        equity: p.equity,
        contribution: p.contribution,
        email: p.email,
        phone: p.phone,
        status: p.status ?? "active",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapPartner(data);
  },

  async updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.equity !== undefined) dbUpdates.equity = updates.equity;
    if (updates.contribution !== undefined) dbUpdates.contribution = updates.contribution;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from("partners")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return mapPartner(data);
  },

  async deletePartner(id: string): Promise<void> {
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Notifications ---
  async getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapNotification);
  },

  async markNotificationRead(id: string): Promise<void> {
    const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
    if (error) throw new Error(error.message);
  },

  async markAllNotificationsRead(): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    if (error) throw new Error(error.message);
  },

  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  // --- Timeline ---
  async getTimeline(): Promise<TimelineEvent[]> {
    const { data, error } = await supabase
      .from("timeline_events")
      .select("*")
      .order("timestamp", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTimeline);
  },

  // --- Profile ---
  async getProfile(): Promise<BusinessProfile> {
    const { data, error } = await supabase
      .from("business_profiles")
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      return {
        name: "My Business",
        industry: "",
        currency: "KSh",
        taxRate: 0,
        country: "",
        city: "",
        phone: "",
        email: "",
        stripeConnected: false,
      };
    }
    return mapProfile(data);
  },

  async updateProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const dbUpdates: any = {};
    if (profile.name !== undefined) dbUpdates.name = profile.name;
    if (profile.industry !== undefined) dbUpdates.industry = profile.industry;
    if (profile.currency !== undefined) dbUpdates.currency = profile.currency;
    if (profile.taxRate !== undefined) dbUpdates.tax_rate = profile.taxRate;
    if (profile.country !== undefined) dbUpdates.country = profile.country;
    if (profile.city !== undefined) dbUpdates.city = profile.city;
    if (profile.phone !== undefined) dbUpdates.phone = profile.phone;
    if (profile.email !== undefined) dbUpdates.email = profile.email;
    if (profile.logoUrl !== undefined) dbUpdates.logo_url = profile.logoUrl;
    if (profile.stripeConnected !== undefined) dbUpdates.stripe_connected = profile.stripeConnected;

    const { data: existing } = await supabase
      .from("business_profiles")
      .select("id")
      .maybeSingle();

    let data;
    if (existing) {
      const res = await supabase
        .from("business_profiles")
        .update(dbUpdates)
        .eq("id", existing.id)
        .select()
        .single();
      data = res.data;
      if (res.error) throw new Error(res.error.message);
    } else {
      const res = await supabase
        .from("business_profiles")
        .insert(dbUpdates)
        .select()
        .single();
      data = res.data;
      if (res.error) throw new Error(res.error.message);
    }
    return mapProfile(data);
  },

  // --- AI (proxied through the Express server for Gemini API key) ---
  async getInsights(): Promise<VexaInsight[]> {
    const [{ metrics, profile }, invoices, transactions, products] = await Promise.all([
      this.getMetrics(),
      this.getInvoices(),
      this.getTransactions(),
      this.getProducts(),
    ]);
    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metrics,
        profile,
        invoices,
        transactions,
        products: products.map((p) => ({ id: p.id, name: p.name, stock: p.stock, unit: p.unit, reorderLevel: p.reorderLevel })),
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
  },

  async chat(message: string, history: { role: string; parts: { text: string }[] }[]): Promise<{ reply: string }> {
    const [{ metrics, profile }, invoices, transactions, products] = await Promise.all([
      this.getMetrics(),
      this.getInvoices(),
      this.getTransactions(),
      this.getProducts(),
    ]);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history,
        context: {
          metrics,
          profile,
          invoices,
          transactions,
          products: products.map((p) => ({ id: p.id, name: p.name, stock: p.stock, unit: p.unit, reorderLevel: p.reorderLevel })),
        },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Request failed: ${res.status}`);
    }
    return res.json();
  },
};
