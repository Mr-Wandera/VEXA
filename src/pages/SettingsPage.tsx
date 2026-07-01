import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Building, Mail, Phone, MapPin, Percent, Save, Check, Landmark } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { BusinessProfile } from "../types";
import PageHeader from "../components/ui/PageHeader";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

export default function SettingsPage() {
  const { show } = useToast();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(false);
    try {
      const p = await apiClient.getProfile();
      setProfile(p);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (profile.taxRate < 0 || profile.taxRate > 100) {
      show("Tax rate must be between 0 and 100.", "error");
      return;
    }
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      show("Please enter a valid email address.", "error");
      return;
    }
    setSaving(true);
    try {
      await apiClient.updateProfile(profile);
      show("Settings saved successfully", "success");
    } catch (err) {
      console.error(err);
      show("Failed to save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-xl shimmer" /><div className="h-96 rounded-2xl shimmer" /></div>;
  if (error || !profile) return <ErrorState message="Failed to load settings." onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your business profile and preferences." />

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="card-premium rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
        >
          <h3 className="font-display text-base font-semibold text-white border-b border-white/[0.06] pb-4">Business Profile</h3>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="biz-name" className="block text-xs font-medium text-neutral-400 mb-1.5">Business Name</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input id="biz-name" type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label htmlFor="biz-industry" className="block text-xs font-medium text-neutral-400 mb-1.5">Industry</label>
              <input id="biz-industry" type="text" value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="biz-currency" className="block text-xs font-medium text-neutral-400 mb-1.5">Currency</label>
                <select id="biz-currency" value={profile.currency} onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
                  <option value="KSh">KSh (Kenyan Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="NGN">NGN (Nigerian Naira)</option>
                  <option value="GHS">GHS (Ghanaian Cedi)</option>
                  <option value="ZAR">ZAR (South African Rand)</option>
                </select>
              </div>
              <div>
                <label htmlFor="biz-tax" className="block text-xs font-medium text-neutral-400 mb-1.5">Tax Rate (%)</label>
                <div className="relative">
                  <Percent className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input id="biz-tax" type="number" min="0" max="100" value={profile.taxRate} onChange={(e) => setProfile({ ...profile, taxRate: Number(e.target.value) })}
                    className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
          className="card-premium rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
        >
          <h3 className="font-display text-base font-semibold text-white border-b border-white/[0.06] pb-4">Contact Information</h3>
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="biz-email" className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input id="biz-email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor="biz-phone" className="block text-xs font-medium text-neutral-400 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input id="biz-phone" type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="biz-city" className="block text-xs font-medium text-neutral-400 mb-1.5">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                  <input id="biz-city" type="text" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white focus:border-primary-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label htmlFor="biz-country" className="block text-xs font-medium text-neutral-400 mb-1.5">Country</label>
                <input id="biz-country" type="text" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="card-premium rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
        >
          <h3 className="font-display text-base font-semibold text-white border-b border-white/[0.06] pb-4">Integrations</h3>
          <div className="mt-5 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-500/10 p-2.5 text-primary-400"><Landmark className="h-5 w-5" /></div>
              <div>
                <h5 className="font-display text-sm font-semibold text-white">Stripe Financial Integration</h5>
                <p className="text-xs text-neutral-400 mt-0.5">Automate clearing schedules and ACH transactions.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile.stripeConnected ? (
                <>
                  <span className="live-pulse h-2 w-2 rounded-full bg-success-400" />
                  <span className="font-mono text-[10px] uppercase font-semibold text-success-400">Connected</span>
                  <button
                    type="button"
                    onClick={() => { setProfile({ ...profile, stripeConnected: false }); show("Stripe integration disconnected.", "info"); }}
                    className="ml-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-xs font-semibold text-neutral-400 hover:text-white transition"
                  >Disconnect</button>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-neutral-600" />
                  <span className="font-mono text-[10px] uppercase font-semibold text-neutral-500">Not Connected</span>
                  <button
                    type="button"
                    onClick={() => { setProfile({ ...profile, stripeConnected: true }); show("Stripe integration connected.", "success"); }}
                    className="ml-2 btn-press rounded-lg bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-500 transition"
                  >Connect</button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="btn-press flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-500 disabled:opacity-50">
            {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
