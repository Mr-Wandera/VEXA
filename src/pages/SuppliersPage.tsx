import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Truck, Plus, Mail, Phone, DollarSign, Package, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Supplier } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { useCurrency } from "../lib/useCurrency";

const EMPTY_FORM = { name: "", contactPerson: "", email: "", phone: "", category: "", status: "active" as "active" | "inactive" };

export default function SuppliersPage() {
  const { show } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Supplier | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const currency = useCurrency();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setError(null);
      setSuppliers(await apiClient.getSuppliers());
    } catch (err) {
      console.error(err);
      setError("Failed to load suppliers. Please try again.");
    }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowAdd(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      category: supplier.category,
      status: supplier.status,
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        const updated = await apiClient.updateSupplier(editing.id, form);
        setSuppliers((prev) => prev.map((s) => (s.id === editing.id ? updated : s)));
        show("Supplier updated successfully", "success");
      } else {
        const s = await apiClient.addSupplier(form);
        setSuppliers((prev) => [s, ...prev]);
        show("Supplier created successfully", "success");
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
      await apiClient.deleteSupplier(confirmDelete.id);
      setSuppliers((prev) => prev.filter((s) => s.id !== confirmDelete.id));
      show("Supplier deleted", "success");
    } catch (err) {
      console.error(err);
      show("Failed to delete supplier.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const totalPayable = suppliers.reduce((sum, s) => sum + s.outstandingPayable, 0);
  const totalPurchased = suppliers.reduce((sum, s) => sum + s.totalPurchased, 0);
  const activeCount = suppliers.filter((s) => s.status === "active").length;

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-xl shimmer" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div></div>;

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage your supply chain partners."
        action={{ label: "Add Supplier", icon: Plus, onClick: openAdd }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Suppliers" value={suppliers.length} icon={Truck} accent="primary" />
        <StatCard title="Total Purchased" value={totalPurchased} prefix={`${currency} `} icon={Package} accent="secondary" />
        <StatCard title="Outstanding Payable" value={totalPayable} prefix={`${currency} `} icon={DollarSign} accent="error" />
      </div>

      {suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 rounded-2xl bg-white/[0.02] p-4"><Truck className="h-8 w-8 text-neutral-600" /></div>
          <p className="text-sm text-neutral-400">No suppliers yet.</p>
          <button onClick={openAdd} className="mt-3 text-sm font-medium text-primary-400 hover:text-primary-300 transition">Add your first supplier →</button>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {suppliers.map((supplier, i) => (
          <motion.div key={supplier.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card-hover group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-neutral-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-500/10 text-secondary-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-white">{supplier.name}</h4>
                  <p className="text-xs text-neutral-500">{supplier.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${supplier.status === "active" ? "bg-success-500/10 text-success-400" : "bg-neutral-700 text-neutral-400"}`}>{supplier.status}</span>
                <button onClick={() => openEdit(supplier)} className="rounded-lg p-1 text-neutral-500 opacity-0 transition hover:bg-white/[0.04] hover:text-white group-hover:opacity-100" aria-label="Edit supplier"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => setConfirmDelete(supplier)} className="rounded-lg p-1 text-neutral-500 opacity-0 transition hover:bg-error-500/10 hover:text-error-400 group-hover:opacity-100" aria-label="Delete supplier"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-400"><Mail className="h-3 w-3" />{supplier.email}</div>
              <div className="flex items-center gap-2 text-neutral-400"><Phone className="h-3 w-3" />{supplier.phone}</div>
              <p className="text-neutral-500">Contact: {supplier.contactPerson}</p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <div><p className="text-[10px] uppercase text-neutral-500">Total Purchased</p><p className="font-mono text-sm font-semibold text-white">{currency} {supplier.totalPurchased.toLocaleString()}</p></div>
              <div className="text-right"><p className="text-[10px] uppercase text-neutral-500">Payable</p><p className={`font-mono text-sm font-semibold ${supplier.outstandingPayable > 0 ? "text-error-400" : "text-success-400"}`}>{currency} {supplier.outstandingPayable.toLocaleString()}</p></div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editing ? "Edit Supplier" : "Add New Supplier"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Supplier Name</label><input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nairobi Textile Co." className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Contact Person</label><input required type="text" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} placeholder="John Mwangi" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@supplier.com" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Phone</label><input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 700 000 000" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          </div>
          <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Category</label><input required type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Apparel Manufacturing" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-press rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">{submitting ? "Saving..." : editing ? "Save Changes" : "Add Supplier"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Supplier" maxWidth="max-w-md">
        <p className="text-sm text-neutral-300">
          Are you sure you want to delete <span className="font-semibold text-white">{confirmDelete?.name}</span>?
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
