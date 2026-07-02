import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Bell, Search, Plus, X, Command, Sparkles, ArrowRight } from "lucide-react";
import { useRouter } from "../lib/router";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, ShoppingCart, Package, Receipt, FileText,
  Users, Truck, Handshake, ChartBar as BarChart3, Bell as BellIcon,
  Clock, Settings,
} from "lucide-react";
import { overlayVariants, EASE, DURATION, SPRING } from "../lib/motion";

interface HeaderProps {
  onMenuClick: () => void;
  onQuickAdd: () => void;
  notificationCount: number;
  businessName: string;
}

interface SearchItem {
  label: string;
  path: string;
  icon: LucideIcon;
  category: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard, category: "Overview" },
  { label: "Timeline", path: "/app/timeline", icon: Clock, category: "Overview" },
  { label: "Notifications", path: "/app/notifications", icon: BellIcon, category: "Overview" },
  { label: "Sales", path: "/app/sales", icon: ShoppingCart, category: "Operations" },
  { label: "Inventory", path: "/app/inventory", icon: Package, category: "Operations" },
  { label: "Expenses", path: "/app/expenses", icon: Receipt, category: "Operations" },
  { label: "Invoices", path: "/app/invoices", icon: FileText, category: "Operations" },
  { label: "Customers", path: "/app/customers", icon: Users, category: "Network" },
  { label: "Suppliers", path: "/app/suppliers", icon: Truck, category: "Network" },
  { label: "Partners", path: "/app/partners", icon: Handshake, category: "Network" },
  { label: "Reports", path: "/app/reports", icon: BarChart3, category: "Insights" },
  { label: "Settings", path: "/app/settings", icon: Settings, category: "Insights" },
  { label: "VEXA AI Assistant", path: "/app/ai", icon: Sparkles, category: "AI" },
];

export default function Header({ onMenuClick, onQuickAdd, notificationCount, businessName }: HeaderProps) {
  const { navigate } = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape" && searchOpen) setSearchOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [searchOpen]);

  const filteredItems = query
    ? SEARCH_ITEMS.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    : SEARCH_ITEMS;

  const handleSelect = (item: SearchItem) => {
    navigate(item.path);
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-white/[0.04] bg-neutral-950/50 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left: mobile menu + business name */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="rounded-xl p-2 text-neutral-400 transition hover:bg-white/[0.04] hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: DURATION.normal, ease: EASE.spring }}
              className="hidden sm:block"
            >
              <p className="text-xs text-neutral-500">Welcome back to</p>
              <p className="font-display text-sm font-semibold text-white">{businessName}</p>
            </motion.div>
          </div>

          {/* Right: search, notifications, quick add */}
          <div className="flex items-center gap-2">
            {/* Search trigger — desktop with focus glow */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSearchOpen(true)}
              className="group hidden items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-neutral-400 transition hover:border-primary-500/30 hover:bg-white/[0.04] hover:text-white hover:shadow-lg hover:shadow-primary-500/5 md:flex"
            >
              <Search className="h-4 w-4 transition group-hover:text-primary-400" />
              <span className="hidden text-sm lg:inline">Search...</span>
              <kbd className="hidden items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 lg:flex">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </motion.button>

            {/* Search trigger — mobile */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-neutral-400 transition hover:text-white md:hidden"
            >
              <Search className="h-4 w-4" />
            </motion.button>

            {/* Notifications with animated badge */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => navigate("/app/notifications")}
              className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-neutral-400 transition hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={SPRING.bouncy}
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white"
                >
                  {notificationCount}
                  <span className="absolute inset-0 rounded-full bg-error-500 animate-ping opacity-30" style={{ animationDuration: "2s" }} />
                </motion.span>
              )}
            </motion.button>

            {/* Quick Add with gradient hover */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onQuickAdd}
              className="group flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/15 transition hover:bg-primary-500 hover:shadow-primary-600/25"
            >
              <motion.span
                animate={{ rotate: [0, 90, 0] }}
                transition={{ duration: 0.4, ease: EASE.spring }}
                className="inline-flex"
              >
                <Plus className="h-4 w-4" />
              </motion.span>
              <span className="hidden sm:inline">Quick Add</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Command Palette — premium search experience */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setSearchOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={SPRING.soft}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/95 shadow-2xl backdrop-blur-2xl"
            >
              {/* Search input with focus glow */}
              <div className="relative flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
                <motion.div
                  animate={{ scale: searchOpen ? 1 : 0.8 }}
                  transition={SPRING.snappy}
                >
                  <Search className="h-4 w-4 text-primary-400" />
                </motion.div>
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search pages, features, or ask VEXA AI..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
                />
                <button onClick={() => setSearchOpen(false)} className="rounded-lg p-1 text-neutral-500 transition hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Results with staggered entrance */}
              <div className="max-h-80 overflow-y-auto p-2 smooth-scroll">
                {filteredItems.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center text-sm text-neutral-500"
                  >
                    No results for "{query}"
                  </motion.div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item, idx) => {
                      const Icon = item.icon;
                      const isSelected = idx === selectedIndex;
                      return (
                        <motion.button
                          key={item.path}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ delay: idx * 0.02, duration: DURATION.fast, ease: EASE.spring }}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                            isSelected ? "bg-white/[0.06] text-white" : "text-neutral-400 hover:bg-white/[0.03] hover:text-white"
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 transition ${isSelected ? "text-primary-400 scale-110" : ""}`} />
                          <span className="flex-1 text-sm font-medium">{item.label}</span>
                          {isSelected && (
                            <motion.span
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="text-neutral-500"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </motion.span>
                          )}
                          <span className="text-[10px] uppercase tracking-wider text-neutral-600">{item.category}</span>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.06] px-4 py-2.5">
                <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                  <span className="flex items-center gap-1"><kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1 font-mono">↑↓</kbd> Navigate</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1 font-mono">↵</kbd> Select</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border border-white/[0.08] bg-white/[0.03] px-1 font-mono">Esc</kbd> Close</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
