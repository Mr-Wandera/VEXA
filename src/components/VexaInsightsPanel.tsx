import { motion } from "motion/react";
import { Sparkles, AlertCircle, TrendingUp, CheckCircle, ArrowRight, ArrowUpRight, Zap } from "lucide-react";
import { VexaInsight } from "../types.ts";

interface VexaInsightsPanelProps {
  insights: VexaInsight[];
  loading: boolean;
  onRefresh: () => void;
  onAction: (code: string) => void;
}

export default function VexaInsightsPanel({
  insights,
  loading,
  onRefresh,
  onAction
}: VexaInsightsPanelProps) {

  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-neutral-800/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400">
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <h2 className="font-display text-base font-semibold text-white tracking-wide">
            VEXA AI Insights Feed
          </h2>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-neutral-900 hover:text-white disabled:opacity-50"
        >
          <Zap className="h-3 w-3 text-indigo-400" />
          {loading ? "Re-Analyzing..." : "Regenerate Insights"}
        </button>
      </div>

      <div className="mt-5 space-y-4">
        {loading ? (
          // Skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-neutral-800/40 bg-neutral-950/20 p-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-1/3 rounded bg-neutral-800" />
                <div className="h-4 w-12 rounded bg-neutral-800" />
              </div>
              <div className="mt-3 h-3 w-3/4 rounded bg-neutral-800" />
              <div className="mt-2 h-3 w-1/2 rounded bg-neutral-800" />
            </div>
          ))
        ) : insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-neutral-500">
            <Sparkles className="h-8 w-8 text-neutral-600 mb-2" />
            <p className="text-sm">No insights available. Add a transaction or prompt VEXA below to start operations.</p>
          </div>
        ) : (
          insights.map((insight, idx) => {
            const isAlert = insight.type === 'alert';
            const isSuccess = insight.type === 'success';
            const isForecast = insight.type === 'forecast';

            return (
              <motion.div
                key={insight.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative rounded-xl border border-neutral-800/50 bg-neutral-950/40 p-4.5 transition-all hover:border-neutral-700/70 hover:bg-neutral-900/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 rounded-lg p-1.5 ${
                      isAlert 
                        ? 'bg-rose-500/10 text-rose-400' 
                        : isSuccess 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : isForecast 
                            ? 'bg-blue-500/10 text-blue-400' 
                            : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {isAlert ? (
                        <AlertCircle className="h-4 w-4" />
                      ) : isForecast ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : isSuccess ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-semibold text-white tracking-wide group-hover:text-indigo-300 transition-colors">
                        {insight.title}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                        {insight.description}
                      </p>
                    </div>
                  </div>

                  {insight.impactValue && (
                    <div className={`shrink-0 font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                      isAlert 
                        ? 'bg-rose-500/10 text-rose-400' 
                        : isSuccess 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {insight.impactValue}
                    </div>
                  )}
                </div>

                {insight.actionText && (
                  <div className="mt-3.5 flex justify-end">
                    <button
                      onClick={() => onAction(insight.actionCode || '')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-600 group/btn"
                    >
                      <span>{insight.actionText}</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
