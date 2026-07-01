import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Package, Plus, TriangleAlert as AlertTriangle, DollarSign, Boxes } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Product } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { useCurrency } from "../lib/useCurrency";

export default function InventoryPage() {
  const { show } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  // Form state
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [stock, setStock] = useState("");
  const [reorderLevel, setReorderLevel] = useState("10");
  const [unit, setUnit] = useState("pcs");
  const [submitting, setSubmitting] = useState(false);
  const currency = useCurrency();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const p = await apiClient.getProducts();
      setProducts(p);
    } catch (err) {
      console.error(err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (!name || !sku || !price || Number(price) <= 0) {
      show("Please fill in all required fields with valid values.", "error");
      setSubmitting(false);
      return;
    }
    try {
      const product = await apiClient.addProduct({
        name, sku, category,
        price: Number(price),
        cost: Number(cost),
        stock: Number(stock),
        reorderLevel: Number(reorderLevel),
        unit,
      });
      setProducts((prev) => [product, ...prev]);
      setName(""); setSku(""); setCategory(""); setPrice(""); setCost(""); setStock(""); setReorderLevel("10");
      setShowAdd(false);
      show("Product created successfully", "success");
    } catch (err) {
      console.error(err);
      show("Failed to create. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === "low") return p.stock > 0 && p.stock <= p.reorderLevel;
    if (filter === "out") return p.stock === 0;
    return true;
  });

  const totalValue = products.reduce((sum, p) => sum + p.stock * p.cost, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.reorderLevel).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded-xl shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        subtitle="Manage products and track stock levels."
        action={{ label: "Add Product", icon: Plus, onClick: () => setShowAdd(true) }}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Products" value={products.length} icon={Package} accent="primary" />
        <StatCard title="Inventory Value" value={totalValue} prefix={`${currency} `} icon={DollarSign} accent="secondary" />
        <StatCard title="Low Stock" value={lowStockCount} icon={AlertTriangle} accent="warning" />
        <StatCard title="Out of Stock" value={outOfStockCount} icon={Boxes} accent="error" />
      </div>

      {/* Products grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
      >
        <div className="flex flex-col gap-4 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-base font-semibold text-white">Products</h3>
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
            {(["all", "low", "out"] as const).map((opt) => (
              <button key={opt} onClick={() => setFilter(opt)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === opt ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"}`}>
                {opt === "all" ? "All" : opt === "low" ? "Low Stock" : "Out of Stock"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-2xl bg-white/[0.02] p-4">
                <Package className="h-8 w-8 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-400">No products found.</p>
            </div>
          ) : (
            filteredProducts.map((product, i) => {
              const isLow = product.stock > 0 && product.stock <= product.reorderLevel;
              const isOut = product.stock === 0;
              const margin = product.price > 0 ? Math.round(((product.price - product.cost) / product.price) * 100) : 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 transition hover:border-neutral-700"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display text-sm font-semibold text-white">{product.name}</h4>
                      <p className="mt-0.5 font-mono text-[10px] text-neutral-500">{product.sku} · {product.category}</p>
                    </div>
                    <div className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${
                      isOut ? "bg-error-500/10 text-error-400" : isLow ? "bg-warning-500/10 text-warning-400" : "bg-success-500/10 text-success-400"
                    }`}>
                      {isOut ? "OUT" : isLow ? "LOW" : "OK"}
                    </div>
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    <div>
                      <span className="font-mono text-lg font-semibold text-white">{currency} {product.price.toLocaleString()}</span>
                      <span className="ml-1 text-xs text-neutral-500">/{product.unit}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-neutral-400">{product.stock} {product.unit} in stock</p>
                      <p className="text-[10px] text-neutral-500">{margin}% margin</p>
                    </div>
                  </div>

                  {/* Stock bar */}
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className={`h-full rounded-full transition-all ${isOut ? "bg-error-500" : isLow ? "bg-warning-500" : "bg-success-500"}`}
                      style={{ width: `${Math.min(100, (product.stock / (product.reorderLevel * 3 || 100)) * 100)}%` }}
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Add Product Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Product">
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product Name</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Premium Hoodie" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">SKU</label>
              <input required type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="HD-001" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Category</label>
            <input required type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Apparel, Services, etc." className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Selling Price ({currency})</label>
              <input required type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="2500" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Cost Price ({currency})</label>
              <input required type="number" min="0" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="1200" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Stock</label>
              <input required type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="45" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Reorder At</label>
              <input required type="number" min="0" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} placeholder="15" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
                <option value="pcs">pcs</option>
                <option value="kg">kg</option>
                <option value="hr">hr</option>
                <option value="mo">mo</option>
                <option value="pack">pack</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
            <button type="button" onClick={() => setShowAdd(false)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-press rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-500 transition disabled:opacity-50">
              {submitting ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
