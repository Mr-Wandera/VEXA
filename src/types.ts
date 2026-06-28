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
