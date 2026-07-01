import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Users, Plus, Mail, Phone, DollarSign, UserPlus } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Client } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { useCurrency } from "../lib/useCurrency";

export default function CustomersPage() {
  const { show } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currency = useCurrency();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setError(null);
      setClients(await apiClient.getClients());
    } catch (err) {
      console.error(err);
      setError("Failed to load customers. Please try again.");
    }
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
      show("Customer created successfully", "success");
    } catch (err) {
      console.error(err);
      show("Failed to create. Please try again.", "error");
    }
    finally { setSubmitting(false); }
  };

  const totalOutstanding = clients.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalInvoiced = clients.reduce((sum, c) => sum + c.totalInvoiced, 0);
  const activeCount = clients.filter((c) => c.status === "active").length;

  if (loading) {
    return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div></div>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage your customer relationships."
        action={{ label: "Add Customer", icon: Plus, onClick: () => setShowAdd(true) }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Customers" value={clients.length} icon={Users} accent="primary" />
        <StatCard title="Active" value={activeCount} icon={UserPlus} accent="secondary" />
        <StatCard title="Outstanding" value={totalOutstanding} prefix={`${currency} `} icon={DollarSign} accent="error" />
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 rounded-2xl bg-neutral-900/50 p-4"><Users className="h-8 w-8 text-neutral-600" /></div>
          <p className="text-sm text-neutral-400">No customers yet.</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-sm font-medium text-primary-400 hover:text-primary-300 transition">Add your first customer →</button>
        </div>
      ) : (
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
                <p className="font-mono text-sm font-semibold text-white">{currency} {client.totalInvoiced.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-neutral-500">Outstanding</p>
                <p className={`font-mono text-sm font-semibold ${client.outstandingBalance > 0 ? "text-error-400" : "text-success-400"}`}>
                  {currency} {client.outstandingBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Customer">
        <form onSubmit={handleAdd} className="space-y-4">
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
      </Modal>
    </div>
  );
}
