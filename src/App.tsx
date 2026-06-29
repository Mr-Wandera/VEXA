import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Menu, X } from "lucide-react";
import { RouterProvider, useRouter, matchRoute } from "./lib/router";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import PageTransition from "./components/ui/PageTransition";
import AddTransactionModal from "./components/AddTransactionModal";
import VexaChatBot from "./components/VexaChatBot";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import SalesPage from "./pages/SalesPage";
import InventoryPage from "./pages/InventoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import InvoiceManager from "./components/InvoiceManager";
import CustomersPage from "./pages/CustomersPage";
import SuppliersPage from "./pages/SuppliersPage";
import PartnersPage from "./pages/PartnersPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import TimelinePage from "./pages/TimelinePage";
import SettingsPage from "./pages/SettingsPage";
import AIPage from "./pages/AIPage";

function AppContent() {
  const { path } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(3);
  const [businessName, setBusinessName] = useState("Aesthetic Lab LLC");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth state on mount
  useEffect(() => {
    const authed = sessionStorage.getItem("vexa_auth") === "true";
    if (authed) setIsAuthenticated(true);
  }, []);

  // Determine if we're in the app (authenticated) or on a public page
  const isAppRoute = path.startsWith("/app");
  const isLanding = path === "/" || path === "";
  const isAuth = path === "/auth";

  // Public routes (landing, auth)
  if (isLanding) return <LandingPage />;
  if (isAuth) return <AuthPage onAuthed={() => setIsAuthenticated(true)} />;

  // App routes — require auth (but we allow viewing in dev without auth for demo)
  if (isAppRoute) {
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
                  {renderAppPage(path, {
                    setChatOpen,
                    setChatQuery,
                  })}
                </PageTransition>
              </AnimatePresence>
            </main>
          </div>
        </div>

        {/* Quick Add Modal */}
        <AddTransactionModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} onAdd={async () => {}} />

        {/* AI Chat slide-over */}
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

  // Fallback
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

// Wrapper to provide InvoiceManager with data

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
