import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Truck, Plus, Mail, Phone, DollarSign, Package } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Supplier } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";

export default function SuppliersPage() {
  const { show } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const s = await apiClient.addSupplier({ name, contactPerson, email, phone, category, status: "active" });
      setSuppliers((prev) => [s, ...prev]);
      setName(""); setContactPerson(""); setEmail(""); setPhone(""); setCategory("");
      setShowAdd(false);
      show("Supplier created successfully", "success");
    } catch (err) {
      console.error(err);
      show("Failed to create. Please try again.", "error");
    }
    finally { setSubmitting(false); }
  };

  const totalPayable = suppliers.reduce((sum, s) => sum + s.outstandingPayable, 0);
  const totalPurchased = suppliers.reduce((sum, s) => sum + s.totalPurchased, 0);
  const activeCount = suppliers.filter((s) => s.status === "active").length;

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div></div>;

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage your supply chain partners."
        action={{ label: "Add Supplier", icon: Plus, onClick: () => setShowAdd(true) }}
      />

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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Supplier">
        <form onSubmit={handleAdd} className="space-y-4">
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
      </Modal>
    </div>
  );
}
