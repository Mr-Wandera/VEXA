import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { RouterProvider, useRouter, matchRoute } from "./lib/router";
import { ToastProvider } from "./components/ui/Toast";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PageTransition from "./components/ui/PageTransition";
import AddTransactionModal from "./components/AddTransactionModal";
import VexaChatBot from "./components/VexaChatBot";
import { apiClient } from "./lib/apiClient";

// Eager-load landing + auth (critical path), lazy-load the rest
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
      <div className="h-8 w-48 rounded-lg shimmer" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl shimmer" />
        ))}
      </div>
    </div>
  );
}

function AppContent() {
  const { path } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [businessName, setBusinessName] = useState("Your Business");

  // Fetch notification count and business name on mount
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
  }, [path.startsWith("/app")]);

  const isLanding = path === "/" || path === "";
  const isAuth = path === "/auth";

  if (isLanding) return <LandingPage />;
  if (isAuth) return <AuthPage onAuthed={() => {}} />;

  if (path.startsWith("/app")) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200">
        <div className="grid-bg pointer-events-none fixed inset-0 opacity-40" />
        <div className="relative">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} notificationCount={notificationCount} />
          <div className="lg:pl-64">
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
                    {renderAppPage(path, { setChatOpen, setChatQuery })}
                  </Suspense>
                </PageTransition>
              </AnimatePresence>
            </main>
          </div>
        </div>

        <AddTransactionModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} onAdd={async () => {}} />

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-neutral-950/90 border-l border-neutral-800 shadow-2xl backdrop-blur-2xl"
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
  ctx: { setChatOpen: (v: boolean) => void; setChatQuery: (v: string) => void }
) {
  if (matchRoute(path, "/app/dashboard")) return <DashboardPage onAskAI={(q) => { ctx.setChatQuery(q); ctx.setChatOpen(true); }} />;
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
  return <DashboardPage onAskAI={() => {}} />;
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
