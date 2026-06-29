import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Truck, Plus, X, Mail, Phone, DollarSign, Package } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Supplier } from "../types";
import StatCard from "../components/ui/StatCard";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try { setSuppliers(await apiClient.getSuppliers()); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const s = await apiClient.addSupplier({ name, contactPerson, email, phone, category, status: "active" });
      setSuppliers((prev) => [s, ...prev]);
      setName(""); setContactPerson(""); setEmail(""); setPhone(""); setCategory("");
      setShowAdd(false);
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  const totalPayable = suppliers.reduce((sum, s) => sum + s.outstandingPayable, 0);
  const totalPurchased = suppliers.reduce((sum, s) => sum + s.totalPurchased, 0);
  const activeCount = suppliers.filter((s) => s.status === "active").length;

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Suppliers</h1>
          <p className="text-sm text-neutral-400">Manage your supply chain partners.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-500">
          <Plus className="h-4 w-4" /><span className="hidden sm:inline">Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Suppliers" value={suppliers.length} icon={Truck} accent="primary" />
        <StatCard title="Total Purchased" value={totalPurchased} prefix="KSh " icon={Package} accent="secondary" />
        <StatCard title="Outstanding Payable" value={totalPayable} prefix="KSh " icon={DollarSign} accent="error" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {suppliers.map((supplier, i) => (
          <motion.div key={supplier.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-5 backdrop-blur-xl transition hover:border-neutral-700">
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
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${supplier.status === "active" ? "bg-success-500/10 text-success-400" : "bg-neutral-700 text-neutral-400"}`}>{supplier.status}</span>
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-400"><Mail className="h-3 w-3" />{supplier.email}</div>
              <div className="flex items-center gap-2 text-neutral-400"><Phone className="h-3 w-3" />{supplier.phone}</div>
              <p className="text-neutral-500">Contact: {supplier.contactPerson}</p>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-neutral-800/60 pt-3">
              <div><p className="text-[10px] uppercase text-neutral-500">Total Purchased</p><p className="font-mono text-sm font-semibold text-white">KSh {supplier.totalPurchased.toLocaleString()}</p></div>
              <div className="text-right"><p className="text-[10px] uppercase text-neutral-500">Payable</p><p className={`font-mono text-sm font-semibold ${supplier.outstandingPayable > 0 ? "text-error-400" : "text-success-400"}`}>KSh {supplier.outstandingPayable.toLocaleString()}</p></div>
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
                <h3 className="font-display text-base font-semibold text-white">Add New Supplier</h3>
                <button onClick={() => setShowAdd(false)} className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-400 hover:text-white transition"><X className="h-4 w-4" /></button>
              </div>
              <form onSubmit={handleAdd} className="mt-5 space-y-4">
                <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Supplier Name</label><input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nairobi Textile Co." className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
                <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Contact Person</label><input required type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="John Mwangi" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@supplier.com" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
                  <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Phone</label><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
                </div>
                <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Category</label><input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Apparel Manufacturing" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
                <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                  <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
                  <button type="submit" disabled={submitting} className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">{submitting ? "Adding..." : "Add Supplier"}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
