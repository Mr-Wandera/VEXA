import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Package, Plus, TriangleAlert as AlertTriangle, DollarSign, Boxes, Pencil, Trash2 } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Product } from "../types";
import StatCard from "../components/ui/StatCard";
import { useToast } from "../components/ui/Toast";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { useCurrency } from "../lib/useCurrency";

const EMPTY_FORM = {
  name: "", sku: "", category: "", price: "", cost: "", stock: "", reorderLevel: "10", unit: "pcs",
};

export default function InventoryPage() {
  const { show } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const currency = useCurrency();

  useEffect(() => { loadData(); }, []);

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

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setShowAdd(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: String(product.price),
      cost: String(product.cost),
      stock: String(product.stock),
      reorderLevel: String(product.reorderLevel),
      unit: product.unit,
    });
    setShowAdd(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku || !form.price || Number(form.price) <= 0) {
      show("Please fill in all required fields with valid values.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        price: Number(form.price),
        cost: Number(form.cost || 0),
        stock: Number(form.stock || 0),
        reorderLevel: Number(form.reorderLevel || 10),
        unit: form.unit,
      };
      if (editing) {
        const updated = await apiClient.updateProduct(editing.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
        show("Product updated successfully", "success");
      } else {
        const product = await apiClient.addProduct(payload);
        setProducts((prev) => [product, ...prev]);
        show("Product created successfully", "success");
      }
      setForm(EMPTY_FORM);
      setEditing(null);
      setShowAdd(false);
    } catch (err) {
      console.error(err);
      show("Failed to save. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await apiClient.deleteProduct(confirmDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== confirmDelete.id));
      show("Product deleted", "success");
    } catch (err) {
      console.error(err);
      show("Failed to delete product.", "error");
    } finally {
      setConfirmDelete(null);
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
        action={{ label: "Add Product", icon: Plus, onClick: openAdd }}
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
        className="card-premium rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 backdrop-blur-xl"
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
                    <div className="min-w-0">
                      <h4 className="font-display text-sm font-semibold text-white truncate">{product.name}</h4>
                      <p className="mt-0.5 font-mono text-[10px] text-neutral-500">{product.sku} · {product.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(product)}
                        className="rounded-lg p-1.5 text-neutral-500 opacity-0 transition hover:bg-white/[0.04] hover:text-white group-hover:opacity-100"
                        aria-label="Edit product"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(product)}
                        className="rounded-lg p-1.5 text-neutral-500 opacity-0 transition hover:bg-error-500/10 hover:text-error-400 group-hover:opacity-100"
                        aria-label="Delete product"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className={`mt-2 inline-flex rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                    isOut ? "bg-error-500/10 text-error-400" : isLow ? "bg-warning-500/10 text-warning-400" : "bg-success-500/10 text-success-400"
                  }`}>
                    {isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "IN STOCK"}
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

      {/* Add/Edit Product Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editing ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Product Name</label>
              <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premium Hoodie" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">SKU</label>
              <input required type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="HD-001" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Category</label>
            <input required type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Apparel, Services, etc." className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Selling Price ({currency})</label>
              <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="2500" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Cost Price ({currency})</label>
              <input required type="number" min="0" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} placeholder="1200" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Stock</label>
              <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="45" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Reorder At</label>
              <input required type="number" min="0" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} placeholder="15" className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white focus:border-primary-500 focus:outline-none">
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
              {submitting ? "Saving..." : editing ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Product" maxWidth="max-w-md">
        <p className="text-sm text-neutral-300">
          Are you sure you want to delete <span className="font-semibold text-white">{confirmDelete?.name}</span>?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
          <button type="button" onClick={handleDelete} className="btn-press rounded-xl bg-error-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-error-500 transition">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
