import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, TrendingUp, Coins, Flame, ArrowUpRight, 
  FileText, Plus, LayoutDashboard, Settings, RefreshCw, 
  Bell, HelpCircle, History, Sparkle, Search, Landmark, ArrowRight, ShieldCheck, ChevronRight
} from "lucide-react";

// Sub-components
import MetricCard from "./components/MetricCard.tsx";
import TrendChart from "./components/TrendChart.tsx";
import VexaInsightsPanel from "./components/VexaInsightsPanel.tsx";
import VexaChatBot from "./components/VexaChatBot.tsx";
import AddTransactionModal from "./components/AddTransactionModal.tsx";
import InvoiceManager from "./components/InvoiceManager.tsx";
import ClientSettingsManager from "./components/ClientSettingsManager.tsx";

// Types
import { Transaction, Invoice, Client, BusinessProfile, VexaInsight } from "./types.ts";

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'ledger' | 'settings'>('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  // Core Ledger/State from API
  const [metrics, setMetrics] = useState({
    cashReserve: 148500.20,
    mrr: 32400,
    monthlyBurn: 12500,
    runwayMonths: 11.9,
    netProfit: 25280,
    totalIncome: 38900,
    totalExpense: 13620
  });
  const [profile, setProfile] = useState<BusinessProfile>({
    name: "Aesthetic Lab LLC",
    industry: "Design & Software Engineering",
    currency: "USD",
    taxRate: 15,
    stripeConnected: true
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [insights, setInsights] = useState<VexaInsight[]>([]);

  // Feed/Insight loading states
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch full state from backend on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingData(true);
    try {
      const [metricsRes, transRes, invoicesRes, clientsRes] = await Promise.all([
        fetch("/api/metrics").then(r => r.json()),
        fetch("/api/transactions").then(r => r.json()),
        fetch("/api/invoices").then(r => r.json()),
        fetch("/api/clients").then(r => r.json())
      ]);

      setMetrics(metricsRes.metrics);
      setProfile(metricsRes.profile);
      setTransactions(transRes);
      setInvoices(invoicesRes);
      setClients(clientsRes);

      // Fetch AI Insights once standard state is ready
      fetchAIInsights();
    } catch (err) {
      console.error("Error loading application states:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAIInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/insights");
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error("Error generating insights feed:", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleAddTransaction = async (tx: Omit<Transaction, 'id' | 'aiAnalysis'>) => {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tx)
      });
      const data = await res.json();
      // Prepend to transaction feed
      setTransactions(prev => [data, ...prev]);
      
      // Update overall dashboard metrics
      const metricsRes = await fetch("/api/metrics").then(r => r.json());
      setMetrics(metricsRes.metrics);

      // Re-trigger dynamic insight update
      fetchAIInsights();
    } catch (e) {
      console.error("Failed to add transaction:", e);
    }
  };

  const handleCreateInvoice = async (inv: { client: string; amount: number; dueDate: string }) => {
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inv)
      });
      const data = await res.json();
      setInvoices(prev => [data, ...prev]);
      
      const metricsRes = await fetch("/api/metrics").then(r => r.json());
      setMetrics(metricsRes.metrics);
      fetchAIInsights();
    } catch (e) {
      console.error("Failed to create invoice:", e);
    }
  };

  const handleInvoiceStatusChange = async (id: string, status: 'paid' | 'pending' | 'overdue') => {
    try {
      const res = await fetch(`/api/invoices/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      
      // Update invoice item
      setInvoices(prev => prev.map(i => i.id === id ? data : i));
      
      // Refresh transactions and metrics since marking paid logs a revenue transaction
      const transRes = await fetch("/api/transactions").then(r => r.json());
      const metricsRes = await fetch("/api/metrics").then(r => r.json());
      
      setTransactions(transRes);
      setMetrics(metricsRes.metrics);
      fetchAIInsights();
    } catch (e) {
      console.error("Failed to transition invoice status:", e);
    }
  };

  const handleAddClient = async (c: { name: string; email: string }) => {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(c)
      });
      const data = await res.json();
      setClients(prev => [data, ...prev]);
    } catch (e) {
      console.error("Failed to onboarding client:", e);
    }
  };

  const handleUpdateProfile = async (prof: Partial<BusinessProfile>) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prof)
      });
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      console.error("Failed to save profile:", e);
    }
  };

  const handleInsightAction = (code: string) => {
    if (code.startsWith("remind_overdue_")) {
      const invNum = code.split("-")[1] || "INV-2026-104";
      setChatQuery(`Draft overdue invoice INV-2026-${invNum} reminder`);
      setChatOpen(true);
    } else if (code === "optimize_saas") {
      setChatQuery("How can I optimize our cloud hosting burn rate?");
      setChatOpen(true);
    } else if (code === "view_runway") {
      setChatQuery("What is my current runway and cash reserve?");
      setChatOpen(true);
    } else {
      setChatQuery("Give me a financial performance overview");
      setChatOpen(true);
    }
  };

  const handleTriggerDraftReminder = (invNum: string) => {
    setChatQuery(`Draft overdue invoice ${invNum} reminder`);
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-neutral-200 selection:bg-indigo-500/30 selection:text-white">
      {/* Dynamic Grid Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-10 border-b border-neutral-900/80 bg-neutral-950/40 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25">
                <Sparkle className="h-4.5 w-4.5 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">
                VEXA
              </span>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center gap-1.5 rounded-xl bg-neutral-950 p-1 border border-neutral-900">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                  activeTab === 'dashboard' 
                    ? 'bg-neutral-800 text-white shadow' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Command Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                  activeTab === 'invoices' 
                    ? 'bg-neutral-800 text-white shadow' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Invoice Ledger</span>
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                  activeTab === 'ledger' 
                    ? 'bg-neutral-800 text-white shadow' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Coins className="h-3.5 w-3.5" />
                <span>Operating Book</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition ${
                  activeTab === 'settings' 
                    ? 'bg-neutral-800 text-white shadow' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Clients & Profile</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Operational State Indicator */}
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-neutral-900 bg-neutral-950/60 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                LEDGER ACTIVE
              </span>
            </div>

            {/* AI Assistant Button Trigger */}
            <button
              onClick={() => { setChatQuery(""); setChatOpen(prev => !prev); }}
              className="relative group rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition flex items-center gap-2 shadow-lg shadow-indigo-600/10"
            >
              <Sparkles className="h-4 w-4 animate-pulse text-indigo-200" />
              <span>Ask VEXA AI</span>
              {/* Hot indicator badge */}
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-indigo-400 ring-2 ring-[#07080a]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Operational Body */}
      <main className="mx-auto max-w-7xl px-6 py-8 relative z-10">
        {loadingData ? (
          /* High quality loading skeleton */
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl border border-neutral-800/40 bg-neutral-900/20 p-6" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 rounded-2xl border border-neutral-800/40 bg-neutral-900/20" />
              <div className="lg:col-span-1 h-96 rounded-2xl border border-neutral-800/40 bg-neutral-900/20" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Context Header with user focus */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-semibold text-indigo-400 tracking-wide">{profile.name}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-600" />
                  <span className="text-xs font-mono text-neutral-500">{profile.industry}</span>
                </div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-white mt-1">
                  Operating Dashboard
                </h1>
              </div>

              {/* Instant action triggers */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsTxModalOpen(true)}
                  className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-900 transition flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Log Transaction</span>
                </button>
              </div>
            </div>

            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* 4 Premium Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <MetricCard
                    title="Operating Capital"
                    value={`$${metrics.cashReserve.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    subtext="Consolidated cash-on-hand reserve"
                    icon={Coins}
                    glowColor="rgba(59, 130, 246, 0.15)"
                  />
                  <MetricCard
                    title="Monthly Recurring Revenue"
                    value={`$${metrics.mrr.toLocaleString()}`}
                    subtext="Fixed operational contract values"
                    trend={{ value: "+12.4% MoM", type: "up" }}
                    icon={TrendingUp}
                    glowColor="rgba(16, 185, 129, 0.15)"
                  />
                  <MetricCard
                    title="Monthly Cash Burn"
                    value={`$${metrics.monthlyBurn.toLocaleString()}`}
                    subtext="Payroll, servers, & workspaces"
                    trend={{ value: "-4.2% optimized", type: "up" }} // up means positive impact (lower burn)
                    icon={Flame}
                    glowColor="rgba(244, 63, 94, 0.15)"
                  />
                  <MetricCard
                    title="Capital Runway"
                    value={`${metrics.runwayMonths} months`}
                    subtext="Survival limit at current burn rate"
                    trend={{ value: "Secure margin", type: "neutral" }}
                    icon={ShieldCheck}
                    glowColor="rgba(147, 51, 234, 0.15)"
                  />
                </div>

                {/* Dashboard Secondary Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Visual Charts & Activity */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Cash Flow Area Chart */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-xl">
                      <div>
                        <h3 className="font-display text-sm font-semibold text-white tracking-wide">
                          Operational Cash Flow (YTD)
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5">Analysis of monthly cash intake vs core business spend.</p>
                      </div>
                      <TrendChart type="cashflow" />
                    </div>

                    {/* Recent Transactions list with AI classifications */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-xl">
                      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-5">
                        <div>
                          <h3 className="font-display text-sm font-semibold text-white tracking-wide">
                            Operating Ledger Records
                          </h3>
                          <p className="text-xs text-neutral-400 mt-0.5">Real-time ledger events with automated VEXA AI tagging.</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('ledger')}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 group"
                        >
                          <span>Full operating book</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>

                      {/* Transactions Grid list */}
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map((tx) => (
                          <div key={tx.id} className="rounded-xl border border-neutral-800/40 bg-neutral-950/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-950/40 transition">
                            <div className="flex items-start gap-3.5">
                              <div className={`mt-0.5 rounded-lg p-2 font-semibold ${
                                tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {tx.type === 'income' ? "+" : "-"}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-white leading-snug">{tx.merchant}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-[10px] text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">{tx.category}</span>
                                  <span className="font-mono text-[10px] text-neutral-500">{tx.date}</span>
                                </div>
                                {tx.aiAnalysis && (
                                  <p className="mt-2 text-xs text-neutral-400 font-sans flex items-center gap-1.5 border-t border-neutral-800/40 pt-1.5">
                                    <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
                                    <span>{tx.aiAnalysis}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right sm:self-start">
                              <span className={`font-mono text-sm font-semibold ${
                                tx.type === 'income' ? 'text-emerald-400' : 'text-white'
                              }`}>
                                {tx.type === 'income' ? "" : "-"}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="block font-mono text-[9px] uppercase tracking-wide text-neutral-500 mt-1">{tx.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Generative AI insights panel */}
                  <div className="lg:col-span-1">
                    <VexaInsightsPanel
                      insights={insights}
                      loading={loadingInsights}
                      onRefresh={fetchAIInsights}
                      onAction={handleInsightAction}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Invoices View */}
            {activeTab === 'invoices' && (
              <InvoiceManager
                invoices={invoices}
                onCreate={handleCreateInvoice}
                onStatusChange={handleInvoiceStatusChange}
                onDraftReminder={handleTriggerDraftReminder}
              />
            )}

            {/* Operating Book (Ledger) View */}
            {activeTab === 'ledger' && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
                  <div>
                    <h3 className="font-display text-base font-semibold text-white tracking-wide">
                      Capital Ledgers
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Auditable transactions log, synchronized with primary corporate reserves.</p>
                  </div>
                  <button
                    onClick={() => setIsTxModalOpen(true)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Log Transaction</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="rounded-xl border border-neutral-800/40 bg-neutral-950/20 p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-950/40 transition">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 rounded-lg p-2 font-mono text-xs font-bold ${
                          tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {tx.type === 'income' ? "IN" : "OUT"}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white leading-snug">{tx.merchant}</h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="font-mono text-[10px] text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800">{tx.category}</span>
                            <span className="font-mono text-[10px] text-neutral-500">{tx.date}</span>
                          </div>
                          {tx.aiAnalysis && (
                            <p className="mt-2 text-xs text-neutral-400 font-sans flex items-center gap-1.5 border-t border-neutral-800/40 pt-2">
                              <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                              <span>{tx.aiAnalysis}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right sm:self-start">
                        <span className={`font-mono text-sm font-semibold ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-white'
                        }`}>
                          {tx.type === 'income' ? "" : "-"}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="block font-mono text-[9px] uppercase tracking-wide text-neutral-500 mt-1">{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clients & settings View */}
            {activeTab === 'settings' && (
              <ClientSettingsManager
                clients={clients}
                profile={profile}
                onAddClient={handleAddClient}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
          </div>
        )}
      </main>

      {/* Side consultation AI assistant slider */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-neutral-950/90 border-l border-neutral-800 shadow-2xl backdrop-blur-2xl flex flex-col"
          >
            <VexaChatBot
              initialQuery={chatQuery}
              onClose={() => setChatOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Record Transaction Modal popup */}
      <AddTransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
}
