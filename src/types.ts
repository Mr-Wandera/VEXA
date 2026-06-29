// ============================================================================
// VEXA — Domain Models
// Central type definitions for the entire application.
// Designed to be backend-agnostic: these interfaces represent the API contract
// between frontend and backend, regardless of whether the backend is the
// current in-memory MockStore or a future Go/PostgreSQL implementation.
// ============================================================================

// --- Core Financial Entities -----------------------------------------------

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'cleared' | 'pending';
  aiAnalysis?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  createdDate: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive';
  totalInvoiced: number;
  outstandingBalance: number;
  joinedDate: string;
}

// --- Sales & Inventory ------------------------------------------------------

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorderLevel: number;
  unit: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  customerId?: string;
  customerName: string;
  paymentMethod: 'cash' | 'mpesa' | 'card' | 'credit';
  status: 'completed' | 'pending' | 'refunded';
}

// --- Expenses ---------------------------------------------------------------

export interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentMethod: 'cash' | 'mpesa' | 'card' | 'bank';
  vendor: string;
  status: 'recorded' | 'reimbursed' | 'pending';
  receiptUrl?: string;
}

// --- Suppliers & Partners ---------------------------------------------------

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  totalPurchased: number;
  outstandingPayable: number;
  status: 'active' | 'inactive';
  joinedDate: string;
}

export interface Partner {
  id: string;
  name: string;
  role: string;
  equity: number;
  contribution: number;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

// --- Notifications & Timeline ------------------------------------------------

export interface Notification {
  id: string;
  type: 'alert' | 'success' | 'info' | 'ai';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionText?: string;
  actionCode?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'sale' | 'expense' | 'invoice' | 'inventory' | 'client' | 'ai' | 'system';
  title: string;
  description: string;
  timestamp: string;
  amount?: number;
  actor: string;
}

// --- Business Profile -------------------------------------------------------

export interface BusinessProfile {
  name: string;
  industry: string;
  currency: string;
  taxRate: number;
  country: string;
  city: string;
  phone: string;
  email: string;
  logoUrl?: string;
  stripeConnected: boolean;
}

// --- AI Entities ------------------------------------------------------------

export interface VexaInsight {
  id: string;
  type: 'alert' | 'recommendation' | 'success' | 'forecast';
  title: string;
  description: string;
  impactValue?: string;
  actionText?: string;
  actionCode?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

// --- Dashboard Metrics ------------------------------------------------------

export interface DashboardMetrics {
  cashReserve: number;
  mrr: number;
  monthlyBurn: number;
  runwayMonths: number;
  netProfit: number;
  totalIncome: number;
  totalExpense: number;
  totalSales: number;
  totalCustomers: number;
  inventoryValue: number;
  outstandingInvoices: number;
}

// --- Auth -------------------------------------------------------------------

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  businessId?: string;
}

// --- Repository Contract ----------------------------------------------------
// This interface defines the data access contract. The current implementation
// uses an in-memory store; a future implementation can swap in Supabase or a
// Go REST backend without changing any frontend code that depends on this.

export interface DataRepository {
  // Metrics
  getMetrics(): Promise<DashboardMetrics>;
  // Transactions
  getTransactions(): Promise<Transaction[]>;
  addTransaction(tx: Omit<Transaction, 'id' | 'aiAnalysis'>): Promise<Transaction>;
  // Invoices
  getInvoices(): Promise<Invoice[]>;
  addInvoice(inv: Omit<Invoice, 'id'>): Promise<Invoice>;
  updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice>;
  // Clients / Customers
  getClients(): Promise<Client[]>;
  addClient(c: Omit<Client, 'id' | 'totalInvoiced' | 'outstandingBalance' | 'joinedDate'>): Promise<Client>;
  // Products / Inventory
  getProducts(): Promise<Product[]>;
  addProduct(p: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  // Sales
  getSales(): Promise<Sale[]>;
  addSale(sale: Omit<Sale, 'id'>): Promise<Sale>;
  // Expenses
  getExpenses(): Promise<Expense[]>;
  addExpense(exp: Omit<Expense, 'id'>): Promise<Expense>;
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  addSupplier(s: Omit<Supplier, 'id' | 'totalPurchased' | 'outstandingPayable' | 'joinedDate'>): Promise<Supplier>;
  // Partners
  getPartners(): Promise<Partner[]>;
  addPartner(p: Omit<Partner, 'id' | 'joinedDate'>): Promise<Partner>;
  // Notifications
  getNotifications(): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  // Timeline
  getTimeline(): Promise<TimelineEvent[]>;
  // Profile
  getProfile(): Promise<BusinessProfile>;
  updateProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile>;
}
