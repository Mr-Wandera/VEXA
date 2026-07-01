import { motion } from "motion/react";
import { Sparkles, ArrowRight, TrendingUp, Shield, Zap, ChartBar as BarChart3, Users, Package, Check, Star } from "lucide-react";
import { useRouter } from "../lib/router";

export default function LandingPage() {
  const { navigate } = useRouter();

  return (
    <div className="min-h-screen bg-neutral-950 text-white overflow-x-hidden">
      <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
      <div className="pointer-events-none fixed inset-0">
        <div className="ambient-orb bg-primary-500/10 h-[500px] w-[500px] left-1/4 top-0 float-anim" />
        <div className="ambient-orb bg-secondary-500/10 h-[400px] w-[400px] right-1/4 top-1/3 float-anim" style={{ animationDelay: '4s' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-12">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight gradient-animated">VEXA</span>
        </button>
        <div className="hidden items-center gap-8 md:flex">
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-neutral-400 hover:text-white transition">Features</button>
          <button onClick={() => document.getElementById("ai")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-neutral-400 hover:text-white transition">VEXA AI</button>
          <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-neutral-400 hover:text-white transition">Pricing</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/auth")} className="text-sm font-medium text-neutral-300 hover:text-white transition">
            Sign in
          </button>
          <button
            onClick={() => navigate("/auth")}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-20 pb-32 text-center lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5 text-xs text-neutral-400 backdrop-blur-xl">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary-400 live-pulse" />
            The AI Business Operating System
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Run your business
            <br />
            <span className="gradient-animated">like the future.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-400">
            VEXA is the AI-powered financial operating system for ambitious entrepreneurs.
            Track sales, manage inventory, analyze cash flow, and get intelligent insights —
            all in one beautiful platform.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => navigate("/auth")}
              className="group flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-500 btn-press"
            >
              Start free today
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => navigate("/app/dashboard")}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl transition hover:bg-white/[0.04]"
            >
              View live demo
            </button>
          </div>
          <p className="mt-4 text-xs text-neutral-500">No credit card required. Free for 30 days.</p>
        </motion.div>
      </section>

      {/* Trust bar */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-20">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-neutral-500">
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary-400" /> SOC 2 Ready</span>
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary-400" /> Bank-grade encryption</span>
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary-400" /> M-Pesa compatible</span>
          <span className="flex items-center gap-1.5"><Check className="h-4 w-4 text-primary-400" /> Works offline</span>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to grow</h2>
          <p className="mt-3 text-neutral-400">A complete toolkit for modern business operations.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: TrendingUp, title: "Live Dashboard", desc: "Real-time metrics, animated charts, and cash flow projections." },
            { icon: Package, title: "Smart Inventory", desc: "Track stock levels, get low-stock alerts, and auto-reorder." },
            { icon: BarChart3, title: "Financial Reports", desc: "Beautiful, exportable reports with AI-generated insights." },
            { icon: Users, title: "Customer CRM", desc: "Manage customers, track outstanding balances, and send invoices." },
            { icon: Shield, title: "Secure by Design", desc: "Bank-grade encryption, audit logs, and role-based access control." },
            { icon: Zap, title: "VEXA AI Engine", desc: "Proactive insights that feel like having a CFO in your pocket." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl card-hover"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary-500/10 p-3 text-primary-400">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI section */}
      <section id="ai" className="relative z-10 mx-auto max-w-4xl px-6 pb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-white/[0.06] bg-white/[0.025] p-10 backdrop-blur-xl lg:p-16"
        >
          <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 p-4">
            <Sparkles className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your AI business partner
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            VEXA AI doesn't just answer questions — it proactively monitors your business
            and tells you what to do next.
          </p>
          <div className="mt-8 space-y-3 text-left">
            {[
              "Hoodies will run out in 3 days. Reorder now to avoid stockout.",
              "Transport costs increased 18% this month. Here's why.",
              "Collect KSh 8,400 in outstanding invoices before ordering more stock.",
              "Profit is down 12% because advertising expenses doubled.",
            ].map((quote, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] p-4"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                <p className="text-sm text-neutral-300">{quote}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-32">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Loved by entrepreneurs</h2>
          <p className="mt-3 text-neutral-400">Join thousands of businesses already growing with VEXA.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { name: "Brian K.", role: "Founder, Aesthetic Lab", quote: "VEXA replaced three apps I was paying for. The AI insights alone are worth it." },
            { name: "Aisha M.", role: "CEO, Nairobi Textiles", quote: "I finally know my cash flow in real time. No more spreadsheet nightmares." },
            { name: "David O.", role: "Owner, CloudHost Africa", quote: "The inventory alerts saved me from three stockouts this month. Game changer." },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-accent-400 text-accent-400" />)}
              </div>
              <p className="text-sm text-neutral-300 leading-relaxed">"{t.quote}"</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-primary-500/20 to-secondary-500/20 text-sm font-bold text-primary-300">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-neutral-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 mx-auto max-w-5xl px-6 pb-32">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-3 text-neutral-400">Start free. Upgrade when you're ready.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { name: "Starter", price: "Free", desc: "For new businesses getting started.", features: ["Up to 50 transactions/mo", "Basic dashboard", "1 user", "Community support"], cta: "Start free", highlight: false },
            { name: "Growth", price: "KSh 2,500", period: "/mo", desc: "For growing businesses that need more.", features: ["Unlimited transactions", "VEXA AI insights", "5 users", "Priority support", "Inventory management"], cta: "Start 30-day trial", highlight: true },
            { name: "Enterprise", price: "Custom", desc: "For large operations with custom needs.", features: ["Everything in Growth", "Unlimited users", "Custom integrations", "Dedicated manager", "SLA guarantee"], cta: "Contact sales", highlight: false },
          ].map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-6 backdrop-blur-xl ${
                plan.highlight
                  ? "border-primary-500/40 bg-primary-500/[0.04]"
                  : "border-white/[0.06] bg-white/[0.025]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </div>
              )}
              <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-xs text-neutral-400">{plan.desc}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-white">{plan.price}</span>
                {plan.period && <span className="text-sm text-neutral-400">{plan.period}</span>}
              </div>
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-neutral-300">
                    <Check className="h-4 w-4 shrink-0 text-primary-400" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => plan.name === "Enterprise" ? window.open("mailto:sales@vexa.co?subject=Enterprise%20Inquiry", "_self") : navigate("/auth")}
                className={`mt-6 w-full rounded-xl py-3 text-sm font-semibold transition ${
                  plan.highlight
                    ? "bg-primary-600 text-white hover:bg-primary-500"
                    : "border border-white/[0.06] bg-white/[0.02] text-white hover:bg-white/[0.04]"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to transform your business?
        </h2>
        <p className="mt-3 text-neutral-400">Join thousands of entrepreneurs using VEXA to grow smarter.</p>
        <button
          onClick={() => navigate("/auth")}
          className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-500 btn-press"
        >
          Get started for free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-6 py-8 lg:px-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-500 to-secondary-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-sm font-bold gradient-animated">VEXA</span>
          </div>
          <p className="text-xs text-neutral-500">The AI Business Operating System. Built for ambitious entrepreneurs.</p>
        </div>
      </footer>
    </div>
  );
}
