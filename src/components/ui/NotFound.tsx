import { motion } from "motion/react";
import { Compass, ArrowLeft } from "lucide-react";
import { useRouter } from "../../lib/router";

export default function NotFound() {
  const { navigate } = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 rounded-2xl bg-white/[0.03] p-5">
        <Compass className="h-10 w-10 text-neutral-500" />
      </div>
      <h1 className="font-display text-2xl font-bold text-white">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <button
        onClick={() => navigate("/app/dashboard")}
        className="mt-6 flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500 btn-press"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </button>
    </motion.div>
  );
}
