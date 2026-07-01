import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, CirclePlus as PlusCircle, Check, CircleAlert as AlertCircle } from "lucide-react";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: {
    merchant: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    status: 'cleared' | 'pending';
  }) => Promise<void>;
}

const CATEGORIES = {
  income: ["Client Retainer", "Project Milestone", "Investment", "Other Revenue"],
  expense: ["SaaS Infrastructure", "Cloud Servers", "Developer Tools", "Design Software", "Human Resources", "Rent & Real Estate", "Marketing & Growth", "Travel & Dining"]
};

export default function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'cleared' | 'pending'>('cleared');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (isOpen) setError(""); }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!merchant.trim()) { setError("Please enter a merchant or source name."); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setError("Please enter a valid amount greater than zero."); return; }

    setIsAnalyzing(true);
    try {
      await onAdd({
        merchant: merchant.trim(), category,
        amount: type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
        type, date, status
      });
      setDone(true);
      setTimeout(() => {
        setMerchant(""); setAmount(""); setIsAnalyzing(false); setDone(false); onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to record transaction. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/95 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary-400" />
                <h3 className="font-display text-base font-semibold text-white">Record Transaction</h3>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 transition hover:bg-white/[0.04] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {done ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-success-500/30 bg-success-500/10 text-success-400"
                  >
                    <Check className="h-8 w-8" />
                  </motion.div>
                ) : (
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary-500/20 bg-primary-500/10 text-primary-400">
                    <Sparkles className="h-7 w-7 animate-pulse" />
                    <span className="absolute inset-0 rounded-full border border-primary-500/40 animate-ping opacity-25" />
                  </div>
                )}
                <h4 className="font-display text-sm font-semibold text-white">
                  {done ? "Transaction Reconciled" : "VEXA AI Classifying..."}
                </h4>
                <p className="mt-1 max-w-[280px] text-xs leading-relaxed text-neutral-400">
                  {done ? "Successfully recorded with zero latency under standard capital protocols."
                    : "Analyzing merchant impact, calculating tax-deductibility, and auto-sorting ledger category..."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-4 px-6 pb-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-error-500/20 bg-error-500/[0.06] px-4 py-3 text-sm text-error-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </motion.div>
                )}

                {/* Type switcher */}
                <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
                  <button type="button" onClick={() => handleTypeChange('expense')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${type === 'expense' ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:text-white'}`}>
                    Expense / Outflow
                  </button>
                  <button type="button" onClick={() => handleTypeChange('income')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold transition ${type === 'income' ? 'bg-white/[0.06] text-white' : 'text-neutral-400 hover:text-white'}`}>
                    Revenue / Inflow
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-400">Amount</label>
                    <input required type="number" step="0.01" min="0.01" placeholder="0.00" value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none transition font-mono" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-400">Date</label>
                    <input required type="date" max={new Date().toISOString().split('T')[0]} value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none transition font-mono" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-neutral-400">Merchant / Source</label>
                  <input required type="text" placeholder="e.g. AWS Infrastructure, Vercel Hosting" value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none transition" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-400">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none transition">
                      {CATEGORIES[type].map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-400">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as 'cleared' | 'pending')}
                      className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none transition">
                      <option value="cleared">Cleared</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5 mt-6">
                  <button type="button" onClick={onClose}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3 text-xs font-semibold text-neutral-400 transition hover:text-white">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-primary-600/15 transition hover:bg-primary-500 btn-press">
                    <Sparkles className="h-3.5 w-3.5" />
                    Record Transaction
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
