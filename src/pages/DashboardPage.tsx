import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Package, Users, CircleAlert as AlertCircle, Sparkles, Clock } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { DashboardMetrics, BusinessProfile, VexaInsight } from "../types";
import StatCard from "../components/ui/StatCard";
import TrendChart from "../components/TrendChart";
import VexaInsightsPanel from "../components/VexaInsightsPanel";
import ErrorState from "../components/ui/ErrorState";

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
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [insights, setInsights] = useState<VexaInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadData();
  }, [refreshKey]);

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
    } catch (err) {
      console.error(err);
    } finally {
      setInsightsLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-lg shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl shimmer" />
          ))}
        </div>
        <div className="h-80 rounded-2xl shimmer" />
      </div>
    );
  }

  if (error) return <ErrorState message="Failed to load dashboard data." onRetry={loadData} />;

  const currency = profile?.currency || "KSh";

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-sm text-neutral-400">Your business at a glance — updated in real time.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Cash Reserve"
          value={metrics.cashReserve}
          prefix={currency + " "}
          icon={Wallet}
          accent="primary"
          trend={{ value: "+12%", type: "up" }}
          subtext="Available balance"
          delay={0}
        />
        <StatCard
          title="Net Profit"
          value={metrics.netProfit}
          prefix={currency + " "}
          icon={TrendingUp}
          accent="secondary"
          trend={{ value: "+8%", type: "up" }}
          subtext="This month"
          delay={0.05}
        />
        <StatCard
          title="Monthly Burn"
          value={metrics.monthlyBurn}
          prefix={currency + " "}
          icon={TrendingDown}
          accent="warning"
          trend={{ value: "-3%", type: "down" }}
          subtext="Operating expenses"
          delay={0.1}
        />
        <StatCard
          title="Runway"
          value={metrics.runwayMonths}
          suffix=" mo"
          icon={Clock}
          accent="accent"
          subtext="Months of cash left"
          delay={0.15}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={metrics.totalSales}
          prefix={currency + " "}
          icon={DollarSign}
          accent="primary"
          delay={0.2}
        />
        <StatCard
          title="Customers"
          value={metrics.totalCustomers}
          icon={Users}
          accent="secondary"
          delay={0.25}
        />
        <StatCard
          title="Inventory Value"
          value={metrics.inventoryValue}
          prefix={currency + " "}
          icon={Package}
          accent="accent"
          delay={0.3}
        />
        <StatCard
          title="Outstanding"
          value={metrics.outstandingInvoices}
          prefix={currency + " "}
          icon={AlertCircle}
          accent="error"
          delay={0.35}
        />
      </div>

      {/* Charts + Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cash flow chart */}
        <div className="lg:col-span-2 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4">
            <div>
              <h3 className="font-display text-base font-semibold text-white">Cash Flow</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Revenue vs expenses over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="h-2 w-2 rounded-full bg-success-500" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-neutral-400">
                <span className="h-2 w-2 rounded-full bg-error-500" /> Expense
              </span>
            </div>
          </div>
          <TrendChart type="cashflow" />
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-1">
          <VexaInsightsPanel
            insights={insights}
            loading={insightsLoading}
            onRefresh={refreshInsights}
            onAction={(code) => {
              const prompt = INSIGHT_ACTION_MAP[code] || `Take action: ${code}`;
              onAskAI(prompt);
            }}
          />
        </div>
      </div>

      {/* Forecast chart */}
      <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4">
          <div>
            <h3 className="font-display text-base font-semibold text-white">Cash Flow Forecast</h3>
            <p className="text-xs text-neutral-400 mt-0.5">Projected balance for the next 6 months</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-primary-500/20 bg-primary-500/5 px-3 py-1.5 text-xs text-primary-400">
            <Sparkles className="h-3 w-3" />
            AI Projected
          </div>
        </div>
        <TrendChart type="forecast" />
      </div>
    </div>
  );
}
