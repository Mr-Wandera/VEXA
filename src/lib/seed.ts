import { supabase } from "./supabase";

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

/**
 * Seeds a freshly-created account with a starter business profile and demo
 * data so the dashboard is not empty on first login. Idempotent: if a profile
 * already exists for the user, it returns early.
 */
export async function seedNewAccount(userId: string): Promise<void> {
  const { data: existing } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  const { data: profile } = await supabase
    .from("business_profiles")
    .insert({
      user_id: userId,
      name: "Aesthetic Lab LLC",
      industry: "Design & Software Engineering",
      currency: "KSh",
      tax_rate: 16,
      country: "Kenya",
      city: "Nairobi",
      phone: "+254 700 000 000",
      email: "founder@aestheticlab.co",
      stripe_connected: true,
    })
    .select()
    .maybeSingle();

  if (!profile) return;

  // Clients
  const clients = [
    { user_id: userId, name: "Brian Kamau", email: "brian@example.com", phone: "+254 700 111 222", status: "active", total_invoiced: 48000, outstanding_balance: 0, joined_date: daysAgo(120) },
    { user_id: userId, name: "Aisha Mohammed", email: "aisha@example.com", phone: "+254 700 333 444", status: "active", total_invoiced: 124000, outstanding_balance: 8400, joined_date: daysAgo(90) },
    { user_id: userId, name: "Vercel Inc", email: "payouts@vercel.com", status: "active", total_invoiced: 72000, outstanding_balance: 0, joined_date: daysAgo(60) },
    { user_id: userId, name: "Raycast Studio", email: "accounting@raycast.com", status: "active", total_invoiced: 15000, outstanding_balance: 7500, joined_date: daysAgo(30) },
    { user_id: userId, name: "Arc Software", email: "billing@thebrowser.company", status: "inactive", total_invoiced: 9500, outstanding_balance: 4500, joined_date: daysAgo(45) },
  ];
  const { data: insertedClients } = await supabase.from("clients").insert(clients).select();
  const clientMap = new Map((insertedClients ?? []).map((c) => [c.name, c.id]));

  // Products
  const products = [
    { user_id: userId, name: "Premium Hoodie", sku: "HD-001", category: "Apparel", price: 2500, cost: 1200, stock: 45, reorder_level: 15, unit: "pcs" },
    { user_id: userId, name: "T-Shirt (White)", sku: "TS-002", category: "Apparel", price: 1200, cost: 450, stock: 8, reorder_level: 20, unit: "pcs" },
    { user_id: userId, name: "Coffee Mug (Branded)", sku: "MG-003", category: "Merchandise", price: 600, cost: 200, stock: 120, reorder_level: 30, unit: "pcs" },
    { user_id: userId, name: "Sticker Pack", sku: "ST-004", category: "Merchandise", price: 300, cost: 80, stock: 3, reorder_level: 25, unit: "pack" },
    { user_id: userId, name: "Design Service (1hr)", sku: "SV-005", category: "Services", price: 5000, cost: 0, stock: 999, reorder_level: 0, unit: "hr" },
    { user_id: userId, name: "Web Hosting (Monthly)", sku: "SV-006", category: "Services", price: 3500, cost: 500, stock: 999, reorder_level: 0, unit: "mo" },
  ];
  const { data: insertedProducts } = await supabase.from("products").insert(products).select();
  const productMap = new Map((insertedProducts ?? []).map((p) => [p.name, p.id]));

  // Invoices
  const invoices = [
    { user_id: userId, invoice_number: "INV-2026-101", client: "Aisha Mohammed", amount: 18500, due_date: daysAgo(10), status: "paid", created_date: daysAgo(25) },
    { user_id: userId, invoice_number: "INV-2026-102", client: "Vercel Inc", amount: 12000, due_date: daysAgo(5), status: "paid", created_date: daysAgo(20) },
    { user_id: userId, invoice_number: "INV-2026-103", client: "Brian Kamau", amount: 8400, due_date: daysFromNow(7), status: "pending", created_date: daysAgo(10) },
    { user_id: userId, invoice_number: "INV-2026-104", client: "Arc Software", amount: 4500, due_date: daysAgo(15), status: "overdue", created_date: daysAgo(35) },
    { user_id: userId, invoice_number: "INV-2026-105", client: "Raycast Studio", amount: 7500, due_date: daysFromNow(14), status: "pending", created_date: daysAgo(2) },
  ];
  await supabase.from("invoices").insert(invoices);

  // Sales
  const sales = [
    { user_id: userId, date: daysAgo(0), product_id: productMap.get("Premium Hoodie") ?? null, product_name: "Premium Hoodie", quantity: 2, unit_price: 2500, total_amount: 5000, customer_id: null, customer_name: "Walk-in Customer", payment_method: "mpesa", status: "completed" },
    { user_id: userId, date: daysAgo(1), product_id: productMap.get("Coffee Mug (Branded)") ?? null, product_name: "Coffee Mug (Branded)", quantity: 5, unit_price: 600, total_amount: 3000, customer_id: clientMap.get("Aisha Mohammed") ?? null, customer_name: "Aisha Mohammed", payment_method: "cash", status: "completed" },
    { user_id: userId, date: daysAgo(2), product_id: productMap.get("Design Service (1hr)") ?? null, product_name: "Design Service (1hr)", quantity: 3, unit_price: 5000, total_amount: 15000, customer_id: clientMap.get("Brian Kamau") ?? null, customer_name: "Brian Kamau", payment_method: "mpesa", status: "completed" },
    { user_id: userId, date: daysAgo(3), product_id: productMap.get("T-Shirt (White)") ?? null, product_name: "T-Shirt (White)", quantity: 4, unit_price: 1200, total_amount: 4800, customer_id: null, customer_name: "Walk-in Customer", payment_method: "card", status: "completed" },
    { user_id: userId, date: daysAgo(4), product_id: productMap.get("Web Hosting (Monthly)") ?? null, product_name: "Web Hosting (Monthly)", quantity: 1, unit_price: 3500, total_amount: 3500, customer_id: clientMap.get("Vercel Inc") ?? null, customer_name: "Vercel Inc", payment_method: "mpesa", status: "completed" },
    { user_id: userId, date: daysAgo(5), product_id: productMap.get("Premium Hoodie") ?? null, product_name: "Premium Hoodie", quantity: 1, unit_price: 2500, total_amount: 2500, customer_id: clientMap.get("Raycast Studio") ?? null, customer_name: "Raycast Studio", payment_method: "credit", status: "pending" },
  ];
  await supabase.from("sales").insert(sales);

  // Expenses
  const expenses = [
    { user_id: userId, date: daysAgo(1), description: "Vercel Hosting", category: "SaaS Infrastructure", amount: 480, payment_method: "card", vendor: "Vercel", status: "recorded" },
    { user_id: userId, date: daysAgo(2), description: "AWS Cloud Servers", category: "Cloud Servers", amount: 1420, payment_method: "card", vendor: "Amazon Web Services", status: "recorded" },
    { user_id: userId, date: daysAgo(3), description: "GitHub Enterprise", category: "Developer Tools", amount: 210, payment_method: "card", vendor: "GitHub", status: "recorded" },
    { user_id: userId, date: daysAgo(4), description: "Figma Professional", category: "Design Software", amount: 150, payment_method: "card", vendor: "Figma", status: "recorded" },
    { user_id: userId, date: daysAgo(5), description: "Staff Payroll", category: "Human Resources", amount: 8500, payment_method: "bank", vendor: "Gusto", status: "recorded" },
    { user_id: userId, date: daysAgo(6), description: "Office Rent", category: "Rent & Real Estate", amount: 1800, payment_method: "bank", vendor: "WeWork", status: "recorded" },
    { user_id: userId, date: daysAgo(7), description: "Google Workspace", category: "Business Operations", amount: 84, payment_method: "card", vendor: "Google", status: "recorded" },
    { user_id: userId, date: daysAgo(8), description: "Facebook Ads Campaign", category: "Marketing & Growth", amount: 1200, payment_method: "card", vendor: "Meta", status: "recorded" },
  ];
  await supabase.from("expenses").insert(expenses);

  // Suppliers
  const suppliers = [
    { user_id: userId, name: "Nairobi Textile Co.", contact_person: "John Mwangi", email: "john@nairobitextile.co.ke", phone: "+254 720 111 111", category: "Apparel Manufacturing", total_purchased: 85000, outstanding_payable: 12000, status: "active", joined_date: daysAgo(100) },
    { user_id: userId, name: "PrintHub Kenya", contact_person: "Sarah Wanjiku", email: "sarah@printhub.co.ke", phone: "+254 720 222 222", category: "Printing Services", total_purchased: 32000, outstanding_payable: 0, status: "active", joined_date: daysAgo(80) },
    { user_id: userId, name: "CloudHost Africa", contact_person: "David Otieno", email: "david@cloudhost.africa", phone: "+254 720 333 333", category: "Cloud Infrastructure", total_purchased: 45000, outstanding_payable: 4500, status: "active", joined_date: daysAgo(90) },
    { user_id: userId, name: "Office Supplies Ltd", contact_person: "Mary Akinyi", email: "mary@officesupplies.co.ke", phone: "+254 720 444 444", category: "Office Supplies", total_purchased: 15000, outstanding_payable: 0, status: "inactive", joined_date: daysAgo(70) },
  ];
  await supabase.from("suppliers").insert(suppliers);

  // Partners
  const partners = [
    { user_id: userId, name: "Founder One", role: "CEO & Founder", equity: 60, contribution: 500000, email: "founder@vexa.co", phone: "+254 700 000 001", status: "active", joined_date: daysAgo(365) },
    { user_id: userId, name: "Co-Founder Two", role: "CTO & Co-Founder", equity: 25, contribution: 200000, email: "cto@vexa.co", phone: "+254 700 000 002", status: "active", joined_date: daysAgo(365) },
    { user_id: userId, name: "Investor Three", role: "Angel Investor", equity: 10, contribution: 150000, email: "investor@vc.com", phone: "+254 700 000 003", status: "active", joined_date: daysAgo(180) },
    { user_id: userId, name: "Advisor Four", role: "Strategic Advisor", equity: 5, contribution: 50000, email: "advisor@vc.com", phone: "+254 700 000 004", status: "active", joined_date: daysAgo(120) },
  ];
  await supabase.from("partners").insert(partners);

  // Transactions (general ledger)
  const transactions = [
    { user_id: userId, date: daysAgo(0), merchant: "Walk-in Customer", category: "Product Sale", amount: 5000, type: "income", status: "cleared", ai_analysis: "Strong product sale. Hoodie margins at 52%." },
    { user_id: userId, date: daysAgo(1), merchant: "Vercel Hosting", category: "SaaS Infrastructure", amount: -480, type: "expense", status: "cleared", ai_analysis: "Hosting cost increased 4% MoM. Traffic expansion." },
    { user_id: userId, date: daysAgo(2), merchant: "Amazon Web Services", category: "Cloud Servers", amount: -1420, type: "expense", status: "cleared", ai_analysis: "AI GPU processing. Tax-deductible R&D." },
    { user_id: userId, date: daysAgo(3), merchant: "GitHub Enterprise", category: "Developer Tools", amount: -210, type: "expense", status: "cleared", ai_analysis: "Fixed operational subscription." },
    { user_id: userId, date: daysAgo(4), merchant: "Figma Professional", category: "Design Software", amount: -150, type: "expense", status: "cleared", ai_analysis: "Design seat licensing." },
    { user_id: userId, date: daysAgo(5), merchant: "Aisha Mohammed", category: "Client Retainer", amount: 18500, type: "income", status: "cleared", ai_analysis: "Recurring retainer. Account health excellent." },
    { user_id: userId, date: daysAgo(6), merchant: "Gusto Payroll", category: "Human Resources", amount: -8500, type: "expense", status: "cleared", ai_analysis: "Primary payroll. Core operational cost." },
    { user_id: userId, date: daysAgo(7), merchant: "Google Workspace", category: "Business Operations", amount: -84, type: "expense", status: "cleared", ai_analysis: "Standard email hosting." },
    { user_id: userId, date: daysAgo(8), merchant: "WeWork NYC", category: "Rent & Real Estate", amount: -1800, type: "expense", status: "cleared", ai_analysis: "Hybrid office lease." },
    { user_id: userId, date: daysAgo(9), merchant: "Meta Ads", category: "Marketing & Growth", amount: -1200, type: "expense", status: "cleared", ai_analysis: "Facebook ad campaign. Monitor ROAS." },
  ];
  await supabase.from("transactions").insert(transactions);

  // Notifications
  const notifications = [
    { user_id: userId, type: "alert", title: "Overdue Invoice", description: "INV-2026-104 for Arc Software (KSh 4,500) is 15 days overdue.", read: false, action_text: "Draft Reminder", action_code: "remind_overdue_inv-104" },
    { user_id: userId, type: "ai", title: "VEXA AI: Low Stock Alert", description: "Sticker Packs will run out in 2 days. Reorder recommended.", read: false, action_text: "Reorder", action_code: "reorder_p4" },
    { user_id: userId, type: "success", title: "Payment Received", description: "KSh 18,500 from Aisha Mohammed has been received and reconciled.", read: false },
    { user_id: userId, type: "info", title: "New Sale Recorded", description: "2x Premium Hoodie sold to Walk-in Customer via M-Pesa.", read: true },
    { user_id: userId, type: "alert", title: "Expense Spike", description: "Marketing costs increased 18% this week compared to last.", read: false, action_text: "Analyze", action_code: "analyze_marketing" },
  ];
  await supabase.from("notifications").insert(notifications);

  // Timeline
  const timeline = [
    { user_id: userId, type: "sale", title: "Sale Recorded", description: "2x Premium Hoodie sold to Walk-in Customer", amount: 5000, actor: "System" },
    { user_id: userId, type: "ai", title: "VEXA AI Insight", description: "Identified low stock on Sticker Packs — reorder suggested", actor: "VEXA AI" },
    { user_id: userId, type: "invoice", title: "Invoice Paid", description: "INV-2026-101 from Aisha Mohammed settled", amount: 18500, actor: "System" },
    { user_id: userId, type: "expense", title: "Expense Logged", description: "AWS Cloud Servers — KSh 1,420", amount: 1420, actor: "Founder" },
    { user_id: userId, type: "client", title: "New Client Onboarded", description: "Raycast Studio added to customer base", actor: "Founder" },
    { user_id: userId, type: "inventory", title: "Stock Updated", description: "Premium Hoodie restocked to 45 units", actor: "Founder" },
  ];
  await supabase.from("timeline_events").insert(timeline);
}
