import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
interface Toast { id: string; type: ToastType; message: string; }
interface ToastContextValue { show: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
  const COLORS = {
    success: "border-success-500/30 bg-success-500/10 text-success-400",
    error: "border-error-500/30 bg-error-500/10 text-error-400",
    info: "border-secondary-500/30 bg-secondary-500/10 text-secondary-400",
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = ICONS[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`pointer-events-auto flex items-center gap-3 rounded-xl border ${COLORS[toast.type]} bg-neutral-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl min-w-[280px] max-w-md`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <p className="flex-1 text-sm text-white">{toast.message}</p>
                <button onClick={() => dismiss(toast.id)} className="text-neutral-500 hover:text-white transition shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
