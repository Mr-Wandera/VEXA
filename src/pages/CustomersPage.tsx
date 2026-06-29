import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Plus, X, Mail, Phone, DollarSign, UserPlus, Building } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Client } from "../types";
import StatCard from "../components/ui/StatCard";

export default function CustomersPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setClients(await apiClient.getClients()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const c = await apiClient.addClient({ name, email, phone });
      setClients((prev) => [c, ...prev]);
      setName(""); setEmail(""); setPhone("");
      setShowAdd(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const totalOutstanding = clients.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalInvoiced = clients.reduce((sum, c) => sum + c.totalInvoiced, 0);
  const activeCount = clients.filter((c) => c.status === "active").length;

  if (loading) {
    return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Customers</h1>
          <p className="text-sm text-neutral-400">Manage your customer relationships.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-500">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Customers" value={clients.length} icon={Users} accent="primary" />
        <StatCard title="Active" value={activeCount} icon={UserPlus} accent="secondary" />
        <StatCard title="Outstanding" value={totalOutstanding} prefix="KSh " icon={DollarSign} accent="error" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clients.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-5 backdrop-blur-xl transition hover:border-neutral-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 text-sm font-bold text-primary-300">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-white">{client.name}</h4>
                  <p className="text-xs text-neutral-500">{client.status === "active" ? "Active customer" : "Inactive"}</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${client.status === "active" ? "bg-success-500/10 text-success-400" : "bg-neutral-700 text-neutral-400"}`}>
                {client.status}
              </span>
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-400"><Mail className="h-3 w-3" />{client.email}</div>
              {client.phone && <div className="flex items-center gap-2 text-neutral-400"><Phone className="h-3 w-3" />{client.phone}</div>}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-800/60 pt-3">
              <div>
                <p className="text-[10px] uppercase text-neutral-500">Total Invoiced</p>
                <p className="font-mono text-sm font-semibold text-white">KSh {client.totalInvoiced.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-neutral-500">Outstanding</p>
                <p className={`font-mono text-sm font-semibold ${client.outstandingBalance > 0 ? "text-error-400" : "text-success-400"}`}>
                  KSh {client.outstandingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="font-display text-base font-semibold text-white">Add New Customer</h3>
                <button onClick={() => setShowAdd(false)} className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-400 hover:text-white transition"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleAdd} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Full Name</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Brian Kamau" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
                  <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="brian@example.com" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Phone (optional)</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
                <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                  <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
                  <button type="submit" disabled={submitting} className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">{submitting ? "Adding..." : "Add Customer"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
