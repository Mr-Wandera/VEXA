import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Building, Mail, Phone, MapPin, Percent, Save, Check, Landmark } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { BusinessProfile } from "../types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.getMetrics().then(({ profile }) => { setProfile(profile); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      await apiClient.updateProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  if (loading || !profile) return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="h-96 rounded-2xl shimmer" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm text-neutral-400">Manage your business profile and preferences.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {/* Business Profile */}
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-white border-b border-neutral-800/60 pb-4">Business Profile</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Business Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Industry</label>
              <input type="text" value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Currency</label>
                <select value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
                  <option value="KSh">KSh (Kenyan Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="NGN">NGN (Nigerian Naira)</option>
                  <option value="GHS">GHS (Ghanaian Cedi)</option>
                  <option value="ZAR">ZAR (South African Rand)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input type="number" min="0" max="100" value={profile.taxRate} onChange={(e) => setProfile({ ...profile, taxRate: Number(e.target.value) })} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-white border-b border-neutral-800/60 pb-4">Contact Information</h3>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input type="text" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Country</label>
                <input type="text" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
          <h3 className="font-display text-base font-semibold text-white border-b border-neutral-800/60 pb-4">Integrations</h3>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-500/10 p-2.5 text-primary-400"><Landmark className="h-5 w-5" /></div>
              <div>
                <h5 className="font-display text-sm font-semibold text-white">Stripe Financial Integration</h5>
                <p className="text-xs text-neutral-400 mt-0.5">Automate clearing schedules and ACH transactions.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success-400 animate-pulse" />
              <span className="font-mono text-[10px] uppercase font-semibold text-success-400">Connected</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-500 disabled:opacity-50">
            {saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
