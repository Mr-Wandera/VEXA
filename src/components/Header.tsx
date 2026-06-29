import { Menu, Bell, Search, Plus } from "lucide-react";
import { useRouter } from "../lib/router";

interface HeaderProps {
  onMenuClick: () => void;
  onQuickAdd: () => void;
  notificationCount: number;
  businessName: string;
}

export default function Header({ onMenuClick, onQuickAdd, notificationCount, businessName }: HeaderProps) {
  const { navigate } = useRouter();

  return (
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
          <div className="hidden items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/50 px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-neutral-500" />
            <input
              placeholder="Search..."
              className="w-40 bg-transparent text-sm text-neutral-300 placeholder-neutral-600 focus:outline-none lg:w-56"
            />
            <kbd className="hidden rounded border border-neutral-800 bg-neutral-950 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 lg:block">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <button
            onClick={() => navigate("/app/notifications")}
            className="relative rounded-xl border border-neutral-800 bg-neutral-900/50 p-2.5 text-neutral-400 transition hover:text-white"
          >
            <Bell className="h-4.5 w-4.5" />
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
  );
}
