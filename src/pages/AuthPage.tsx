import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft, Check, Eye, EyeOff } from "lucide-react";
import { useRouter } from "../lib/router";
import { useToast } from "../components/ui/Toast";
import { useAuth } from "../lib/auth";
import { seedNewAccount } from "../lib/seed";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const { navigate } = useRouter();
  const { show } = useToast();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError.includes("Invalid login credentials")
            ? "Invalid email or password. Please try again."
            : signInError);
          setLoading(false);
          return;
        }
        show("Welcome back!", "success");
      } else {
        const { error: signUpError } = await signUp(email, password, name.trim());
        if (signUpError) {
          setError(signUpError.includes("already registered")
            ? "An account with this email already exists. Please sign in."
            : signUpError);
          setLoading(false);
          return;
        }
        // Seed the new account with demo data
        await seedNewAccountForEmail(email);
        show("Account created successfully!", "success");
      }
      navigate("/app/dashboard");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Helper: seed after signup. We need the user id, which we get from the session.
  const seedNewAccountForEmail = async (_email: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await seedNewAccount(user.id);
      }
    } catch (err) {
      console.error("Failed to seed account:", err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/[0.04] bg-neutral-950 p-12 lg:flex">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute inset-0">
          <div className="ambient-orb bg-primary-500/10 h-[400px] w-[400px] left-1/4 top-1/4 float-anim" />
          <div className="ambient-orb bg-secondary-500/10 h-[300px] w-[300px] bottom-1/4 right-1/4 float-anim" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight gradient-animated">VEXA</span>
          </button>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold leading-tight">
            The AI Business
            <br />
            Operating System.
          </h2>
          <p className="mt-4 max-w-sm text-neutral-400">
            Track sales, manage inventory, and get AI-powered insights that help you make
            smarter decisions every day.
          </p>
          <div className="mt-8 space-y-3">
            {["Real-time financial dashboard", "AI-powered business insights", "Smart inventory management"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm text-neutral-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/15">
                  <Check className="h-3 w-3 text-primary-400" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-neutral-600">
          Trusted by ambitious entrepreneurs across Africa.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full flex-col items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <button onClick={() => navigate("/")} className="mb-8 flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition lg:hidden">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </button>

          <h1 className="font-display text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            {mode === "signin"
              ? "Sign in to access your business dashboard."
              : "Start your 30-day free trial. No credit card required."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" autoComplete="on">
            <AnimatePresence mode="wait">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label htmlFor="name" className="block text-xs font-medium text-neutral-400 mb-1.5">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Brian Kamau"
                      className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-600 transition focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-neutral-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-600 transition focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-neutral-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pl-11 pr-11 text-sm text-white placeholder-neutral-600 transition focus:border-primary-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1.5 text-sm text-error-400"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/15 transition hover:bg-primary-500 disabled:opacity-50 btn-press"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-400">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="font-semibold text-primary-400 hover:text-primary-300 transition"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
