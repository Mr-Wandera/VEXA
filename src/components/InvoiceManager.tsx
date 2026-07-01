import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { FileText, Plus, CircleCheck as CheckCircle, Clock, TriangleAlert as AlertTriangle, Sparkles, Check } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Invoice, Client } from "../types";
import PageHeader from "./ui/PageHeader";
import ErrorState from "./ui/ErrorState";
import Modal from "./ui/Modal";
import { useToast } from "./ui/Toast";
import { useRouter } from "../lib/router";
import { useCurrency } from "../lib/useCurrency";

export default function InvoiceManager() {
  const { show } = useToast();
  const { navigate } = useRouter();
  const currency = useCurrency();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    setError(false);
    try {
      const [invData, clientData] = await Promise.all([apiClient.getInvoices(), apiClient.getClients()]);
      setInvoices(invData);
      setClients(clientData);
    } catch (err) { console.error(err); setError(true); }
    finally { setLoading(false); }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.trim()) { show("Please enter a client name.", "error"); return; }
    if (!amount || Number(amount) <= 0) { show("Please enter a valid amount greater than zero.", "error"); return; }
    if (!dueDate) { show("Please select a due date.", "error"); return; }
    setSubmitting(true);
    try {
      const inv = await apiClient.addInvoice({ client: client.trim(), amount: Number(amount), dueDate });
      setInvoices((prev) => [inv, ...prev]);
      setClient(""); setAmount(""); setDueDate(""); setShowCreate(false);
      show(`Invoice created for ${client}`, "success");
    } catch (err) { console.error(err); show("Failed to create invoice. Please try again.", "error"); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id: string, status: Invoice['status']) => {
    try {
      const updated = await apiClient.updateInvoiceStatus(id, status);
      setInvoices((prev) => prev.map((i) => i.id === id ? updated : i));
      show(`Invoice marked as ${status}`, "success");
    } catch (err) { console.error(err); show("Failed to update invoice status.", "error"); }
  };

  const handleDraftReminder = (inv: Invoice) => {
    navigate("/app/ai");
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("vexa-chat-query", {
        detail: `Draft a professional payment reminder email for overdue invoice ${inv.invoiceNumber} from ${inv.client} (${currency} ${inv.amount.toLocaleString()})`,
      }));
    }, 100);
  };

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-xl shimmer" /><div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl shimmer" />)}</div></div>;
  if (error) return <ErrorState message="Failed to load invoices." onRetry={loadInvoices} />;

  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;
  const filteredInvoices = invoices.filter(inv => filter === 'all' || inv.status === filter);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" subtitle="Manage accounts receivable and track payments."
        action={{ label: "New Invoice", icon: Plus, onClick: () => setShowCreate(true) }} />

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Paid", count: paidCount, icon: CheckCircle, color: "text-success-400 bg-success-500/10" },
          { label: "Pending", count: pendingCount, icon: Clock, color: "text-warning-400 bg-warning-500/10" },
          { label: "Overdue", count: overdueCount, icon: AlertTriangle, color: "text-error-400 bg-error-500/10" },
        ].map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 backdrop-blur-xl">
            <div className={`rounded-lg p-2 ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
            <div><span className="block text-[11px] font-mono uppercase text-neutral-500">{stat.label}</span><span className="font-mono text-lg font-semibold text-white">{stat.count}</span></div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold text-white">Client Billings Ledger</h3>
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 overflow-x-auto">
            {(['all', 'paid', 'pending', 'overdue'] as const).map((opt) => (
              <button key={opt} onClick={() => setFilter(opt)}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === opt ? 'bg-white/[0.06] text-white' : 'text-neutral-500 hover:text-white'}`}>{opt}</button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-2xl bg-white/[0.03] p-4"><FileText className="h-8 w-8 text-neutral-600" /></div>
              <p className="text-sm text-neutral-400">No invoices found.</p>
              <button onClick={() => setShowCreate(true)} className="mt-3 text-sm font-medium text-primary-400 transition hover:text-primary-300">Create your first invoice →</button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Invoice #</th><th className="py-3 px-4">Client</th><th className="py-3 px-4">Due Date</th><th className="py-3 px-4">Status</th><th className="py-3 px-4 text-right">Amount</th><th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="group transition hover:bg-white/[0.015]">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-neutral-300">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-sm font-semibold text-white">{inv.client}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-neutral-400">{inv.dueDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase font-mono ${inv.status === 'paid' ? 'bg-success-500/10 text-success-400' : inv.status === 'pending' ? 'bg-warning-500/10 text-warning-400' : 'bg-error-500/10 text-error-400 animate-pulse'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${inv.status === 'paid' ? 'bg-success-400' : inv.status === 'pending' ? 'bg-warning-400' : 'bg-error-400'}`} />
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-sm font-semibold text-white">{currency} {inv.amount.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition">
                        {inv.status === 'pending' && (
                          <button onClick={() => handleStatusChange(inv.id, 'paid')} className="inline-flex items-center gap-1 rounded-lg border border-success-500/20 bg-success-500/10 px-2 py-1 text-xs font-semibold text-success-400 transition hover:bg-success-600 hover:text-white">
                            <Check className="h-3 w-3" /><span>Mark Paid</span>
                          </button>
                        )}
                        {inv.status === 'overdue' && (
                          <>
                            <button onClick={() => handleStatusChange(inv.id, 'paid')} className="inline-flex items-center gap-1 rounded-lg border border-success-500/20 bg-success-500/10 px-2 py-1 text-xs font-semibold text-success-400 transition hover:bg-success-600 hover:text-white">
                              <Check className="h-3 w-3" /><span>Mark Paid</span>
                            </button>
                            <button onClick={() => handleDraftReminder(inv)} className="inline-flex items-center gap-1 rounded-lg border border-primary-500/20 bg-primary-500/10 px-2.5 py-1 text-xs font-semibold text-primary-400 transition hover:bg-primary-600 hover:text-white">
                              <Sparkles className="h-3 w-3" /><span>Remind</span>
                            </button>
                          </>
                        )}
                        {inv.status === 'paid' && <span className="text-xs font-mono text-neutral-500">Reconciled</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Generate Customer Invoice">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-400">Client Name</label>
            <input required type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Aisha Mohammed" list="client-suggestions"
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
            <datalist id="client-suggestions">
              {clients.map((c) => <option key={c.id} value={c.name} />)}
            </datalist>
            {clients.length > 0 && <p className="mt-1 text-[10px] text-neutral-500">Start typing to select from existing customers.</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">Amount ({currency})</label>
              <input required type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-400">Due Date</label>
              <input required type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-white/[0.06]">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs font-semibold text-neutral-400 transition hover:text-white">Cancel</button>
            <button type="submit" disabled={submitting} className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-primary-600/15 transition hover:bg-primary-500 disabled:opacity-50 btn-press">
              <Sparkles className="h-3.5 w-3.5" /><span>{submitting ? "Publishing..." : "Publish Invoice"}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
