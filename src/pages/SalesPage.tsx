import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingCart, Plus, X, TrendingUp, DollarSign, Package, Sparkles } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Sale, Product } from "../types";
import StatCard from "../components/ui/StatCard";

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "refunded">("all");

  // Form state
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Sale["paymentMethod"]>("mpesa");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, p] = await Promise.all([apiClient.getSales(), apiClient.getProducts()]);
      setSales(s);
      setProducts(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProduct);
    if (!product || !quantity) return;

    setSubmitting(true);
    try {
      const qty = Number(quantity);
      const sale = await apiClient.addSale({
        date: new Date().toISOString().split("T")[0],
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice: product.price,
        totalAmount: qty * product.price,
        customerName: customerName || "Walk-in Customer",
        paymentMethod,
        status: "completed",
      });
      setSales((prev) => [sale, ...prev]);
      setSelectedProduct("");
      setQuantity("1");
      setCustomerName("");
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSales = sales.filter((s) => filter === "all" || s.status === filter);
  const totalRevenue = sales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.totalAmount, 0);
  const todaySales = sales.filter((s) => s.date === new Date().toISOString().split("T")[0]);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded-lg shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Sales</h1>
          <p className="text-sm text-neutral-400">Record sales and track revenue.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Record Sale</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Revenue" value={totalRevenue} prefix="KSh " icon={DollarSign} accent="primary" />
        <StatCard title="Today's Sales" value={todayRevenue} prefix="KSh " icon={TrendingUp} accent="secondary" />
        <StatCard title="Total Transactions" value={sales.length} icon={ShoppingCart} accent="accent" />
      </div>

      {/* Sales table */}
      <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6 backdrop-blur-xl">
        <div className="flex flex-col gap-4 border-b border-neutral-800/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold text-white">Sales History</h3>
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 p-1">
            {(["all", "completed", "pending", "refunded"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === opt ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filteredSales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-2xl bg-neutral-900/50 p-4">
                <ShoppingCart className="h-8 w-8 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-400">No sales recorded yet.</p>
              <button onClick={() => setShowAdd(true)} className="mt-3 text-sm font-medium text-primary-400 hover:text-primary-300">
                Record your first sale →
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Qty</th>
                  <th className="py-3 px-4 text-right">Unit Price</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="group hover:bg-neutral-950/20 transition">
                    <td className="py-3 px-4 font-mono text-xs text-neutral-400">{sale.date}</td>
                    <td className="py-3 px-4 text-sm font-medium text-white">{sale.productName}</td>
                    <td className="py-3 px-4 text-sm text-neutral-300">{sale.customerName}</td>
                    <td className="py-3 px-4 text-center font-mono text-sm text-neutral-300">{sale.quantity}</td>
                    <td className="py-3 px-4 text-right font-mono text-sm text-neutral-300">KSh {sale.unitPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-white">KSh {sale.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-300">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          sale.status === "completed"
                            ? "bg-success-500/10 text-success-400"
                            : sale.status === "pending"
                              ? "bg-warning-500/10 text-warning-400"
                              : "bg-error-500/10 text-error-400"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Sale Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <h3 className="font-display text-base font-semibold text-white">Record New Sale</h3>
                <button onClick={() => setShowAdd(false)} className="rounded-lg border border-neutral-800 bg-neutral-950 p-1.5 text-neutral-400 hover:text-white transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleAddSale} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product</label>
                  <select
                    required
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — KSh {p.price.toLocaleString()} ({p.stock} in stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Quantity</label>
                    <input
                      required
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1.5">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as Sale["paymentMethod"])}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none"
                    >
                      <option value="mpesa">M-Pesa</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Customer Name (optional)</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-primary-500 focus:outline-none"
                  />
                </div>

                {selectedProduct && quantity && (
                  <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">Total Amount</span>
                      <span className="font-mono text-lg font-semibold text-primary-400">
                        KSh {(Number(quantity) * (products.find((p) => p.id === selectedProduct)?.price || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 border-t border-neutral-800 pt-5">
                  <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">
                    <Sparkles className="h-3.5 w-3.5" />
                    {submitting ? "Recording..." : "Record Sale"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
