import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Receipt, Plus, TrendingDown, DollarSign, Trash2 } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Expense } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { useCurrency } from "../lib/useCurrency";

const CATEGORIES = [
  "SaaS Infrastructure", "Cloud Servers", "Developer Tools", "Design Software",
  "Human Resources", "Rent & Real Estate", "Marketing & Growth", "Travel & Dining",
  "Business Operations", "Inventory Purchase", "Utilities", "Other",
];

export default function ExpensesPage() {
  const { show } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null);

  // Form
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Expense["paymentMethod"]>("card");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const currency = useCurrency();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setError(null);
      const e = await apiClient.getExpenses();
      setExpenses(e);
    } catch (err) {
      console.error(err);
      setError("Failed to load expenses. Please try again.");
    }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!description || !amount || Number(amount) <= 0) {
      show("Please enter a description and valid amount.", "error");
      setSubmitting(false);
      return;
    }
    try {
      const exp = await apiClient.addExpense({
        description, category, amount: Number(amount), vendor,
        paymentMethod, date, status: "recorded",
      });
      setExpenses((prev) => [exp, ...prev]);
      setDescription(""); setAmount(""); setVendor("");
      setShowAdd(false);
      show("Expense created successfully", "success");
    } catch (err) {
      console.error(err);
      show("Failed to create. Please try again.", "error");
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await apiClient.deleteExpense(confirmDelete.id);
      setExpenses((prev) => prev.filter((e) => e.id !== confirmDelete.id));
      show("Expense deleted", "success");
    } catch (err) {
      console.error(err);
      show("Failed to delete expense.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses.filter((e) => e.date.startsWith(new Date().toISOString().slice(0, 7)));
  const monthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded-xl shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        subtitle="Track and categorize business spending."
        action={{ label: "Log Expense", icon: Plus, onClick: () => setShowAdd(true) }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Expenses" value={totalExpenses} prefix={`${currency} `} icon={DollarSign} accent="error" />
        <StatCard title="This Month" value={monthTotal} prefix={`${currency} `} icon={TrendingDown} accent="warning" />
        <StatCard title="Transactions" value={expenses.length} icon={Receipt} accent="secondary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Expense list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="card-premium lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
        >
          <h3 className="font-display text-base font-semibold text-white border-b border-white/[0.06] pb-4">Recent Expenses</h3>
          <div className="mt-4 space-y-2">
            {expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-3 rounded-2xl bg-white/[0.02] p-4">
                  <Receipt className="h-8 w-8 text-neutral-600" />
                </div>
                <p className="text-sm text-neutral-400">No expenses recorded yet.</p>
              </div>
            ) : (
              expenses.map((exp, i) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 transition hover:border-neutral-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-error-500/10 p-2.5 text-error-400">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{exp.description}</p>
                      <p className="text-xs text-neutral-500">{exp.category} · {exp.vendor} · {exp.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-white">{currency} {exp.amount.toLocaleString()}</p>
                      <p className="text-[10px] uppercase text-neutral-500">{exp.paymentMethod}</p>
                    </div>
                    <button onClick={() => setConfirmDelete(exp)} className="rounded-lg p-1 text-neutral-500 opacity-0 transition hover:bg-error-500/10 hover:text-error-400 group-hover:opacity-100" aria-label="Delete expense">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Category breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="card-premium rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
        >
          <h3 className="font-display text-base font-semibold text-white border-b border-white/[0.06] pb-4">Top Categories</h3>
          <div className="mt-4 space-y-3">
            {topCategories.map(([cat, amount], i) => {
              const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-300">{cat}</span>
                    <span className="font-mono text-neutral-400">{currency} {amount.toLocaleString()}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05 }}
                      className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Add Expense Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Log New Expense">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Description</label>
            <input required type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. AWS Cloud Servers" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Amount ({currency})</label>
              <input required type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Date</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Vendor</label>
              <input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="e.g. Amazon" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as Expense["paymentMethod"])} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
                <option value="card">Card</option>
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-press rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">
              {submitting ? "Recording..." : "Record Expense"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Expense" maxWidth="max-w-md">
        <p className="text-sm text-neutral-300">
          Are you sure you want to delete this expense record?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
          <button type="button" onClick={handleDelete} className="btn-press rounded-xl bg-error-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-error-500 transition">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
