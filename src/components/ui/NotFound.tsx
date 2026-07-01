import { Compass } from "lucide-react";
import { useRouter } from "../../lib/router";

export default function NotFound() {
  const { navigate } = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-2xl bg-neutral-900/50 p-5">
        <Compass className="h-10 w-10 text-neutral-500" />
      </div>
      <h1 className="font-display text-2xl font-bold text-white">Page Not Found</h1>
      <p className="mt-2 max-w-sm text-sm text-neutral-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <button
        onClick={() => navigate("/app/dashboard")}
        className="mt-6 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-500"
      >
        Back to Dashboard
      </button>
    </div>
  );
}
