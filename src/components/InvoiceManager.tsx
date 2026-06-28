import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, Plus, CheckCircle, Clock, AlertTriangle, Send, Sparkles, Filter, Check, X } from "lucide-react";
import { Invoice } from "../types.ts";

interface InvoiceManagerProps {
  invoices: Invoice[];
  onCreate: (invoice: { client: string; amount: number; dueDate: string }) => Promise<void>;
  onStatusChange: (id: string, status: 'paid' | 'pending' | 'overdue') => Promise<void>;
  onDraftReminder: (invNumber: string) => void;
}

export default function InvoiceManager({
  invoices,
  onCreate,
  onStatusChange,
  onDraftReminder
}: InvoiceManagerProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [submitting, setSubmitting] = useState(false);

  // Status counters
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !amount || !dueDate) return;

    setSubmitting(true);
    try {
      await onCreate({
        client,
        amount: Number(amount),
        dueDate
      });
      setClient("");
      setAmount("");
      setDueDate("");
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Sub-header Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-4 flex items-center gap-3.5">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-mono uppercase text-neutral-500">Paid Invoices</span>
            <span className="font-mono text-lg font-semibold text-white">{paidCount}</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-4 flex items-center gap-3.5">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-mono uppercase text-neutral-500">Pending</span>
            <span className="font-mono text-lg font-semibold text-white">{pendingCount}</span>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/20 p-4 flex items-center gap-3.5">
          <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[11px] font-mono uppercase text-neutral-500">Overdue cycle</span>
            <span className="font-mono text-lg font-semibold text-white">{overdueCount}</span>
          </div>
        </div>
      </div>

      {/* Invoice Grid Control */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
          <div>
            <h3 className="font-display text-base font-semibold text-white tracking-wide">
              Client Billings Ledger
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">Manage accounts receivable, record instant automated settlements, and track invoices.</p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Filter Toggle */}
            <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 p-1">
              {(['all', 'paid', 'pending', 'overdue'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    filter === opt 
                      ? 'bg-neutral-800 text-white' 
                      : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
            >
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>

        {/* Invoice List */}
        <div className="mt-5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Settlement Due</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Operational Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/40">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-neutral-500 font-sans">
                    No matching invoices found in this settlement cycle.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="group hover:bg-neutral-950/20 transition">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-neutral-300">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-sm font-semibold text-white">
                      {inv.client}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-neutral-400">
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide font-mono ${
                        inv.status === 'paid' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : inv.status === 'pending' 
                            ? 'bg-amber-500/10 text-amber-400' 
                            : 'bg-rose-500/10 text-rose-400 animate-pulse'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          inv.status === 'paid' ? 'bg-emerald-400' : inv.status === 'pending' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-sm font-semibold text-right text-white">
                      ${inv.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition">
                        {inv.status === 'pending' && (
                          <button
                            onClick={() => onStatusChange(inv.id, 'paid')}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-600 hover:text-white transition"
                          >
                            <Check className="h-3 w-3" />
                            <span>Mark Paid</span>
                          </button>
                        )}
                        {inv.status === 'overdue' && (
                          <button
                            onClick={() => onDraftReminder(inv.invoiceNumber)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500/20 transition"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>Draft AI Reminder</span>
                          </button>
                        )}
                        {inv.status === 'paid' && (
                          <span className="text-xs font-mono text-neutral-500">Reconciled</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Create Invoice Panel */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="font-display text-base font-semibold text-white tracking-wide">
                  Generate Customer Invoice
                </h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-400 hover:text-white transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Client / Debtor Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Stripe Tech, Linear Labs"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Invoice Amount ($)</label>
                    <input
                      required
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Settle By / Due Date</label>
                    <input
                      required
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/10"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{submitting ? "Publishing..." : "Publish Invoice"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
