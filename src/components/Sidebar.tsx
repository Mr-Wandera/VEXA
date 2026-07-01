import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { LayoutDashboard, ShoppingCart, Package, Receipt, Users, Truck, Handshake, ChartBar as BarChart3, Bell, Clock, Settings, Sparkles, FileText, X, ChevronLeft } from "lucide-react";
import { useRouter } from "../lib/router";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  notificationCount: number;
}

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { path: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { path: "/app/timeline", label: "Timeline", icon: Clock },
      { path: "/app/notifications", label: "Notifications", icon: Bell, badge: true },
    ],
  },
  {
    label: "Operations",
    items: [
      { path: "/app/sales", label: "Sales", icon: ShoppingCart },
      { path: "/app/inventory", label: "Inventory", icon: Package },
      { path: "/app/expenses", label: "Expenses", icon: Receipt },
      { path: "/app/invoices", label: "Invoices", icon: FileText },
    ],
  },
  {
    label: "Network",
    items: [
      { path: "/app/customers", label: "Customers", icon: Users },
      { path: "/app/suppliers", label: "Suppliers", icon: Truck },
      { path: "/app/partners", label: "Partners", icon: Handshake },
    ],
  },
  {
    label: "Insights",
    items: [
      { path: "/app/reports", label: "Reports", icon: BarChart3 },
      { path: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ open, onClose, notificationCount }: SidebarProps) {
  const { path, navigate } = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("vexa-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("vexa-sidebar-collapsed", String(next));
  };

  const handleNavigate = (to: string) => {
    navigate(to);
    onClose();
  };

  const sidebarWidth = collapsed ? "w-[72px]" : "w-64";

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full ${sidebarWidth} border-r border-white/[0.06] bg-neutral-950/60 backdrop-blur-2xl transition-all duration-300 ease-spring lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-5">
            <button onClick={() => handleNavigate("/app/dashboard")} className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              {!collapsed && (
                <span className="font-display text-lg font-bold tracking-tight text-white whitespace-nowrap">VEXA</span>
              )}
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:text-white lg:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin">
            <div className="space-y-5">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  {!collapsed && (
                    <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">{section.label}</p>
                  )}
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = path === item.path || path.startsWith(item.path + "/");
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => handleNavigate(item.path)}
                          title={collapsed ? item.label : undefined}
                          className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "text-white"
                              : "text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-active"
                              className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.08]"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          {isActive && (
                            <motion.div
                              layoutId="sidebar-active-bar"
                              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary-400"
                              transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                          )}
                          <Icon className={`relative h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary-400" : "text-neutral-500 group-hover:text-neutral-300"}`} />
                          {!collapsed && <span className="relative whitespace-nowrap">{item.label}</span>}
                          {item.badge && notificationCount > 0 && (
                            <span className={`relative ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-error-500/20 px-1.5 text-xs font-semibold text-error-400 ${collapsed ? "absolute -right-0.5 -top-0.5 h-4 min-w-4" : ""}`}>
                              {collapsed ? "" : notificationCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* AI Assistant button at bottom */}
          <div className="p-3">
            <button
              onClick={() => handleNavigate("/app/ai")}
              title={collapsed ? "VEXA AI" : undefined}
              className="flex w-full items-center gap-3 rounded-xl border border-primary-500/20 bg-primary-500/[0.04] px-3 py-3 text-sm font-medium text-primary-300 transition hover:bg-primary-500/10 hover:border-primary-500/30"
            >
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/15">
                <Sparkles className="h-4 w-4" />
                <span className="absolute inset-0 rounded-lg bg-primary-500/10 animate-ping opacity-50" style={{ animationDuration: "3s" }} />
              </div>
              {!collapsed && (
                <div className="text-left">
                  <div className="font-semibold text-white">VEXA AI</div>
                  <div className="text-xs text-neutral-500">Ask your CFO</div>
                </div>
              )}
            </button>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden items-center justify-center border-t border-white/[0.04] py-3 text-neutral-500 transition hover:text-white lg:flex"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </aside>
    </>
  );
}
