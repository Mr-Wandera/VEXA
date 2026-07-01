import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { ChartBar as BarChart3, TrendingUp, TrendingDown, DollarSign, Download, Sparkles } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { apiClient } from "../lib/apiClient";
import { DashboardMetrics, Expense, Transaction } from "../types";
import StatCard from "../components/ui/StatCard";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../components/ui/Toast";
import { useCurrency } from "../lib/useCurrency";

const EXPENSE_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#f97316", "#f43f5e", "#737373", "#34d399", "#38bdf8"];

export default function ReportsPage() {
  const { show } = useToast();
  const currency = useCurrency();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadData = useCallback(async () => {
    setError(false);
    setLoading(true);
    try {
      const [{ metrics }, expData, txData] = await Promise.all([
        apiClient.getMetrics(),
        apiClient.getExpenses(),
        apiClient.getTransactions(),
      ]);
      setMetrics(metrics);
      setExpenses(expData);
      setTransactions(txData);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = () => {
    if (!metrics) return;
    setExporting(true);
    try {
      const rows = [
        ["Report", "VEXA Financial Summary"],
        ["Generated", new Date().toISOString()],
        [""],
        ["Metric", "Value"],
        ["Total Income", `${currency} ${metrics.totalIncome}`],
        ["Total Expenses", `${currency} ${metrics.totalExpense}`],
        ["Net Profit", `${currency} ${metrics.netProfit}`],
        ["MRR", `${currency} ${metrics.mrr}`],
        ["Cash Reserve", `${currency} ${metrics.cashReserve}`],
        ["Monthly Burn", `${currency} ${metrics.monthlyBurn}`],
        ["Runway (months)", String(metrics.runwayMonths)],
        ["Total Sales", `${currency} ${metrics.totalSales}`],
        ["Inventory Value", `${currency} ${metrics.inventoryValue}`],
        ["Outstanding Invoices", `${currency} ${metrics.outstandingInvoices}`],
        [""],
        ["Date", "Description", "Category", "Amount", "Type", "Status"],
        ...transactions.map((t) => [t.date, t.merchant, t.category, String(t.amount), t.type, t.status]),
      ];
      const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vexa-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      show("Report exported successfully", "success");
    } catch (err) {
      console.error(err);
      show("Failed to export report", "error");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !metrics) return <div className="space-y-6"><div className="h-8 w-32 rounded-xl shimmer" /><div className="h-96 rounded-2xl shimmer" /></div>;
  if (error) return <ErrorState message="Failed to load report data." onRetry={loadData} />;

  // Build cashflow data from transactions
  const monthlyData: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t) => {
    const month = t.date.slice(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    if (t.type === "income") monthlyData[month].income += t.amount;
    else monthlyData[month].expense += Math.abs(t.amount);
  });
  const cashflowData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("en", { month: "short" }),
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }));

  // Build expense breakdown from real expenses
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });
  const expenseBreakdown = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, value], i) => ({
      name,
      value,
      color: EXPENSE_COLORS[i % EXPENSE_COLORS.length],
    }));

  const fmt = (v: number) => `${currency} ${v.toLocaleString()}`;

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" subtitle="Financial analytics and business performance." action={{ label: "Export CSV", icon: Download, onClick: handleExport }} />

      {/* Export button is handled via PageHeader action; exporting state shown in label */}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard title="Total Income" value={metrics.totalIncome} prefix={`${currency} `} icon={TrendingUp} accent="primary" />
        <StatCard title="Total Expenses" value={metrics.totalExpense} prefix={`${currency} `} icon={TrendingDown} accent="error" />
        <StatCard title="Net Profit" value={metrics.netProfit} prefix={`${currency} `} icon={DollarSign} accent="secondary" />
        <StatCard title="MRR" value={metrics.mrr} prefix={`${currency} `} icon={BarChart3} accent="accent" />
      </motion.div>

      {/* Cash flow bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
      >
        <h3 className="font-display text-base font-semibold text-white border-b border-white/[0.06] pb-4">Monthly Cash Flow</h3>
        <div className="mt-4 h-80">
          {cashflowData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.3} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${currency} ${v / 1000}k`} dx={-10} />
                <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "12px", color: "#fff" }} formatter={(value: any) => [fmt(Number(value)), ""]} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-500">No transaction data available.</div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Net profit trend */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
        >
          <h3 className="font-display text-base font-semibold text-white border-b border-white/[0.06] pb-4">Net Profit Trend</h3>
          <div className="mt-4 h-72">
            {cashflowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="netGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.3} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${currency} ${v / 1000}k`} dx={-10} />
                  <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "12px", color: "#fff" }} formatter={(value: any) => [fmt(Number(value)), "Net Profit"]} />
                  <Area type="monotone" dataKey="net" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#netGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">No data available.</div>
            )}
          </div>
        </motion.div>

        {/* Expense breakdown pie */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
        >
          <h3 className="font-display text-base font-semibold text-white border-b border-white/[0.06] pb-4">Expense Breakdown</h3>
          <div className="mt-4 h-72">
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {expenseBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", fontSize: "12px", color: "#fff" }} formatter={(value: any) => fmt(Number(value))} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "#9ca3af" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-neutral-500">No expense data available.</div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        className="rounded-2xl border border-primary-500/20 bg-primary-500/5 p-6 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="rounded-lg bg-primary-500/15 p-1.5 text-primary-400"><Sparkles className="h-4 w-4" /></div>
          <h3 className="font-display text-base font-semibold text-white">AI Financial Summary</h3>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">
          Your business has a net profit of {fmt(metrics.netProfit)} with a cash reserve of {fmt(metrics.cashReserve)}.
          Your monthly burn rate is {fmt(metrics.monthlyBurn)}, giving you a runway of {metrics.runwayMonths} months.
          You have {fmt(metrics.outstandingInvoices)} in outstanding invoices — collecting these will strengthen your position.
          Your inventory is valued at {fmt(metrics.inventoryValue)} and total sales reached {fmt(metrics.totalSales)}.
        </p>
      </motion.div>
    </div>
  );
}
