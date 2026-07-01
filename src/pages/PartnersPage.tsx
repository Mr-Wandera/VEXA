import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Handshake, Plus, Mail, Phone, DollarSign, Percent } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Partner } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { useCurrency } from "../lib/useCurrency";

export default function PartnersPage() {
  const { show } = useToast();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [equity, setEquity] = useState("");
  const [contribution, setContribution] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!name || !role) {
      show("Please enter name and role.", "error");
      setSubmitting(false);
      return;
    }
    if (Number(equity) > 100) {
      show("Equity cannot exceed 100%.", "error");
      setSubmitting(false);
      return;
    }
    try {
      const p = await apiClient.addPartner({ name, role, equity: Number(equity), contribution: Number(contribution), email, phone, status: "active" });
      setPartners((prev) => [p, ...prev]);
      setName(""); setRole(""); setEquity(""); setContribution(""); setEmail(""); setPhone("");
      setShowAdd(false);
      show("Partner created successfully", "success");
    } catch (err) {
      console.error(err);
      show("Failed to create. Please try again.", "error");
    }
    finally { setSubmitting(false); }
  };

  const totalEquity = partners.reduce((sum, p) => sum + p.equity, 0);
  const totalContribution = partners.reduce((sum, p) => sum + p.contribution, 0);

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}</div></div>;

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Partners"
        subtitle="Manage business partners and stakeholders."
        action={{ label: "Add Partner", icon: Plus, onClick: () => setShowAdd(true) }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Partners" value={partners.length} icon={Handshake} accent="primary" />
        <StatCard title="Total Equity" value={totalEquity} suffix="%" icon={Percent} accent="secondary" />
        <StatCard title="Total Capital" value={totalContribution} prefix={`${currency} `} icon={DollarSign} accent="accent" />
      </div>

      {partners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-3 rounded-2xl bg-neutral-900/50 p-4"><Handshake className="h-8 w-8 text-neutral-600" /></div>
          <p className="text-sm text-neutral-400">No partners yet.</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-sm font-medium text-primary-400 hover:text-primary-300 transition">Add your first partner →</button>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {partners.map((partner, i) => (
          <motion.div key={partner.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-5 backdrop-blur-xl transition hover:border-neutral-700">
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
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${partner.status === "active" ? "bg-success-500/10 text-success-400" : "bg-neutral-700 text-neutral-400"}`}>{partner.status}</span>
            </div>
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 text-neutral-400"><Mail className="h-3 w-3" />{partner.email}</div>
              <div className="flex items-center gap-2 text-neutral-400"><Phone className="h-3 w-3" />{partner.phone}</div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-neutral-800/60 pt-3">
              <div><p className="text-[10px] uppercase text-neutral-500">Equity</p><p className="font-mono text-sm font-semibold text-accent-400">{partner.equity}%</p></div>
              <div className="text-right"><p className="text-[10px] uppercase text-neutral-500">Contribution</p><p className="font-mono text-sm font-semibold text-white">{currency} {partner.contribution.toLocaleString()}</p></div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Partner">
        <form onSubmit={handleAdd} className="space-y-4">
          <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Full Name</label><input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Partner name" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Role</label><input required type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="CEO & Founder" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Equity (%)</label><input required type="number" min="0" max="100" value={equity} onChange={(e) => setEquity(e.target.value)} placeholder="25" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" /></div>
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Contribution ({currency})</label><input required type="number" min="0" value={contribution} onChange={(e) => setContribution(e.target.value)} placeholder="200000" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="partner@vexa.co" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-neutral-400 mb-1.5">Phone</label><input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+254 700 000 000" className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" /></div>
          </div>
          <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={submitting} className="rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">{submitting ? "Adding..." : "Add Partner"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
