import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Bell, Search, Plus, X, Command } from "lucide-react";
import { useRouter } from "../lib/router";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, ShoppingCart, Package, Receipt, FileText,
  Users, Truck, Handshake, ChartBar as BarChart3, Bell as BellIcon,
  Clock, Settings, Sparkles,
} from "lucide-react";

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
      setTimeout(() => inputRef.current?.focus(), 50);
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
            <div className="hidden sm:block">
              <p className="text-xs text-neutral-500">Welcome back to</p>
              <p className="font-display text-sm font-semibold text-white">{businessName}</p>
            </div>
          </div>

          {/* Right: search, notifications, quick add */}
          <div className="flex items-center gap-2">
            {/* Search trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-neutral-400 transition hover:bg-white/[0.04] hover:text-white"
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-sm lg:inline">Search...</span>
              <kbd className="hidden items-center gap-0.5 rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 lg:flex">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            {/* Mobile search icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-neutral-400 transition hover:text-white md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate("/app/notifications")}
              className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-neutral-400 transition hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[10px] font-bold text-white">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Quick Add */}
            <button
              onClick={onQuickAdd}
              className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/15 transition hover:bg-primary-500 btn-press"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900/95 shadow-2xl backdrop-blur-2xl"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
                <Search className="h-4 w-4 text-neutral-500" />
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

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredItems.length === 0 ? (
                  <div className="py-8 text-center text-sm text-neutral-500">
                    No results for "{query}"
                  </div>
                ) : (
                  filteredItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          idx === selectedIndex ? "bg-white/[0.06] text-white" : "text-neutral-400 hover:bg-white/[0.03] hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-600">{item.category}</span>
                      </button>
                    );
                  })
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
