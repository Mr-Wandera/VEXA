import { useState, useEffect, useRef } from "react";
import { Menu, Bell, Search, Plus, X } from "lucide-react";
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
  { label: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard, category: "Pages" },
  { label: "Sales", path: "/app/sales", icon: ShoppingCart, category: "Pages" },
  { label: "Inventory", path: "/app/inventory", icon: Package, category: "Pages" },
  { label: "Expenses", path: "/app/expenses", icon: Receipt, category: "Pages" },
  { label: "Invoices", path: "/app/invoices", icon: FileText, category: "Pages" },
  { label: "Customers", path: "/app/customers", icon: Users, category: "Pages" },
  { label: "Suppliers", path: "/app/suppliers", icon: Truck, category: "Pages" },
  { label: "Partners", path: "/app/partners", icon: Handshake, category: "Pages" },
  { label: "Reports", path: "/app/reports", icon: BarChart3, category: "Pages" },
  { label: "Timeline", path: "/app/timeline", icon: Clock, category: "Pages" },
  { label: "Notifications", path: "/app/notifications", icon: BellIcon, category: "Pages" },
  { label: "Settings", path: "/app/settings", icon: Settings, category: "Pages" },
  { label: "VEXA AI Assistant", path: "/app/ai", icon: Sparkles, category: "AI" },
];

export default function Header({ onMenuClick, onQuickAdd, notificationCount, businessName }: HeaderProps) {
  const { navigate } = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Focus input when search opens
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
      <header className="sticky top-0 z-20 border-b border-neutral-800/60 bg-neutral-950/70 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800/50 hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-neutral-500">Welcome back to</p>
              <p className="font-display text-sm font-semibold text-white">{businessName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-neutral-400 transition hover:text-white md:flex"
            >
              <Search className="h-4 w-4" />
              <span className="hidden text-sm lg:inline">Search...</span>
              <kbd className="hidden rounded border border-neutral-800 bg-neutral-950 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 lg:block">
                ⌘K
              </kbd>
            </button>

            {/* Mobile search icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-2.5 text-neutral-400 transition hover:text-white md:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate("/app/notifications")}
              className="relative rounded-xl border border-neutral-800 bg-neutral-900/50 p-2.5 text-neutral-400 transition hover:text-white"
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
              className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-500"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Add</span>
            </button>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
          <div
            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
              <Search className="h-4 w-4 text-neutral-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search pages and features..."
                className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-neutral-500 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-sm text-neutral-500">
                  No results found for "{query}"
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
                        idx === selectedIndex
                          ? "bg-neutral-800/60 text-white"
                          : "text-neutral-400 hover:bg-neutral-800/30 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      <span className="text-[10px] uppercase text-neutral-600">{item.category}</span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t border-neutral-800 px-4 py-2.5 text-[10px] text-neutral-500">
              <span className="flex items-center gap-3">
                <span><kbd className="rounded border border-neutral-800 bg-neutral-950 px-1 font-mono">↑↓</kbd> Navigate</span>
                <span><kbd className="rounded border border-neutral-800 bg-neutral-950 px-1 font-mono">↵</kbd> Select</span>
                <span><kbd className="rounded border border-neutral-800 bg-neutral-950 px-1 font-mono">Esc</kbd> Close</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
