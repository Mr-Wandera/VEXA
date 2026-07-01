import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Package, Users, CircleAlert as AlertCircle, Sparkles, Clock, ArrowRight, Activity, Zap, CircleCheck as CheckCircle2 } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { DashboardMetrics, BusinessProfile, VexaInsight, TimelineEvent } from "../types";
import StatCard from "../components/ui/StatCard";
import TrendChart from "../components/TrendChart";
import VexaInsightsPanel from "../components/VexaInsightsPanel";
import ErrorState from "../components/ui/ErrorState";
import { useRouter } from "../lib/router";

interface DashboardPageProps {
  onAskAI: (query: string) => void;
  refreshKey?: number;
}

const INSIGHT_ACTION_MAP: Record<string, string> = {
  view_runway: "Show me a detailed cash flow runway projection for the next 6 months",
  view_stripe: "What is the status of my Stripe integration and pending payouts?",
  optimize_saas: "Analyze my SaaS and cloud infrastructure spending. Where can I cut costs?",
  optimize_spend: "Analyze my SaaS and cloud infrastructure spending. Where can I cut costs?",
  analyze_marketing: "Analyze my marketing expenses. Is my ad spend generating good ROI?",
};

export default function DashboardPage({ onAskAI, refreshKey }: DashboardPageProps) {
  const { navigate } = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [insights, setInsights] = useState<VexaInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => { loadData(); }, [refreshKey]);

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [{ metrics, profile }, events] = await Promise.all([
        apiClient.getMetrics(),
        apiClient.getTimeline(),
      ]);
      setMetrics(metrics);
      setProfile(profile);
      setTimeline(events.slice(0, 5));
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
    // Load insights independently — failure shouldn't break the dashboard
    setInsightsLoading(true);
    try { setInsights(await apiClient.getInsights()); }
    catch (err) { console.error("Insights failed:", err); setInsights([]); }
    finally { setInsightsLoading(false); }
  };

  const refreshInsights = async () => {
    setInsightsLoading(true);
    try { setInsights(await apiClient.getInsights()); }
    catch (err) { console.error(err); }
    finally { setInsightsLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 rounded-2xl shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer" />)}
        </div>
        <div className="h-80 rounded-2xl shimmer" />
      </div>
    );
  }

  if (error || !metrics) return <ErrorState message="Failed to load dashboard data." onRetry={loadData} />;

  const currency = profile?.currency || "KSh";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = profile?.name?.split(" ")[0] || "there";
  const healthScore = metrics.runwayMonths > 12 ? 90 : metrics.runwayMonths > 6 ? 70 : metrics.runwayMonths > 3 ? 50 : 30;
  const healthColor = healthScore > 70 ? "text-success-400" : healthScore > 50 ? "text-warning-400" : "text-error-400";
  const healthBg = healthScore > 70 ? "bg-success-500" : healthScore > 50 ? "bg-warning-500" : "bg-error-500";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
      >
        <div className="ambient-orb bg-primary-500/10 h-40 w-40 -right-10 -top-10 float-anim" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-success-400 live-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-success-400">All systems operational</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
              {greeting}, <span className="gradient-animated">{firstName}</span>
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Here's your business summary for {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">Business Health</p>
              <p className={`font-display text-2xl font-bold ${healthColor}`}>{healthScore}<span className="text-sm text-neutral-500">/100</span></p>
            </div>
            <div className="relative h-14 w-14">
              <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <motion.circle
                  cx="28" cy="28" r="24" fill="none" stroke="currentColor"
                  strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${(healthScore / 100) * 150.8} 150.8`}
                  className={healthColor}
                  initial={{ strokeDasharray: "0 150.8" }}
                  animate={{ strokeDasharray: `${(healthScore / 100) * 150.8} 150.8` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Primary stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Cash Reserve" value={metrics.cashReserve} prefix={currency + " "} icon={Wallet} accent="primary" subtext="Available balance" delay={0} />
        <StatCard title="Net Profit" value={metrics.netProfit} prefix={currency + " "} icon={TrendingUp} accent="secondary" subtext="This period" delay={0.05} />
        <StatCard title="Monthly Burn" value={metrics.monthlyBurn} prefix={currency + " "} icon={TrendingDown} accent="warning" subtext="Operating expenses" delay={0.1} />
        <StatCard title="Runway" value={metrics.runwayMonths} suffix=" mo" icon={Clock} accent="accent" subtext="Months of cash left" delay={0.15} />
      </div>

      {/* Charts + Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cash flow chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-premium"
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
          transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
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

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left backdrop-blur-xl card-premium"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="flex-1 text-sm font-medium text-white">{action.label}</span>
            <ArrowRight className="h-4 w-4 text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
          </button>
        ))}
      </motion.div>

      {/* Secondary stats + activity feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Secondary stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-1 space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Sales" value={metrics.totalSales} prefix={currency + " "} icon={DollarSign} accent="primary" delay={0.4} />
            <StatCard title="Customers" value={metrics.totalCustomers} icon={Users} accent="secondary" delay={0.45} />
            <StatCard title="Inventory" value={metrics.inventoryValue} prefix={currency + " "} icon={Package} accent="accent" delay={0.5} />
            <StatCard title="Outstanding" value={metrics.outstandingInvoices} prefix={currency + " "} icon={AlertCircle} accent="error" delay={0.55} />
          </div>
        </motion.div>

        {/* Live activity feed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-premium"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary-400" />
              <h3 className="font-display text-base font-semibold text-white">Recent Activity</h3>
            </div>
            <button onClick={() => navigate("/app/timeline")} className="text-xs font-medium text-primary-400 transition hover:text-primary-300">
              View all →
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {timeline.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">No recent activity.</p>
            ) : (
              timeline.map((event, i) => (
                <motion.div
                  key={event.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 transition hover:bg-white/[0.03]"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    event.type === "sale" ? "bg-success-500/10 text-success-400"
                    : event.type === "expense" ? "bg-error-500/10 text-error-400"
                    : event.type === "invoice" ? "bg-secondary-500/10 text-secondary-400"
                    : "bg-neutral-500/10 text-neutral-400"
                  }`}>
                    {event.type === "sale" ? <DollarSign className="h-4 w-4" />
                    : event.type === "expense" ? <TrendingDown className="h-4 w-4" />
                    : event.type === "invoice" ? <AlertCircle className="h-4 w-4" />
                    : <Activity className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{event.title}</p>
                    <p className="text-xs text-neutral-500">{event.description}</p>
                  </div>
                  {event.amount !== undefined && event.amount !== 0 && (
                    <span className={`font-mono text-xs font-semibold shrink-0 ${event.type === "expense" ? "text-error-400" : "text-success-400"}`}>
                      {currency} {Math.abs(event.amount).toLocaleString()}
                    </span>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Forecast chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-premium"
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
