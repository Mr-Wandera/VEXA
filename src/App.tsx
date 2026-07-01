import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RouterProvider, useRouter, matchRoute } from "./lib/router";
import { ToastProvider, useToast } from "./components/ui/Toast";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PageTransition from "./components/ui/PageTransition";
import AddTransactionModal from "./components/AddTransactionModal";
import VexaChatBot from "./components/VexaChatBot";
import NotFound from "./components/ui/NotFound";
import { apiClient } from "./lib/apiClient";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const SalesPage = lazy(() => import("./pages/SalesPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const ExpensesPage = lazy(() => import("./pages/ExpensesPage"));
const InvoiceManager = lazy(() => import("./components/InvoiceManager"));
const CustomersPage = lazy(() => import("./pages/CustomersPage"));
const SuppliersPage = lazy(() => import("./pages/SuppliersPage"));
const PartnersPage = lazy(() => import("./pages/PartnersPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AIPage = lazy(() => import("./pages/AIPage"));

function PageLoader() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 rounded-xl shimmer" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl shimmer" />
        ))}
      </div>
      <div className="h-64 rounded-2xl shimmer" />
    </div>
  );
}

function AppContent() {
  const { path } = useRouter();
  const { show } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem("vexa-sidebar-collapsed") === "true";
    return false;
  });
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [businessName, setBusinessName] = useState("Your Business");
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        const [notifs, { profile }] = await Promise.all([
          apiClient.getNotifications(),
          apiClient.getMetrics(),
        ]);
        setNotificationCount(notifs.filter((n) => !n.read).length);
        setBusinessName(profile.name);
      } catch (err) {
        console.error("Failed to load header data:", err);
      }
    };
    if (path.startsWith("/app")) loadHeaderData();
  }, [path.startsWith("/app"), refreshKey]);

  const handleSidebarCollapse = useCallback((collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const handleAddTransaction = useCallback(
    async (tx: {
      merchant: string;
      category: string;
      amount: number;
      type: 'income' | 'expense';
      date: string;
      status: 'cleared' | 'pending';
    }) => {
      await apiClient.addTransaction(tx);
      triggerRefresh();
      show("Transaction recorded successfully", "success");
    },
    [triggerRefresh, show]
  );

  const isLanding = path === "/" || path === "";
  const isAuth = path === "/auth";

  if (isLanding) return <LandingPage />;
  if (isAuth) return <AuthPage onAuthed={triggerRefresh} />;

  if (path.startsWith("/app")) {
    const mainPadding = sidebarCollapsed ? "lg:pl-[72px]" : "lg:pl-64";

    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200">
        {/* Ambient background */}
        <div className="grid-bg pointer-events-none fixed inset-0 opacity-30" />
        <div className="ambient-orb bg-primary-500/10 h-96 w-96 -left-20 top-0 float-anim" />
        <div className="ambient-orb bg-secondary-500/10 h-96 w-96 right-0 top-1/3 float-anim" style={{ animationDelay: '6s' }} />

        <div className="relative">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} notificationCount={notificationCount} onCollapseChange={handleSidebarCollapse} />
          <div className={`transition-all duration-300 ease-spring ${mainPadding}`}>
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onQuickAdd={() => setQuickAddOpen(true)}
              notificationCount={notificationCount}
              businessName={businessName}
            />
            <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
              <AnimatePresence mode="wait">
                <PageTransition key={path}>
                  <Suspense fallback={<PageLoader />}>
                    {renderAppPage(path, { setChatOpen, setChatQuery, triggerRefresh, refreshKey })}
                  </Suspense>
                </PageTransition>
              </AnimatePresence>
            </main>
          </div>
        </div>

        <AddTransactionModal
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
          onAdd={handleAddTransaction}
        />

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg border-l border-white/[0.06] bg-neutral-950/90 shadow-2xl backdrop-blur-2xl"
            >
              <VexaChatBot initialQuery={chatQuery} onClose={() => setChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <LandingPage />;
}

function renderAppPage(
  path: string,
  ctx: { setChatOpen: (v: boolean) => void; setChatQuery: (v: string) => void; triggerRefresh: () => void; refreshKey: number }
) {
  if (matchRoute(path, "/app/dashboard")) return <DashboardPage onAskAI={(q) => { ctx.setChatQuery(q); ctx.setChatOpen(true); }} refreshKey={ctx.refreshKey} />;
  if (matchRoute(path, "/app/sales")) return <SalesPage />;
  if (matchRoute(path, "/app/inventory")) return <InventoryPage />;
  if (matchRoute(path, "/app/expenses")) return <ExpensesPage />;
  if (matchRoute(path, "/app/invoices")) return <InvoiceManager />;
  if (matchRoute(path, "/app/customers")) return <CustomersPage />;
  if (matchRoute(path, "/app/suppliers")) return <SuppliersPage />;
  if (matchRoute(path, "/app/partners")) return <PartnersPage />;
  if (matchRoute(path, "/app/reports")) return <ReportsPage />;
  if (matchRoute(path, "/app/notifications")) return <NotificationsPage />;
  if (matchRoute(path, "/app/timeline")) return <TimelinePage />;
  if (matchRoute(path, "/app/settings")) return <SettingsPage />;
  if (matchRoute(path, "/app/ai")) return <AIPage />;
  return <NotFound />;
}

export default function App() {
  return (
    <RouterProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </RouterProvider>
  );
}
