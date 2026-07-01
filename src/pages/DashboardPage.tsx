import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Package, Users, CircleAlert as AlertCircle, Sparkles, Clock, ArrowRight } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { DashboardMetrics, BusinessProfile, VexaInsight } from "../types";
import StatCard from "../components/ui/StatCard";
import TrendChart from "../components/TrendChart";
import VexaInsightsPanel from "../components/VexaInsightsPanel";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import { useRouter } from "../lib/router";

interface DashboardPageProps {
  onAskAI: (query: string) => void;
  refreshKey?: number;
}

const INSIGHT_ACTION_MAP: Record<string, string> = {
  remind_overdue_inv_104: "Draft a professional reminder email for overdue invoice INV-2026-104 from Arc Software ($4,500)",
  "remind_overdue_inv-104": "Draft a professional reminder email for overdue invoice INV-2026-104 from Arc Software ($4,500)",
  optimize_saas: "Analyze my SaaS and cloud infrastructure spending. Where can I cut costs?",
  optimize_spend: "Analyze my SaaS and cloud infrastructure spending. Where can I cut costs?",
  view_runway: "Show me a detailed cash flow runway projection for the next 6 months",
  view_stripe: "What is the status of my Stripe integration and pending payouts?",
  reorder_p4: "I need to reorder Sticker Packs. Which supplier should I contact and what quantity?",
  analyze_marketing: "Analyze my marketing expenses. Is my ad spend generating good ROI?",
};

export default function DashboardPage({ onAskAI, refreshKey }: DashboardPageProps) {
  const { navigate } = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [insights, setInsights] = useState<VexaInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { loadData(); }, [refreshKey]);

  const loadData = async () => {
    setError(false);
    try {
      const { metrics, profile } = await apiClient.getMetrics();
      setMetrics(metrics);
      setProfile(profile);
      const ins = await apiClient.getInsights();
      setInsights(ins);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(true);
    } finally {
      setLoading(false);
      setInsightsLoading(false);
    }
  };

  const refreshInsights = async () => {
    setInsightsLoading(true);
    try {
      const ins = await apiClient.getInsights();
      setInsights(ins);
    } catch (err) { console.error(err); }
    finally { setInsightsLoading(false); }
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-xl shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
        <div className="h-80 rounded-2xl shimmer" />
      </div>
    );
  }

  if (error) return <ErrorState message="Failed to load dashboard data." onRetry={loadData} />;

  const currency = profile?.currency || "KSh";

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Your business at a glance — updated in real time." />

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Cash Reserve" value={metrics.cashReserve} prefix={currency + " "} icon={Wallet} accent="primary" trend={{ value: "+12%", type: "up" }} subtext="Available balance" delay={0} />
        <StatCard title="Net Profit" value={metrics.netProfit} prefix={currency + " "} icon={TrendingUp} accent="secondary" trend={{ value: "+8%", type: "up" }} subtext="This month" delay={0.05} />
        <StatCard title="Monthly Burn" value={metrics.monthlyBurn} prefix={currency + " "} icon={TrendingDown} accent="warning" trend={{ value: "-3%", type: "down" }} subtext="Operating expenses" delay={0.1} />
        <StatCard title="Runway" value={metrics.runwayMonths} suffix=" mo" icon={Clock} accent="accent" subtext="Months of cash left" delay={0.15} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Sales" value={metrics.totalSales} prefix={currency + " "} icon={DollarSign} accent="primary" delay={0.2} />
        <StatCard title="Customers" value={metrics.totalCustomers} icon={Users} accent="secondary" delay={0.25} />
        <StatCard title="Inventory Value" value={metrics.inventoryValue} prefix={currency + " "} icon={Package} accent="accent" delay={0.3} />
        <StatCard title="Outstanding" value={metrics.outstandingInvoices} prefix={currency + " "} icon={AlertCircle} accent="error" delay={0.35} />
      </div>

      {/* Charts + Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cash flow chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-hover"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-white">Cash Flow</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Revenue vs expenses over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-400"><span className="h-2 w-2 rounded-full bg-success-500" /> Income</span>
              <span className="flex items-center gap-1.5 text-neutral-400"><span className="h-2 w-2 rounded-full bg-error-500" /> Expense</span>
            </div>
          </div>
          <TrendChart type="cashflow" />
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-1"
        >
          <VexaInsightsPanel
            insights={insights}
            loading={insightsLoading}
            onRefresh={refreshInsights}
            onAction={(code) => {
              const prompt = INSIGHT_ACTION_MAP[code] || `Take action: ${code}`;
              onAskAI(prompt);
            }}
          />
        </motion.div>
      </div>

      {/* Quick actions row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {[
          { label: "Record Sale", path: "/app/sales", icon: DollarSign, color: "text-primary-400 bg-primary-500/10" },
          { label: "Add Product", path: "/app/inventory", icon: Package, color: "text-secondary-400 bg-secondary-500/10" },
          { label: "New Invoice", path: "/app/invoices", icon: AlertCircle, color: "text-accent-400 bg-accent-500/10" },
          { label: "Ask VEXA AI", path: "/app/ai", icon: Sparkles, color: "text-primary-400 bg-primary-500/10" },
        ].map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left backdrop-blur-xl card-hover"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="flex-1 text-sm font-medium text-white">{action.label}</span>
            <ArrowRight className="h-4 w-4 text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
          </button>
        ))}
      </motion.div>

      {/* Forecast chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-hover"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
          <div>
            <h3 className="font-display text-base font-semibold text-white">Cash Flow Forecast</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Projected balance for the next 6 months</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-primary-500/20 bg-primary-500/[0.04] px-3 py-1.5 text-xs text-primary-400">
            <Sparkles className="h-3 w-3" />
            AI Projected
          </div>
        </div>
        <TrendChart type="forecast" />
      </motion.div>
    </div>
  );
}
