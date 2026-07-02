import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "motion/react";
import {
  Wallet, TrendingUp, TrendingDown, DollarSign, Package, Users,
  CircleAlert as AlertCircle, Sparkles, Clock, ArrowRight, Activity,
  Zap, CircleCheck as CheckCircle2, ChevronRight, Brain, Target,
  AlertTriangle, Lightbulb, RefreshCw,
} from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { DashboardMetrics, BusinessProfile, VexaInsight, TimelineEvent } from "../types";
import StatCard from "../components/ui/StatCard";
import TrendChart from "../components/TrendChart";
import VexaInsightsPanel from "../components/VexaInsightsPanel";
import ErrorState from "../components/ui/ErrorState";
import { useRouter } from "../lib/router";
import {
  EASE, DURATION, SPRING, stagger, listItemVariants,
  cardEntrance, hoverLift, pressFeedback,
} from "../lib/motion";

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
  const [refreshing, setRefreshing] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);
  const heroGlowX = useTransform(heroMouseX, (v) => `${v}px`);
  const heroGlowY = useTransform(heroMouseY, (v) => `${v}px`);

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
      setTimeline(events.slice(0, 6));
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
    setInsightsLoading(true);
    try { setInsights(await apiClient.getInsights()); }
    catch (err) { console.error("Insights failed:", err); setInsights([]); }
    finally { setInsightsLoading(false); }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroMouseX.set(e.clientX - rect.left);
    heroMouseY.set(e.clientY - rect.top);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-36 rounded-3xl shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 rounded-3xl shimmer" />)}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-3xl shimmer lg:col-span-2" />
          <div className="h-80 rounded-3xl shimmer lg:col-span-1" />
        </div>
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
  const healthStroke = healthScore > 70 ? "#22c55e" : healthScore > 50 ? "#f59e0b" : "#f43f5e";

  const quickActions = [
    { label: "Record Sale", path: "/app/sales", icon: DollarSign, color: "text-primary-400 bg-primary-500/10", accent: "primary" },
    { label: "Add Product", path: "/app/inventory", icon: Package, color: "text-secondary-400 bg-secondary-500/10", accent: "secondary" },
    { label: "New Invoice", path: "/app/invoices", icon: AlertCircle, color: "text-accent-400 bg-accent-500/10", accent: "accent" },
    { label: "Ask VEXA AI", path: "/app/ai", icon: Sparkles, color: "text-primary-400 bg-primary-500/10", accent: "primary" },
  ];

  const aiBriefingPrompts = [
    { icon: Brain, text: "Summarize my business health today", query: "Give me a concise executive summary of my business health today. What should I focus on?" },
    { icon: Target, text: "What should I prioritize this week?", query: "Based on my current data, what should I prioritize this week to improve my business?" },
    { icon: AlertTriangle, text: "Are there any risks I should know about?", query: "Are there any financial risks or red flags in my current data I should be aware of?" },
    { icon: Lightbulb, text: "Suggest one action to increase revenue", query: "Based on my sales and customer data, suggest one actionable strategy to increase revenue." },
  ];

  return (
    <motion.div
      variants={stagger(0.06, 0)}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── Hero: Business Health Briefing ─── */}
      <motion.div
        ref={heroRef}
        variants={cardEntrance}
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={() => { heroMouseX.set(0); heroMouseY.set(0); }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl lg:p-8"
      >
        {/* Cursor-following ambient glow */}
        <motion.div
          style={{ x: heroGlowX, y: heroGlowY }}
          className="pointer-events-none absolute h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 hover:opacity-100"
        >
          <div className="h-full w-full rounded-full bg-primary-500/8" />
        </motion.div>

        {/* Static ambient orbs */}
        <div className="ambient-orb bg-primary-500/10 h-48 w-48 -right-12 -top-12 float-anim" />
        <div className="ambient-orb bg-secondary-500/8 h-32 w-32 -left-8 -bottom-8 float-anim-slow" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-success-400 live-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-success-400">All systems operational</span>
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-white lg:text-3xl">
              {greeting}, <span className="gradient-animated">{firstName}</span>
            </h1>
            <p className="mt-1.5 text-sm text-neutral-400">
              Here's your business summary for {new Date().toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
            </p>

            {/* AI Executive Briefing — inline, not a separate page */}
            <div className="mt-5 flex flex-wrap gap-2">
              {aiBriefingPrompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: DURATION.normal, ease: EASE.spring }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onAskAI(prompt.query)}
                  className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-primary-500/30 hover:bg-primary-500/[0.06] hover:text-white"
                >
                  <prompt.icon className="h-3.5 w-3.5 text-primary-400 transition group-hover:scale-110" />
                  <span>{prompt.text}</span>
                  <ArrowRight className="h-3 w-3 text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-primary-400" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Business Health Ring */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">Business Health</p>
              <p className={`font-display text-3xl font-bold ${healthColor}`}>{healthScore}<span className="text-base text-neutral-500">/100</span></p>
              <p className="mt-0.5 text-xs text-neutral-500">
                {healthScore > 70 ? "Strong position" : healthScore > 50 ? "Monitor closely" : "Needs attention"}
              </p>
            </div>
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
                <motion.circle
                  cx="40" cy="40" r="34" fill="none" stroke={healthStroke}
                  strokeWidth="5" strokeLinecap="round"
                  initial={{ strokeDasharray: "0 213.6" }}
                  animate={{ strokeDasharray: `${(healthScore / 100) * 213.6} 213.6` }}
                  transition={{ duration: 1.2, ease: EASE.spring, delay: 0.2 }}
                />
              </svg>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, ...SPRING.bouncy }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {healthScore > 70 ? <CheckCircle2 className="h-6 w-6 text-success-400" />
                  : healthScore > 50 ? <Activity className="h-6 w-6 text-warning-400" />
                  : <AlertTriangle className="h-6 w-6 text-error-400" />}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Refresh button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-medium text-neutral-400 transition hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{refreshing ? "Syncing..." : "Sync"}</span>
        </motion.button>
      </motion.div>

      {/* ─── Primary Live Business Cards ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Cash Reserve" value={metrics.cashReserve} prefix={currency + " "} icon={Wallet} accent="primary" subtext="Available balance" delay={0} live />
        <StatCard title="Net Profit" value={metrics.netProfit} prefix={currency + " "} icon={TrendingUp} accent="secondary" subtext="This period" delay={0.05} trend={{ value: `${metrics.mrr > 0 ? "↑" : "↓"} ${currency}${Math.abs(metrics.mrr).toLocaleString()}/mo`, type: metrics.mrr > 0 ? "up" : "down" }} />
        <StatCard title="Monthly Burn" value={metrics.monthlyBurn} prefix={currency + " "} icon={TrendingDown} accent="warning" subtext="Operating expenses" delay={0.1} />
        <StatCard title="Runway" value={metrics.runwayMonths} suffix=" mo" icon={Clock} accent="accent" subtext="Months of cash left" delay={0.15} />
      </div>

      {/* ─── Charts + AI Insights ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          variants={cardEntrance}
          {...hoverLift}
          className="lg:col-span-2 rounded-3xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-premium"
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

        <motion.div variants={cardEntrance} className="lg:col-span-1">
          <VexaInsightsPanel
            insights={insights}
            loading={insightsLoading}
            onRefresh={() => {
              setInsightsLoading(true);
              apiClient.getInsights().then(setInsights).catch(() => setInsights([])).finally(() => setInsightsLoading(false));
            }}
            onAction={(code) => {
              const prompt = INSIGHT_ACTION_MAP[code] || `Take action: ${code}`;
              onAskAI(prompt);
            }}
          />
        </motion.div>
      </div>

      {/* ─── Quick Actions ─── */}
      <motion.div
        variants={cardEntrance}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        {quickActions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: DURATION.normal, ease: EASE.spring }}
            whileHover={{ y: -4, transition: SPRING.soft }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(action.path)}
            className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left backdrop-blur-xl transition hover:border-white/[0.12]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color} transition-transform duration-300 group-hover:scale-110`}>
              <action.icon className="h-5 w-5" />
            </div>
            <span className="flex-1 text-sm font-medium text-white">{action.label}</span>
            <ArrowRight className="h-4 w-4 text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
          </motion.button>
        ))}
      </motion.div>

      {/* ─── Secondary Stats + Activity Feed ─── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={cardEntrance} className="lg:col-span-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="Total Sales" value={metrics.totalSales} prefix={currency + " "} icon={DollarSign} accent="primary" delay={0} />
            <StatCard title="Customers" value={metrics.totalCustomers} icon={Users} accent="secondary" delay={0.05} />
            <StatCard title="Inventory" value={metrics.inventoryValue} prefix={currency + " "} icon={Package} accent="accent" delay={0.1} />
            <StatCard title="Outstanding" value={metrics.outstandingInvoices} prefix={currency + " "} icon={AlertCircle} accent="error" delay={0.15} />
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          variants={cardEntrance}
          {...hoverLift}
          className="lg:col-span-2 rounded-3xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-premium"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Activity className="h-4 w-4 text-primary-400" />
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-success-400 live-pulse" />
              </div>
              <h3 className="font-display text-base font-semibold text-white">Recent Activity</h3>
            </div>
            <button
              onClick={() => navigate("/app/timeline")}
              className="group flex items-center gap-1 text-xs font-medium text-primary-400 transition hover:text-primary-300"
            >
              View all
              <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {timeline.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">No recent activity.</p>
            ) : (
              <AnimatePresence mode="popLayout">
                {timeline.map((event, i) => (
                  <motion.div
                    key={event.id || i}
                    layout
                    variants={listItemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 4, transition: { duration: DURATION.fast, ease: EASE.smooth } }}
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] p-3 transition hover:border-white/[0.08] hover:bg-white/[0.03]"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-110 ${
                      event.type === "sale" ? "bg-success-500/10 text-success-400"
                      : event.type === "expense" ? "bg-error-500/10 text-error-400"
                      : event.type === "invoice" ? "bg-secondary-500/10 text-secondary-400"
                      : event.type === "client" ? "bg-primary-500/10 text-primary-400"
                      : "bg-neutral-500/10 text-neutral-400"
                    }`}>
                      {event.type === "sale" ? <DollarSign className="h-4 w-4" />
                      : event.type === "expense" ? <TrendingDown className="h-4 w-4" />
                      : event.type === "invoice" ? <AlertCircle className="h-4 w-4" />
                      : event.type === "client" ? <Users className="h-4 w-4" />
                      : <Activity className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{event.title}</p>
                      <p className="text-xs text-neutral-500 truncate">{event.description}</p>
                    </div>
                    {event.amount !== undefined && event.amount !== 0 && (
                      <span className={`font-mono text-xs font-semibold shrink-0 ${event.type === "expense" ? "text-error-400" : "text-success-400"}`}>
                        {currency} {Math.abs(event.amount).toLocaleString()}
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>

      {/* ─── AI Forecast ─── */}
      <motion.div
        variants={cardEntrance}
        {...hoverLift}
        className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-premium"
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
    </motion.div>
  );
}
