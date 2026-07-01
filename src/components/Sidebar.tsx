import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, ShoppingCart, Package, Receipt, Users, Truck, Handshake, ChartBar as BarChart3, Bell, Clock, Settings, Sparkles, FileText, X } from "lucide-react";
import { useRouter } from "../lib/router";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  notificationCount: number;
}

const NAV_ITEMS = [
  { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/sales", label: "Sales", icon: ShoppingCart },
  { path: "/app/inventory", label: "Inventory", icon: Package },
  { path: "/app/expenses", label: "Expenses", icon: Receipt },
  { path: "/app/invoices", label: "Invoices", icon: FileText },
  { path: "/app/customers", label: "Customers", icon: Users },
  { path: "/app/suppliers", label: "Suppliers", icon: Truck },
  { path: "/app/partners", label: "Partners", icon: Handshake },
  { path: "/app/reports", label: "Reports", icon: BarChart3 },
  { path: "/app/timeline", label: "Timeline", icon: Clock },
  { path: "/app/notifications", label: "Notifications", icon: Bell, badge: true },
  { path: "/app/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose, notificationCount }: SidebarProps) {
  const { path, navigate } = useRouter();

  const handleNavigate = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 border-r border-neutral-800/60 bg-neutral-950/80 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5">
            <button onClick={() => handleNavigate("/app/dashboard")} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold tracking-tight text-white">VEXA</span>
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:text-white lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-3 py-2">
            <div className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = path === item.path || path.startsWith(item.path + "/");
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-neutral-800/60 text-white"
                        : "text-neutral-400 hover:bg-neutral-800/30 hover:text-neutral-200"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary-500"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className={`h-4 w-4 ${isActive ? "text-primary-400" : ""}`} />
                    <span>{item.label}</span>
                    {item.badge && notificationCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500/20 px-1.5 text-xs font-semibold text-error-400">
                        {notificationCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* AI Assistant button at bottom */}
          <div className="p-3">
            <button
              onClick={() => handleNavigate("/app/ai")}
              className="flex w-full items-center gap-3 rounded-xl border border-primary-500/20 bg-primary-500/5 px-3 py-3 text-sm font-medium text-primary-300 transition hover:bg-primary-500/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/15">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">VEXA AI</div>
                <div className="text-xs text-neutral-500">Ask your CFO</div>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
