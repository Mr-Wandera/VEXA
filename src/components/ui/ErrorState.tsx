import { CircleAlert as AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 rounded-2xl bg-error-500/10 p-4">
        <AlertCircle className="h-8 w-8 text-error-400" />
      </div>
      <p className="text-sm text-neutral-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}
