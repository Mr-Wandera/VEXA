import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Handshake, Plus, Mail, Phone, DollarSign, Percent, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Partner } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { useCurrency } from "../lib/useCurrency";

const EMPTY_FORM = { name: "", role: "", equity: "", contribution: "", email: "", phone: "", status: "active" as "active" | "inactive" };

export default function PartnersPage() {
  const { show } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Partner | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const currency = useCurrency();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setError(null);
      setPartners(await apiClient.getPartners());
    } catch (err) {
      console.error(err);
      setError("Failed to load partners. Please try again.");
    }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowAdd(true);
  };

  const openEdit = (partner: Partner) => {
    setEditing(partner);
    setForm({
      name: partner.name,
      role: partner.role,
      equity: String(partner.equity),
      contribution: String(partner.contribution),
      email: partner.email,
      phone: partner.phone,
      status: partner.status,
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!form.name || !form.role) {
      show("Please enter name and role.", "error");
      setSubmitting(false);
      return;
    }
    if (Number(form.equity) > 100) {
      show("Equity cannot exceed 100%.", "error");
      setSubmitting(false);
      return;
    }
    try {
      const payload = {
        name: form.name,
        role: form.role,
        equity: Number(form.equity || 0),
        contribution: Number(form.contribution || 0),
        email: form.email,
        phone: form.phone,
        status: form.status,
      };
      if (editing) {
        const updated = await apiClient.updatePartner(editing.id, payload);
        setPartners((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
        show("Partner updated successfully", "success");
      } else {
        const p = await apiClient.addPartner(payload);
        setPartners((prev) => [p, ...prev]);
        show("Partner created successfully", "success");
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
      await apiClient.deletePartner(confirmDelete.id);
      setPartners((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      show("Partner deleted", "success");
    } catch (err) {
      console.error(err);
      show("Failed to delete partner.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const totalEquity = partners.reduce((sum, p) => sum + p.equity, 0);
  const totalContribution = partners.reduce((sum, p) => sum + p.contribution, 0);

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-xl shimmer" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div></div>;

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        subtitle="Manage business partners and stakeholders."
        action={{ label: "Add Partner", icon: Plus, onClick: openAdd }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Partners" value={partners.length} icon={Handshake} accent="primary" />
        <StatCard title="Total Equity" value={totalEquity} suffix="%" icon={Percent} accent="secondary" />
        <StatCard title="Total Capital" value={totalContribution} prefix={`${currency} `} icon={DollarSign} accent="accent" />
      </div>

      {partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 rounded-2xl bg-white/[0.02] p-4"><Handshake className="h-8 w-8 text-neutral-600" /></div>
          <p className="text-sm text-neutral-400">No partners yet.</p>
          <button onClick={openAdd} className="mt-3 text-sm font-medium text-primary-400 hover:text-primary-300 transition">Add your first partner →</button>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {partners.map((partner, i) => (
          <motion.div key={partner.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card-hover group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 backdrop-blur-xl transition hover:border-neutral-700">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent-500/20 to-primary-500/20 text-sm font-bold text-accent-300">
                  {partner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-display text-sm font-semibold text-white">{partner.name}</h4>
                  <p className="text-xs text-neutral-500">{partner.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${partner.status === "active" ? "bg-success-500/10 text-success-400" : "bg-neutral-700 text-neutral-400"}`}>{partner.status}</span>
                <button onClick={() => openEdit(partner)} className="rounded-lg p-1 text-neutral-500 opacity-0 transition hover:bg-white/[0.04] hover:text-white group-hover:opacity-100" aria-label="Edit partner"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => setConfirmDelete(partner)} className="rounded-lg p-1 text-neutral-500 opacity-0 transition hover:bg-error-500/10 hover:text-error-400 group-hover:opacity-100" aria-label="Delete partner"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-400"><Mail className="h-3 w-3" />{partner.email}</div>
              <div className="flex items-center gap-2 text-neutral-400"><Phone className="h-3 w-3" />{partner.phone}</div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <div><p className="text-[10px] uppercase text-neutral-500">Equity</p><p className="font-mono text-sm font-semibold text-accent-400">{partner.equity}%</p></div>
              <div className="text-right"><p className="text-[10px] uppercase text-neutral-500">Contribution</p><p className="font-mono text-sm font-semibold text-white">{currency} {partner.contribution.toLocaleString()}</p></div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editing ? "Edit Partner" : "Add New Partner"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Full Name</label><input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Partner name" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Role</label><input required type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="CEO & Founder" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Equity (%)</label><input required type="number" min="0" max="100" value={form.equity} onChange={(e) => setForm({ ...form, equity: e.target.value })} placeholder="25" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" /></div>
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Contribution ({currency})</label><input required type="number" min="0" value={form.contribution} onChange={(e) => setForm({ ...form, contribution: e.target.value })} placeholder="200000" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="partner@vexa.co" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Phone</label><input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+254 700 000 000" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
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
            <button type="submit" disabled={submitting} className="btn-press rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">{submitting ? "Saving..." : editing ? "Save Changes" : "Add Partner"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Partner" maxWidth="max-w-md">
        <p className="text-sm text-neutral-300">
          Are you sure you want to remove <span className="font-semibold text-white">{confirmDelete?.name}</span> as a partner?
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
