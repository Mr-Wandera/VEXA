import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Plus, TrendingUp, DollarSign, Sparkles, Trash2, RotateCcw, Check } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Sale, Product } from "../types";
import StatCard from "../components/ui/StatCard";
import PageHeader from "../components/ui/PageHeader";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { useCurrency } from "../lib/useCurrency";

export default function SalesPage() {
  const { show } = useToast();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "completed" | "pending" | "refunded">("all");

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<Sale["paymentMethod"]>("mpesa");
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Sale | null>(null);
  const currency = useCurrency();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setError(false);
    try {
      const [s, p] = await Promise.all([apiClient.getSales(), apiClient.getProducts()]);
      setSales(s);
      setProducts(p);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProduct);
    if (!product || !quantity || Number(quantity) < 1) {
      show("Please select a product and quantity.", "error");
      return;
    }
    const qty = Number(quantity);
    if (product.stock < 999 && qty > product.stock) {
      show(`Insufficient stock. Only ${product.stock} ${product.unit} available.`, "error");
      return;
    }

    setSubmitting(true);
    try {
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
      // Refetch products to get server-decremented stock
      setProducts(await apiClient.getProducts());
      setSelectedProduct("");
      setQuantity("1");
      setCustomerName("");
      setShowAdd(false);
      show(`Sale recorded: ${currency} ${(qty * product.price).toLocaleString()}`, "success");
    } catch (err) {
      console.error(err);
      show("Failed to record sale. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: Sale["status"]) => {
    try {
      const updated = await apiClient.updateSaleStatus(id, status);
      setSales((prev) => prev.map((s) => (s.id === id ? updated : s)));
      show(`Sale marked as ${status}`, "success");
    } catch (err) {
      console.error(err);
      show("Failed to update sale status.", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await apiClient.deleteSale(confirmDelete.id);
      setSales((prev) => prev.filter((s) => s.id !== confirmDelete.id));
      show("Sale deleted", "success");
    } catch (err) {
      console.error(err);
      show("Failed to delete sale.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const filteredSales = sales.filter((s) => filter === "all" || s.status === filter);
  const totalRevenue = sales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.totalAmount, 0);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRevenue = sales.filter((s) => s.date === todayStr).reduce((sum, s) => sum + s.totalAmount, 0);

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorState message="Failed to load sales data." onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales"
        subtitle="Record sales and track revenue."
        action={{ label: "Record Sale", icon: Plus, onClick: () => setShowAdd(true) }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard title="Total Revenue" value={totalRevenue} prefix={`${currency} `} icon={DollarSign} accent="primary" />
        <StatCard title="Today's Sales" value={todayRevenue} prefix={`${currency} `} icon={TrendingUp} accent="secondary" />
        <StatCard title="Total Transactions" value={sales.length} icon={ShoppingCart} accent="accent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="card-premium rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold text-white">Sales History</h3>
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1 overflow-x-auto">
            {(["all", "completed", "pending", "refunded"] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition whitespace-nowrap ${
                  filter === opt ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 rounded-2xl bg-white/[0.02] p-4">
              <ShoppingCart className="h-8 w-8 text-neutral-600" />
            </div>
            <p className="text-sm text-neutral-400">No sales recorded yet.</p>
            <button onClick={() => setShowAdd(true)} className="mt-3 text-sm font-medium text-primary-400 hover:text-primary-300">
              Record your first sale →
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center">Payment</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="group hover:bg-white/[0.015] transition">
                      <td className="py-3 px-4 font-mono text-xs text-neutral-400">{sale.date}</td>
                      <td className="py-3 px-4 text-sm font-medium text-white">{sale.productName}</td>
                      <td className="py-3 px-4 text-sm text-neutral-300">{sale.customerName}</td>
                      <td className="py-3 px-4 text-center font-mono text-sm text-neutral-300">{sale.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-sm text-neutral-300">{currency} {sale.unitPrice.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono text-sm font-semibold text-white">{currency} {sale.totalAmount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-300">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          sale.status === "completed" ? "bg-success-500/10 text-success-400"
                            : sale.status === "pending" ? "bg-warning-500/10 text-warning-400"
                            : "bg-error-500/10 text-error-400"
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition">
                          {sale.status === "completed" && (
                            <button onClick={() => handleStatusChange(sale.id, "refunded")} className="rounded-lg p-1 text-neutral-500 transition hover:bg-warning-500/10 hover:text-warning-400" aria-label="Mark as refunded" title="Mark as refunded">
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {sale.status === "pending" && (
                            <button onClick={() => handleStatusChange(sale.id, "completed")} className="rounded-lg p-1 text-neutral-500 transition hover:bg-success-500/10 hover:text-success-400" aria-label="Mark as completed" title="Mark as completed">
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button onClick={() => setConfirmDelete(sale)} className="rounded-lg p-1 text-neutral-500 transition hover:bg-error-500/10 hover:text-error-400" aria-label="Delete sale">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mt-4 space-y-3 md:hidden">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="rounded-xl border border-white/[0.04] bg-white/[0.015] p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{sale.productName}</p>
                      <p className="text-xs text-neutral-500">{sale.customerName} · {sale.date}</p>
                    </div>
                    <p className="font-mono text-sm font-semibold text-white">{currency} {sale.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-300">{sale.paymentMethod}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      sale.status === "completed" ? "bg-success-500/10 text-success-400"
                        : sale.status === "pending" ? "bg-warning-500/10 text-warning-400"
                        : "bg-error-500/10 text-error-400"
                    }`}>{sale.status}</span>
                    <span className="text-neutral-500">{sale.quantity}x @ {currency} {sale.unitPrice.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Record New Sale">
        <form onSubmit={handleAddSale} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product</label>
            <select
              required
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {currency} {p.price.toLocaleString()} ({p.stock} in stock)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Quantity</label>
              <input required type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as Sale["paymentMethod"])}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
                <option value="mpesa">M-Pesa</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="credit">Credit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Customer Name (optional)</label>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-neutral-600 focus:border-primary-500 focus:outline-none" />
          </div>

          {selectedProduct && quantity && Number(quantity) > 0 && (
            <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">Total Amount</span>
                <span className="font-mono text-lg font-semibold text-primary-400">
                  {currency} {(Number(quantity) * (products.find((p) => p.id === selectedProduct)?.price || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button type="button" onClick={() => setShowAdd(false)}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="btn-press flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">
              <Sparkles className="h-3.5 w-3.5" />
              {submitting ? "Recording..." : "Record Sale"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Sale" maxWidth="max-w-md">
        <p className="text-sm text-neutral-300">
          Are you sure you want to delete this sale of <span className="font-semibold text-white">{confirmDelete?.productName}</span> ({currency} {confirmDelete?.totalAmount.toLocaleString()})?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
          <button type="button" onClick={handleDelete} className="btn-press rounded-xl bg-error-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-error-500 transition">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 rounded-xl shimmer" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
      </div>
    </div>
  );
}
