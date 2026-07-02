import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Plus, Mail, Phone, DollarSign, UserPlus, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Client } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import SlideConfirm from "../components/ui/SlideConfirm";
import { useCurrency } from "../lib/useCurrency";
import { stagger, listItemVariants } from "../lib/motion";

const EMPTY_FORM = { name: "", email: "", phone: "", status: "active" as "active" | "inactive" };

export default function CustomersPage() {
  const { show } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
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

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowAdd(true);
  };

  const openEdit = (client: Client) => {
    setEditing(client);
    setForm({ name: client.name, email: client.email, phone: client.phone ?? "", status: client.status });
    setShowAdd(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await apiClient.updateClient(editing.id, form);
        setClients((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        show("Customer updated successfully", "success");
      } else {
        const c = await apiClient.addClient(form);
        setClients((prev) => [c, ...prev]);
        show("Customer created successfully", "success");
      }
      setForm(EMPTY_FORM);
      setEditing(null);
      setShowAdd(false);
    } catch (err) {
      console.error(err);
      show("Failed to save. Please try again.", "error");
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await apiClient.deleteClient(confirmDelete.id);
      setClients((prev) => prev.filter((c) => c.id !== confirmDelete.id));
      show("Customer deleted", "success");
    } catch (err) {
      console.error(err);
      show("Failed to delete customer.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const totalOutstanding = clients.reduce((sum, c) => sum + c.outstandingBalance, 0);
  const totalInvoiced = clients.reduce((sum, c) => sum + c.totalInvoiced, 0);
  const activeCount = clients.filter((c) => c.status === "active").length;

  if (loading) {
    return <div className="space-y-6"><div className="h-8 w-32 rounded-xl shimmer" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div></div>;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Manage your customer relationships."
        action={{ label: "Add Customer", icon: Plus, onClick: openAdd }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Customers" value={clients.length} icon={Users} accent="primary" />
        <StatCard title="Active" value={activeCount} icon={UserPlus} accent="secondary" />
        <StatCard title="Outstanding" value={totalOutstanding} prefix={`${currency} `} icon={DollarSign} accent="error" />
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 rounded-2xl bg-white/[0.02] p-4"><Users className="h-8 w-8 text-neutral-600" /></div>
          <p className="text-sm text-neutral-400">No customers yet.</p>
          <button onClick={openAdd} className="mt-3 text-sm font-medium text-primary-400 hover:text-primary-300 transition">Add your first customer →</button>
        </div>
      ) : (
      <motion.div
        variants={stagger(0.04, 0.1)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
        {clients.map((client) => (
          <motion.div
            key={client.id}
            layout
            variants={listItemVariants}
            exit="exit"
            className="card-hover group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-neutral-700"
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
              <div className="flex items-center gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${client.status === "active" ? "bg-success-500/10 text-success-400" : "bg-neutral-700 text-neutral-400"}`}>
                  {client.status}
                </span>
                <button
                  onClick={() => openEdit(client)}
                  className="rounded-lg p-1 text-neutral-500 opacity-0 transition hover:bg-white/[0.04] hover:text-white group-hover:opacity-100"
                  aria-label="Edit customer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(client)}
                  className="rounded-lg p-1 text-neutral-500 opacity-0 transition hover:bg-error-500/10 hover:text-error-400 group-hover:opacity-100"
                  aria-label="Delete customer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-400"><Mail className="h-3 w-3" />{client.email}</div>
              {client.phone && <div className="flex items-center gap-2 text-neutral-400"><Phone className="h-3 w-3" />{client.phone}</div>}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
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
        </AnimatePresence>
      </motion.div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editing ? "Edit Customer" : "Add New Customer"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Full Name</label>
            <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Brian Kamau" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="brian@example.com" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Phone (optional)</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 700 000 000" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-press rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">{submitting ? "Saving..." : editing ? "Save Changes" : "Add Customer"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Customer" maxWidth="max-w-md">
        <p className="text-sm text-neutral-300">
          Are you sure you want to delete <span className="font-semibold text-white">{confirmDelete?.name}</span>?
          This action cannot be undone.
        </p>
        <div className="mt-6">
          <SlideConfirm
            onConfirm={async () => { await handleDelete(); }}
            label="Slide to delete"
            confirmingLabel="Deleting..."
            doneLabel="Deleted"
          />
        </div>
        <button type="button" onClick={() => setConfirmDelete(null)} className="mt-3 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
      </Modal>
    </div>
  );
}
