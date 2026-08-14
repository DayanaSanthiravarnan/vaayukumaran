import { useEffect, useState } from "react";
import api from "../api/axios";
import ServerError from "../components/ServerError";

const STATUS_COLORS = {
  PENDING:   { color: "#d97706", bg: "#fffbeb" },
  CONFIRMED: { color: "#2563eb", bg: "#eff6ff" },
  SHIPPED:   { color: "#7c3aed", bg: "#f5f3ff" },
  DELIVERED: { color: "#059669", bg: "#ecfdf5" },
  CANCELLED: { color: "#dc2626", bg: "#fef2f2" },
};

export default function Admin() {
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [error, setError] = useState("");

  const [editPrices, setEditPrices] = useState({});
  const [uploading, setUploading] = useState(false);

  const uploadToCloudinary = async (file) => {
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "Vaayukumaaran");
      data.append("cloud_name", "obqajab8");
      const res = await fetch("https://api.cloudinary.com/v1_1/obqajab8/image/upload", { method: "POST", body: data });
      const json = await res.json();
      if (json.secure_url) setPf("imageUrl", json.secure_url);
      else flash("Upload failed", "error");
    } catch { flash("Upload error", "error"); }
    finally { setUploading(false); }
  };

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 3000);
  };

  const fetchAll = () => {
    api.get("/products?page=0&size=100").then((r) => setProducts(r.data.content))
      .catch((err) => { if (!err.response) setError("Cannot connect to server. Please make sure the backend is running."); });
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
    api.get("/admin/orders").then((r) => setOrders(r.data)).catch(() => {});
  };
  useEffect(() => { fetchAll(); }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category: productForm.categoryId ? { id: parseInt(productForm.categoryId) } : null,
      };
      await api.post("/products", payload);
      flash("Product created successfully!");
      setProductForm({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
      fetchAll();
    } catch (err) { flash(err.response?.data?.name || err.response?.data?.message || "Error creating product", "error"); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try { await api.delete(`/products/${id}`); fetchAll(); flash("Product deleted!"); }
    catch { flash("Error deleting product", "error"); }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/categories", categoryForm);
      flash("Category created!"); setCategoryForm({ name: "", description: "" }); fetchAll();
    } catch (err) { flash(err.response?.data?.message || "Error", "error"); }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try { await api.delete(`/categories/${id}`); fetchAll(); flash("Category deleted!"); }
    catch { flash("Error deleting category", "error"); }
  };

  const updateStatus = async (id, status) => {
    try { await api.put(`/admin/orders/${id}/status`, { status }); flash("Status updated!"); fetchAll(); }
    catch (err) { flash(err.response?.data?.message || "Error", "error"); }
  };

  const updatePrice = async (product, newPrice) => {
    try {
      await api.put(`/products/${product.id}`, {
        name: product.name,
        description: product.description,
        price: parseFloat(newPrice),
        stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category ? { id: product.category.id } : null,
      });
      flash(`${product.name} price updated!`);
      setEditPrices((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
      fetchAll();
    } catch { flash("Error updating price", "error"); }
  };

  const TABS = [
    { key: "products",   label: "Products",   count: products.length },
    { key: "categories", label: "Categories", count: categories.length },
    { key: "orders",     label: "Orders",     count: orders.length },
  ];

  const pf = productForm;
  const setPf = (k, v) => setProductForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div style={s.page}>
      <div style={s.container}>
        {/* Header */}
        <div style={s.pageHeader} className="admin-page-header">
          <div>
            <h2 style={s.title}>Admin Dashboard</h2>
            <p style={s.subtitle}>Manage your store inventory and orders</p>
          </div>
          <div style={s.statsRow} className="admin-stats">
            {[
              { label: "Products",   value: products.length,   color: "var(--primary)" },
              { label: "Categories", value: categories.length, color: "#7c3aed" },
              { label: "Orders",     value: orders.length,     color: "var(--success)" },
            ].map((stat) => (
              <div key={stat.label} style={s.statCard}>
                <span style={{ ...s.statNum, color: stat.color }}>{stat.value}</span>
                <span style={s.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {msg.text && (
          <div style={{ ...s.msgBox, ...(msg.type === "success" ? s.msgSuccess : s.msgError) }}>
            {msg.text}
          </div>
        )}
        {error && <ServerError message={error} />}

        {/* Tabs */}
        <div style={s.tabBar}>
          {TABS.map((t) => (
            <button
              key={t.key}
              style={{ ...s.tab, ...(tab === t.key ? s.activeTab : {}) }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span style={{ ...s.tabCount, ...(tab === t.key ? s.activeTabCount : {}) }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        {tab === "products" && (
          <div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Add New Product</h3>
              <form onSubmit={saveProduct}>
                <div style={s.formGrid} className="admin-form-grid">
                  <div style={s.field}>
                    <label style={s.label}>Product Name *</label>
                    <input style={s.input} placeholder="e.g. Wireless Earbuds" value={pf.name} onChange={(e) => setPf("name", e.target.value)} required />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Price (Rs.) *</label>
                    <input style={s.input} type="number" step="0.01" placeholder="0.00" value={pf.price} onChange={(e) => setPf("price", e.target.value)} required />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Stock</label>
                    <input style={s.input} type="number" placeholder="0" value={pf.stock} onChange={(e) => setPf("stock", e.target.value)} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Category</label>
                    <select style={s.input} value={pf.categoryId} onChange={(e) => setPf("categoryId", e.target.value)}>
                      <option value="">No Category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ ...s.field, gridColumn: "1/-1" }}>
                    <label style={s.label}>Product Image</label>
                    <div style={s.uploadWrap}>
                      <label style={{ ...s.uploadBtn, ...(uploading ? s.uploadBtnOff : {}) }}>
                        {uploading ? "⏳ Uploading..." : "📁 Choose Photo"}
                        <input type="file" accept="image/*" style={{ display: "none" }}
                          onChange={e => e.target.files[0] && uploadToCloudinary(e.target.files[0])}
                          disabled={uploading} />
                      </label>
                      {pf.imageUrl && (
                        <div style={s.previewWrap}>
                          <img src={pf.imageUrl} alt="preview" style={s.preview} />
                          <button type="button" style={s.removeImg} onClick={() => setPf("imageUrl", "")}>✕</button>
                        </div>
                      )}
                    </div>
                    <input style={{ ...s.input, marginTop: "8px", fontSize: "12px", color: "var(--gray-5)" }}
                      placeholder="Or paste image URL directly..."
                      value={pf.imageUrl} onChange={(e) => setPf("imageUrl", e.target.value)} />
                  </div>
                  <div style={{ ...s.field, gridColumn: "1/-1" }}>
                    <label style={s.label}>Description</label>
                    <input style={s.input} placeholder="Product description..." value={pf.description} onChange={(e) => setPf("description", e.target.value)} />
                  </div>
                </div>
                <button style={s.addBtn} type="submit">Add Product</button>
              </form>
            </div>

            <div style={s.card}>
              <h3 style={s.cardTitle}>All Products <span style={s.countBadge}>{products.length}</span></h3>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["ID", "Name", "Price", "Stock", "Category", ""].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} style={s.tr}>
                        <td style={s.td}><span style={s.idBadge}>#{p.id}</span></td>
                        <td style={{ ...s.td, fontWeight: "600" }}>{p.name}</td>
                        <td style={s.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                              style={{ ...s.input, width: "90px", padding: "5px 8px", fontSize: "13px" }}
                              type="number"
                              step="0.01"
                              value={editPrices[p.id] !== undefined ? editPrices[p.id] : p.price}
                              onChange={(e) => setEditPrices((prev) => ({ ...prev, [p.id]: e.target.value }))}
                            />
                            {editPrices[p.id] !== undefined && (
                              <button style={s.saveBtn} onClick={() => updatePrice(p, editPrices[p.id])}>Save</button>
                            )}
                          </div>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.stockBadge, background: p.stock > 0 ? "var(--success-light)" : "var(--danger-light)", color: p.stock > 0 ? "var(--success)" : "var(--danger)" }}>
                            {p.stock}
                          </span>
                        </td>
                        <td style={s.td}>{p.category?.name || <span style={{ color: "var(--gray-4)" }}>—</span>}</td>
                        <td style={s.td}>
                          <button style={s.delBtn} onClick={() => deleteProduct(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {tab === "categories" && (
          <div>
            <div style={s.card}>
              <h3 style={s.cardTitle}>Add New Category</h3>
              <form onSubmit={saveCategory} style={s.inlineForm} className="admin-inline-form">
                <div style={s.field}>
                  <label style={s.label}>Category Name *</label>
                  <input style={s.input} placeholder="e.g. Electronics" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Description</label>
                  <input style={s.input} placeholder="Optional description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
                </div>
                <button style={{ ...s.addBtn, alignSelf: "flex-end" }} type="submit">Add Category</button>
              </form>
            </div>

            <div style={s.card}>
              <h3 style={s.cardTitle}>All Categories <span style={s.countBadge}>{categories.length}</span></h3>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr>
                      {["ID", "Name", "Description", ""].map((h) => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.id} style={s.tr}>
                        <td style={s.td}><span style={s.idBadge}>#{c.id}</span></td>
                        <td style={{ ...s.td, fontWeight: "600" }}>{c.name}</td>
                        <td style={s.td}>{c.description || <span style={{ color: "var(--gray-4)" }}>—</span>}</td>
                        <td style={s.td}>
                          <button style={s.delBtn} onClick={() => deleteCategory(c.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === "orders" && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>All Orders <span style={s.countBadge}>{orders.length}</span></h3>
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Order", "Customer", "Total", "Address", "Status", "Update"].map((h) => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const sc = STATUS_COLORS[o.status] || { color: "#64748b", bg: "#f8fafc" };
                    return (
                      <tr key={o.id} style={s.tr}>
                        <td style={s.td}><span style={s.idBadge}>#{o.id}</span></td>
                        <td style={{ ...s.td, fontWeight: "600" }}>{o.user?.username}</td>
                        <td style={{ ...s.td, fontWeight: "700", color: "var(--primary)" }}>Rs. {o.totalAmount.toLocaleString()}</td>
                        <td style={{ ...s.td, maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {o.shippingAddress}
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.statusBadge, color: sc.color, background: sc.bg }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={s.td}>
                          <select style={s.statusSelect} value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                            {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map((st) => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { background: "var(--gray-1)", minHeight: "100vh", padding: "36px 0" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px" },
  pageHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    background: "var(--white)", borderRadius: "var(--radius-lg)",
    padding: "24px 32px", marginBottom: "24px",
    boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-3)",
    flexWrap: "wrap", gap: "16px",
  },
  title: { fontSize: "22px", fontWeight: "800", color: "var(--dark)", marginBottom: "4px" },
  subtitle: { color: "var(--text-light)", fontSize: "13px" },
  statsRow: { display: "flex", gap: "12px" },
  statCard: {
    background: "var(--gray-1)", borderRadius: "var(--radius-sm)",
    padding: "12px 20px", textAlign: "center",
    border: "1px solid var(--gray-3)",
  },
  statNum: { display: "block", fontSize: "22px", fontWeight: "800" },
  statLabel: { fontSize: "11px", color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.5px" },
  msgBox: {
    padding: "12px 16px", borderRadius: "var(--radius-sm)",
    fontSize: "14px", marginBottom: "16px", fontWeight: "600",
  },
  msgSuccess: { background: "var(--success-light)", color: "var(--success)", border: "1px solid #a7f3d0" },
  msgError: { background: "var(--danger-light)", color: "var(--danger)", border: "1px solid #fecaca" },
  tabBar: {
    display: "flex", gap: "2px", marginBottom: "20px",
    background: "var(--white)", padding: "5px",
    borderRadius: "var(--radius-sm)", width: "fit-content",
    boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-3)",
  },
  tab: {
    padding: "8px 18px", border: "none", borderRadius: "6px",
    background: "transparent", fontWeight: "600", fontSize: "14px",
    color: "var(--gray-5)", display: "flex", alignItems: "center", gap: "6px",
    cursor: "pointer", transition: "var(--transition)",
  },
  activeTab: { background: "var(--primary)", color: "#fff" },
  tabCount: {
    background: "var(--gray-2)", color: "var(--gray-5)",
    borderRadius: "10px", padding: "1px 7px", fontSize: "11px", fontWeight: "700",
  },
  activeTabCount: { background: "rgba(255,255,255,0.25)", color: "#fff" },
  card: {
    background: "var(--white)", borderRadius: "var(--radius-lg)",
    padding: "24px", marginBottom: "20px",
    boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-3)",
  },
  cardTitle: {
    fontSize: "16px", fontWeight: "800", color: "var(--dark)",
    marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px",
  },
  countBadge: {
    background: "var(--primary-light)", color: "var(--primary)",
    padding: "2px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: "700",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" },
  inlineForm: { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "14px", alignItems: "flex-start" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "700", color: "var(--gray-6)", textTransform: "uppercase", letterSpacing: "0.3px" },
  input: {
    padding: "10px 12px", border: "1.5px solid var(--gray-3)",
    borderRadius: "var(--radius-sm)", fontSize: "14px",
    outline: "none", color: "var(--text)",
  },
  addBtn: {
    padding: "10px 20px", background: "var(--primary)",
    color: "#fff", border: "none", borderRadius: "var(--radius-sm)",
    fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap",
  },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: {
    padding: "10px 14px", textAlign: "left",
    fontWeight: "700", color: "var(--gray-5)", fontSize: "12px",
    textTransform: "uppercase", letterSpacing: "0.3px",
    borderBottom: "2px solid var(--gray-3)", background: "var(--gray-1)",
  },
  tr: { borderBottom: "1px solid var(--gray-2)", transition: "background 0.15s" },
  td: { padding: "12px 14px", color: "var(--text)" },
  idBadge: {
    background: "var(--gray-2)", color: "var(--gray-5)",
    padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "700",
  },
  stockBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "700",
  },
  statusBadge: {
    padding: "4px 10px", borderRadius: "12px",
    fontSize: "11px", fontWeight: "700",
  },
  delBtn: {
    padding: "5px 12px", background: "var(--danger-light)",
    color: "var(--danger)", border: "1px solid #fecaca",
    borderRadius: "var(--radius-sm)", fontWeight: "600", fontSize: "12px",
  },
  saveBtn: {
    padding: "5px 10px", background: "var(--success)",
    color: "#fff", border: "none",
    borderRadius: "var(--radius-sm)", fontWeight: "600", fontSize: "12px",
  },
  statusSelect: {
    padding: "6px 10px", border: "1.5px solid var(--gray-3)",
    borderRadius: "var(--radius-sm)", fontSize: "12px",
    cursor: "pointer", color: "var(--text)",
  },
  uploadWrap: { display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" },
  uploadBtn: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "linear-gradient(135deg,#2563eb,#06b6d4)", color: "#fff", borderRadius: "var(--radius-sm)", fontWeight: "600", fontSize: "13px", cursor: "pointer", border: "none", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" },
  uploadBtnOff: { opacity: 0.6, cursor: "not-allowed" },
  previewWrap: { position: "relative", display: "inline-block" },
  preview: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "10px", border: "2px solid var(--gray-3)", display: "block" },
  removeImg: { position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", background: "#ef4444", color: "#fff", border: "none", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", lineHeight: 1 },
};
