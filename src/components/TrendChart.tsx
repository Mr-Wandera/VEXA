import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { apiClient } from "../lib/apiClient";
import { Transaction, BusinessProfile } from "../types";
import { useCurrency } from "../lib/useCurrency";

interface CashFlowData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export default function TrendChart({ type = "cashflow" }: { type?: "cashflow" | "forecast" }) {
  const currency = useCurrency();
  const [data, setData] = useState<CashFlowData[] | null>(null);
  const [forecastData, setForecastData] = useState<{ month: string; balance: number }[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        const transactions = await apiClient.getTransactions();
        if (cancelled) return;

        // Group by month
        const monthly: Record<string, { income: number; expense: number }> = {};
        transactions.forEach((t) => {
          const monthKey = t.date.slice(0, 7);
          if (!monthly[monthKey]) monthly[monthKey] = { income: 0, expense: 0 };
          if (t.type === "income") monthly[monthKey].income += t.amount;
          else monthly[monthKey].expense += Math.abs(t.amount);
        });

        const sorted = Object.entries(monthly)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-6)
          .map(([month, d]) => ({
            month: new Date(month + "-01").toLocaleDateString("en", { month: "short" }),
            income: d.income,
            expense: d.expense,
            net: d.income - d.expense,
          }));

        if (cancelled) return;
        setData(sorted.length > 0 ? sorted : []);

        // Build forecast from current metrics
        const { metrics } = await apiClient.getMetrics();
        if (cancelled) return;

        const monthlyNet = metrics.mrr - metrics.monthlyBurn;
        const forecast: { month: string; balance: number }[] = [];
        let balance = metrics.cashReserve;
        const now = new Date();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let i = 0; i < 6; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
          forecast.push({
            month: i === 0 ? `${monthNames[d.getMonth()]} (Now)` : monthNames[d.getMonth()],
            balance: Math.round(balance),
          });
          balance += monthlyNet;
        }
        if (cancelled) return;
        setForecastData(forecast);
      } catch (err) {
        console.error("TrendChart load error:", err);
        if (!cancelled) { setData([]); setForecastData([]); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  const tooltipStyle = {
    backgroundColor: "#0c0c0e",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontFamily: "var(--font-mono)",
    fontSize: "12px",
    color: "#fff",
  };

  const formatCurrency = (v: number) => `${currency} ${(v / 1000).toFixed(0)}k`;

  if (loading) {
    return <div className="h-[300px] w-full mt-4 rounded-xl shimmer" />;
  }

  if (type === "forecast") {
    if (!forecastData || forecastData.length === 0) {
      return (
        <div className="flex h-[300px] w-full items-center justify-center text-sm text-neutral-500">
          No forecast data available.
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-[300px] w-full mt-4"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-10} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value: any) => [`${currency} ${Number(value).toLocaleString()}`, "Projected Balance"]} />
            <Area type="monotone" dataKey="balance" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#balanceGlow)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center text-sm text-neutral-500">
        No cash flow data available yet.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[300px] w-full mt-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" stroke="#525252" fontSize={11} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="#525252" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatCurrency} dx={-10} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value: any, name: any) => [`${currency} ${Number(value).toLocaleString()}`, name === "income" ? "Income" : "Expense"]} />
          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", fontFamily: "var(--font-sans)", color: "#a3a3a3" }} />
          <Area type="monotone" name="Income" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGlow)" animationDuration={800} />
          <Area type="monotone" name="Expense" dataKey="expense" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#expenseGlow)" animationDuration={800} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
