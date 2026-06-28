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
  status: 'active' | 'inactive';
  totalInvoiced: number;
}

export interface BusinessProfile {
  name: string;
  industry: string;
  currency: string;
  taxRate: number;
  stripeConnected: boolean;
}

export class MockStore {
  transactions: Transaction[] = [];
  invoices: Invoice[] = [];
  clients: Client[] = [];
  profile: BusinessProfile = {
    name: "Aesthetic Lab LLC",
    industry: "Design & Software Engineering",
    currency: "USD",
    taxRate: 15,
    stripeConnected: true
  };

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Clients
    this.clients = [
      { id: "c1", name: "Linear Labs", email: "billing@linear.app", status: "active", totalInvoiced: 48000 },
      { id: "c2", name: "Stripe Tech", email: "finance@stripe.com", status: "active", totalInvoiced: 124000 },
      { id: "c3", name: "Vercel Inc", email: "payouts@vercel.com", status: "active", totalInvoiced: 72000 },
      { id: "c4", name: "Raycast Studio", email: "accounting@raycast.com", status: "active", totalInvoiced: 15000 },
      { id: "c5", name: "Arc Software", email: "billing@thebrowser.company", status: "inactive", totalInvoiced: 9500 }
    ];

    // Invoices
    this.invoices = [
      { id: "inv-101", invoiceNumber: "INV-2026-101", client: "Stripe Tech", amount: 18500, dueDate: "2026-06-15", status: "paid", createdDate: "2026-06-01" },
      { id: "inv-102", invoiceNumber: "INV-2026-102", client: "Vercel Inc", amount: 12000, dueDate: "2026-06-20", status: "paid", createdDate: "2026-06-05" },
      { id: "inv-103", invoiceNumber: "INV-2026-103", client: "Linear Labs", amount: 8400, dueDate: "2026-07-05", status: "pending", createdDate: "2026-06-15" },
      { id: "inv-104", invoiceNumber: "INV-2026-104", client: "Arc Software", amount: 4500, dueDate: "2026-06-10", status: "overdue", createdDate: "2026-05-25" },
      { id: "inv-105", invoiceNumber: "INV-2026-105", client: "Raycast Studio", amount: 7500, dueDate: "2026-07-15", status: "pending", createdDate: "2026-06-25" }
    ];

    // Transactions
    this.transactions = [
      { id: "t1", date: "2026-06-26", merchant: "Stripe Inc", category: "Client Retainer", amount: 18500, type: "income", status: "cleared", aiAnalysis: "Recurring premium retainer. Account health is excellent." },
      { id: "t2", date: "2026-06-25", merchant: "Vercel Hosting", category: "SaaS Infrastructure", amount: -480, type: "expense", status: "cleared", aiAnalysis: "Hosting cost increased by 4% MoM. Corresponds with user traffic expansion." },
      { id: "t3", date: "2026-06-24", merchant: "Amazon Web Services", category: "Cloud Servers", amount: -1420.50, type: "expense", status: "cleared", aiAnalysis: "AI GPU processing units cost. This is tax-deductible R&D." },
      { id: "t4", date: "2026-06-22", merchant: "GitHub Enterprise", category: "Developer Tools", amount: -210, type: "expense", status: "cleared", aiAnalysis: "Fixed operational subscription overhead." },
      { id: "t5", date: "2026-06-21", merchant: "Figma Professional", category: "Design Software", amount: -150, type: "expense", status: "cleared", aiAnalysis: "Design seat licensing. Reinvested into primary tooling." },
      { id: "t6", date: "2026-06-20", merchant: "Vercel Inc", category: "Client Retainer", amount: 12000, type: "income", status: "cleared", aiAnalysis: "Monthly Milestone billing. Cleared instantly." },
      { id: "t7", date: "2026-06-18", merchant: "Gusto Payroll", category: "Human Resources", amount: -8500, type: "expense", status: "cleared", aiAnalysis: "Primary employee payroll payout. Operational core cost." },
      { id: "t8", date: "2026-06-15", merchant: "Google Workspace", category: "Business Operations", amount: -84.20, type: "expense", status: "cleared", aiAnalysis: "Standard administrative email hosting." },
      { id: "t9", date: "2026-06-10", merchant: "Linear Corp", category: "Project Software", amount: -90, type: "expense", status: "cleared", aiAnalysis: "Internal issue tracking platform." },
      { id: "t10", date: "2026-06-05", merchant: "WeWork NYC", category: "Rent & Real Estate", amount: -1800, type: "expense", status: "cleared", aiAnalysis: "Hybrid physical office spacing lease." }
    ];
  }

  getOverviewMetrics() {
    const totalIncome = this.transactions
      .filter(t => t.type === 'income' && t.status === 'cleared')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = Math.abs(this.transactions
      .filter(t => t.type === 'expense' && t.status === 'cleared')
      .reduce((sum, t) => sum + t.amount, 0));

    const netProfit = totalIncome - totalExpense;

    // Monthly burn rate (based on current month expenses)
    const monthlyBurn = totalExpense; // simplified to current historical expenses
    const cashReserve = 148500.20; // base cash reserve + net updates can be calculated
    const runwayMonths = monthlyBurn > 0 ? Number((cashReserve / monthlyBurn).toFixed(1)) : 99;

    return {
      cashReserve,
      mrr: 38900, // standard MRR based on clients
      monthlyBurn,
      runwayMonths,
      netProfit,
      totalIncome,
      totalExpense
    };
  }

  addTransaction(t: Omit<Transaction, 'id' | 'aiAnalysis'>) {
    const newId = `t-${Date.now()}`;
    const transaction: Transaction = {
      ...t,
      id: newId,
      aiAnalysis: "Analysing with VEXA AI..."
    };
    this.transactions.unshift(transaction);
    return transaction;
  }

  addInvoice(inv: Omit<Invoice, 'id'>) {
    const newId = `inv-${Date.now()}`;
    const invoice: Invoice = {
      ...inv,
      id: newId
    };
    this.invoices.unshift(invoice);
    return invoice;
  }

  updateInvoiceStatus(id: string, status: 'paid' | 'pending' | 'overdue') {
    const inv = this.invoices.find(i => i.id === id);
    if (inv) {
      inv.status = status;
      if (status === 'paid') {
        // Record as an income transaction
        this.addTransaction({
          date: new Date().toISOString().split('T')[0],
          merchant: inv.client,
          category: "Invoice Cleared",
          amount: inv.amount,
          type: "income",
          status: "cleared"
        });
      }
    }
    return inv;
  }

  addClient(c: Omit<Client, 'id' | 'totalInvoiced'>) {
    const newId = `c-${Date.now()}`;
    const client: Client = {
      ...c,
      id: newId,
      totalInvoiced: 0
    };
    this.clients.unshift(client);
    return client;
  }

  updateProfile(profile: Partial<BusinessProfile>) {
    this.profile = { ...this.profile, ...profile };
    return this.profile;
  }
}

export const dbStore = new MockStore();
