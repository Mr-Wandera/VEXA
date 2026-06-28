import { useState } from "react";
import { motion } from "motion/react";
import { Users, Settings, Plus, Star, ShieldCheck, Mail, Building, Landmark } from "lucide-react";
import { Client, BusinessProfile } from "../types.ts";

interface ClientSettingsManagerProps {
  clients: Client[];
  profile: BusinessProfile;
  onAddClient: (client: { name: string; email: string }) => Promise<void>;
  onUpdateProfile: (profile: Partial<BusinessProfile>) => Promise<void>;
}

export default function ClientSettingsManager({
  clients,
  profile,
  onAddClient,
  onUpdateProfile
}: ClientSettingsManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'settings'>('clients');

  // Client form states
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [addingClient, setAddingClient] = useState(false);

  // Settings states
  const [profileName, setProfileName] = useState(profile.name);
  const [profileIndustry, setProfileIndustry] = useState(profile.industry);
  const [profileTaxRate, setProfileTaxRate] = useState(profile.taxRate);
  const [savingSettings, setSavingSettings] = useState(false);

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail) return;

    setAddingClient(true);
    try {
      await onAddClient({ name: clientName, email: clientEmail });
      setClientName("");
      setClientEmail("");
    } catch (err) {
      console.error(err);
    } finally {
      setAddingClient(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await onUpdateProfile({
        name: profileName,
        industry: profileIndustry,
        taxRate: Number(profileTaxRate)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 backdrop-blur-xl">
      {/* Tab Switcher */}
      <div className="flex border-b border-neutral-800 pb-4.5 mb-6 justify-between items-center">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab('clients')}
            className={`flex items-center gap-2 font-display text-sm font-semibold pb-1 border-b-2 transition ${
              activeSubTab === 'clients' 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Corporate Clients ({clients.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`flex items-center gap-2 font-display text-sm font-semibold pb-1 border-b-2 transition ${
              activeSubTab === 'settings' 
                ? 'border-indigo-500 text-white' 
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings & Profile</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'clients' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Client Form */}
          <div className="lg:col-span-1 rounded-xl border border-neutral-800/80 bg-neutral-950/40 p-5">
            <h4 className="font-display text-sm font-semibold text-white tracking-wide flex items-center gap-2 mb-4">
              <Plus className="h-4 w-4 text-indigo-400" />
              Onboard Corporate Client
            </h4>
            <form onSubmit={handleAddClientSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Client Legal Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acme Tech Corp"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Billing Contact Email</label>
                <input
                  required
                  type="email"
                  placeholder="e.g. billing@acme.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={addingClient}
                className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white hover:bg-indigo-500 transition"
              >
                {addingClient ? "Onboarding..." : "Onboard Corporate Client"}
              </button>
            </form>
          </div>

          {/* Clients List */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display text-sm font-semibold text-white tracking-wide">Onboarded Accounts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clients.map((c) => (
                <div key={c.id} className="rounded-xl border border-neutral-800/60 bg-neutral-950/30 p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-2.5 text-neutral-300">
                      <Building className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-display text-xs font-semibold text-white tracking-wide leading-tight">{c.name}</h5>
                      <span className="flex items-center gap-1 mt-1 text-[10px] text-neutral-500 font-mono">
                        <Mail className="h-2.5 w-2.5" />
                        {c.email}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block font-mono text-xs font-semibold text-white">${c.totalInvoiced.toLocaleString()}</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 font-mono mt-1">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Settings Profile Form */
        <form onSubmit={handleSaveSettings} className="max-w-xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Business / Agency Legal Name</label>
              <input
                required
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Industry Vertical</label>
              <input
                required
                type="text"
                value={profileIndustry}
                onChange={(e) => setProfileIndustry(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Corporate Tax Rate (%)</label>
              <input
                required
                type="number"
                value={profileTaxRate}
                onChange={(e) => setProfileTaxRate(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Currency Protocol</label>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 px-4 py-3 text-sm text-neutral-500 font-mono">
                USD ($)
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h5 className="font-display text-xs font-semibold text-white tracking-wide">Stripe Financial Integration</h5>
                <p className="text-[10px] text-neutral-400 mt-0.5">Automate clearing schedules and ACH direct transactions.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] uppercase font-semibold text-emerald-400">Connected</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-800">
            <button
              type="submit"
              disabled={savingSettings}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/10"
            >
              {savingSettings ? "Updating system..." : "Save Configuration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
