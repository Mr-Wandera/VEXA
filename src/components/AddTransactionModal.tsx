import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, CircleAlert as AlertCircle, CirclePlus as PlusCircle, Check } from "lucide-react";

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

export default function AddTransactionModal({
  isOpen,
  onClose,
  onAdd
}: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'cleared' | 'pending'>('cleared');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || !amount || isNaN(Number(amount))) return;

    setIsAnalyzing(true);

    try {
      // Simulate/Trigger live AI classification
      await onAdd({
        merchant,
        category,
        amount: type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
        type,
        date,
        status
      });

      setDone(true);
      setTimeout(() => {
        // Reset states
        setMerchant("");
        setAmount("");
        setIsAnalyzing(false);
        setDone(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary-400" />
                <h3 className="font-display text-base font-semibold text-white tracking-wide">
                  Record Ledger Transaction
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isAnalyzing ? (
              /* AI Analyzing State */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {done ? (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-4"
                  >
                    <Check className="h-8 w-8" />
                  </motion.div>
                ) : (
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                    <Sparkles className="h-7 w-7 animate-pulse" />
                    <span className="absolute inset-0 rounded-full border border-primary-500/40 animate-ping opacity-25" />
                  </div>
                )}
                <h4 className="font-display text-sm font-semibold text-white">
                  {done ? "Transaction Reconciled" : "VEXA AI Classifying & Reconciling..."}
                </h4>
                <p className="mt-1 max-w-[280px] text-xs text-neutral-400 leading-relaxed font-sans">
                  {done 
                    ? "Successfully recorded with zero latency under standard capital protocols." 
                    : "Analyzing merchant impact, calculating tax-deductibility rating, and auto-sorting ledger category..."}
                </p>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                {/* Type Switcher */}
                <div className="flex rounded-xl bg-neutral-950 p-1">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
                      type === 'expense' 
                        ? 'bg-neutral-800 text-white shadow-sm' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Expense / Outflow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold tracking-wide transition-all ${
                      type === 'income' 
                        ? 'bg-neutral-800 text-white shadow-sm' 
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Revenue / Inflow
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-sans">Amount (USD)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition font-mono"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-sans">Date</label>
                    <input
                      required
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition font-mono"
                    />
                  </div>
                </div>

                <div>
                  {/* Merchant */}
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-sans">Merchant / Source</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. AWS Infrastructure, Vercel Hosting, Linear Corp"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-sans">Ledger Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition font-sans"
                    >
                      {CATEGORIES[type].map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5 font-sans">Reconciliation Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500 transition font-sans"
                    >
                      <option value="cleared">Cleared (Instantly Settled)</option>
                      <option value="pending">Pending Authorization</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-5 py-3 text-xs font-semibold text-neutral-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary-600 px-5 py-3 text-xs font-semibold text-white hover:bg-primary-500 transition flex items-center gap-1.5 shadow-lg shadow-primary-600/10"
                  >
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
