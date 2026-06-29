import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ChartBar as BarChart3, TrendingUp, TrendingDown, DollarSign, Download, Sparkles } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { apiClient } from "../lib/apiClient";
import { DashboardMetrics } from "../types";
import StatCard from "../components/ui/StatCard";

const CASHFLOW_DATA = [
  { month: "Jan", income: 24000, expense: 11000, net: 13000 },
  { month: "Feb", income: 29000, expense: 14000, net: 15000 },
  { month: "Mar", income: 27000, expense: 13500, net: 13500 },
  { month: "Apr", income: 34000, expense: 15200, net: 18800 },
  { month: "May", income: 31000, expense: 12000, net: 19000 },
  { month: "Jun", income: 38900, expense: 13620, net: 25280 },
];

const EXPENSE_BREAKDOWN = [
  { name: "HR & Payroll", value: 8500, color: "#10b981" },
  { name: "Rent", value: 1800, color: "#0ea5e9" },
  { name: "Cloud", value: 1420, color: "#f59e0b" },
  { name: "Marketing", value: 1200, color: "#f97316" },
  { name: "Tools", value: 444, color: "#f43f5e" },
  { name: "Other", value: 84, color: "#737373" },
];

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getMetrics().then(({ metrics }) => { setMetrics(metrics); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading || !metrics) return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="h-96 rounded-2xl shimmer" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Reports</h1>
          <p className="text-sm text-neutral-400">Financial analytics and business performance.</p>
        </div>
        <button className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2.5 text-sm font-semibold text-neutral-300 backdrop-blur-xl transition hover:text-white">
          <Download className="h-4 w-4" /><span className="hidden sm:inline">Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Income" value={metrics.totalIncome} prefix="KSh " icon={TrendingUp} accent="primary" />
        <StatCard title="Total Expenses" value={metrics.totalExpense} prefix="KSh " icon={TrendingDown} accent="error" />
        <StatCard title="Net Profit" value={metrics.netProfit} prefix="KSh " icon={DollarSign} accent="secondary" />
        <StatCard title="MRR" value={metrics.mrr} prefix="KSh " icon={BarChart3} accent="accent" />
      </div>

      {/* Cash flow bar chart */}
      <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
        <h3 className="font-display text-base font-semibold text-white border-b border-neutral-800/60 pb-4">Monthly Cash Flow</h3>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CASHFLOW_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.3} />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `KSh ${v / 1000}k`} dx={-10} />
              <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "12px", color: "#fff" }} formatter={(value: any) => [`KSh ${Number(value).toLocaleString()}`, ""]} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Net profit trend */}
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-white border-b border-neutral-800/60 pb-4">Net Profit Trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CASHFLOW_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="netGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `KSh ${v / 1000}k`} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "12px", color: "#fff" }} formatter={(value: any) => [`KSh ${Number(value).toLocaleString()}`, "Net Profit"]} />
                <Area type="monotone" dataKey="net" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#netGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense breakdown pie */}
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-white border-b border-neutral-800/60 pb-4">Expense Breakdown</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={EXPENSE_BREAKDOWN} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {EXPENSE_BREAKDOWN.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "12px", color: "#fff" }} formatter={(value: any) => `KSh ${Number(value).toLocaleString()}`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-primary-500/15 p-1.5 text-primary-400"><Sparkles className="h-4 w-4" /></div>
          <h3 className="font-display text-base font-semibold text-white">AI Financial Summary</h3>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">
          Your business is performing well. Revenue grew 25% month-over-month, driven by strong retainer income.
          However, marketing expenses increased 18% — monitor your return on ad spend. Your cash runway is healthy
          at {metrics.runwayMonths} months. Consider collecting KSh {metrics.outstandingInvoices.toLocaleString()} in
          outstanding invoices to further strengthen your position.
        </p>
      </div>
    </div>
  );
}
