import { useEffect, useState } from "react";
import api from "../api/axios";
import ServerError from "../components/ServerError";

const STATUS_COLORS = {
  PENDING:   { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  CONFIRMED: { color: "#0F766E", bg: "#F0FDF9", border: "#99F6E4" },
  SHIPPED:   { color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE" },
  DELIVERED: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
  CANCELLED: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
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
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      flash("Cloudinary not configured. Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET.", "error");
      return;
    }
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", uploadPreset);
      data.append("cloud_name", cloudName);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: data });
      if (!res.ok) { flash("Upload failed", "error"); return; }
      const json = await res.json();
      if (json.secure_url) setPf("imageUrl", json.secure_url);
      else flash("Upload failed", "error");
    } catch { flash("Upload error", "error"); }
    finally { setUploading(false); }
  };

  const flash = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3000); };

  const fetchAll = () => {
    Promise.all([
      api.get("/products?page=0&size=100"),
      api.get("/categories"),
      api.get("/admin/orders"),
    ])
      .then(([p, c, o]) => {
        setProducts(p.data.content || []);
        setCategories(c.data);
        setOrders(o.data);
        setError("");
      })
      .catch(err => { if (!err.response) setError("Cannot connect to server."); });
  };
  useEffect(() => { fetchAll(); }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post("/products", {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category: productForm.categoryId ? { id: parseInt(productForm.categoryId) } : null,
      });
      flash("Product created!");
      setProductForm({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
      fetchAll();
    } catch (err) { flash(err.response?.data?.message || "Error creating product", "error"); }
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
        name: product.name, description: product.description,
        price: parseFloat(newPrice), stock: product.stock,
        imageUrl: product.imageUrl,
        category: product.category ? { id: product.category.id } : null,
      });
      flash(`${product.name} price updated!`);
      setEditPrices(prev => { const n = { ...prev }; delete n[product.id]; return n; });
      fetchAll();
    } catch { flash("Error updating price", "error"); }
  };

  const pf = productForm;
  const setPf = (k, v) => setProductForm(prev => ({ ...prev, [k]: v }));

  const TABS = [
    { key: "products",   label: "Products",   count: products.length },
    { key: "categories", label: "Categories", count: categories.length },
    { key: "orders",     label: "Orders",     count: orders.length },
  ];

  const inputStyle = {
    padding: "10px 12px", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)", fontSize: "14px", outline: "none",
    color: "var(--navy)", background: "#fff", width: "100%", boxSizing: "border-box",
    fontFamily: "inherit", transition: "border 0.2s"
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "36px 0" }}>
      {msg.text && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 9999,
          background: msg.type === "success" ? "var(--success)" : "var(--danger)",
          color: "#fff", padding: "12px 20px", borderRadius: "var(--radius-sm)",
          fontWeight: 600, fontSize: "14px", boxShadow: "var(--shadow-md)", animation: "fadeUp 0.3s ease"
        }}>
          {msg.type === "success" ? "✓ " : "✕ "}{msg.text}
        </div>
      )}

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "var(--navy)", borderRadius: "var(--radius-lg)",
          padding: "24px 32px", marginBottom: "24px",
          boxShadow: "var(--shadow-md)", flexWrap: "wrap", gap: "16px"
        }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Admin Dashboard</h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "13px", margin: 0 }}>Manage inventory and orders</p>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            {[
              { label: "Products",   value: products.length,   color: "#6EE7B7" },
              { label: "Categories", value: categories.length, color: "#A5B4FC" },
              { label: "Orders",     value: orders.length,     color: "#FCD34D" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.08)", borderRadius: "var(--radius-sm)",
                padding: "12px 20px", textAlign: "center", border: "1px solid rgba(255,255,255,0.12)"
              }}>
                <span style={{ display: "block", fontSize: "22px", fontWeight: 800, color: stat.color }}>{stat.value}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <ServerError message={error} />}

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "2px", marginBottom: "20px",
          background: "var(--surface)", padding: "5px",
          borderRadius: "var(--radius-sm)", width: "fit-content",
          boxShadow: "var(--shadow-sm)", border: "1px solid var(--border)"
        }}>
          {TABS.map(t => (
            <button key={t.key}
              style={{
                padding: "8px 18px", border: "none", borderRadius: "6px",
                background: tab === t.key ? "var(--navy)" : "transparent",
                color: tab === t.key ? "#fff" : "var(--muted)",
                fontWeight: 600, fontSize: "14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "6px", transition: "var(--transition)"
              }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span style={{
                background: tab === t.key ? "rgba(255,255,255,0.2)" : "var(--border)",
                color: tab === t.key ? "#fff" : "var(--muted)",
                borderRadius: "10px", padding: "1px 7px", fontSize: "11px", fontWeight: 700
              }}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <div>
            {/* Add product form */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", marginBottom: "20px" }}>Add New Product</h3>
              <form onSubmit={saveProduct}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                  <Field label="Product Name *">
                    <input style={inputStyle} placeholder="e.g. Land in Coimbatore" value={pf.name}
                      onChange={e => setPf("name", e.target.value)}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"}
                      required />
                  </Field>
                  <Field label="Price (Rs.) *">
                    <input style={inputStyle} type="number" step="0.01" placeholder="0.00" value={pf.price}
                      onChange={e => setPf("price", e.target.value)}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"}
                      required />
                  </Field>
                  <Field label="Stock">
                    <input style={inputStyle} type="number" placeholder="0" value={pf.stock}
                      onChange={e => setPf("stock", e.target.value)}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"} />
                  </Field>
                  <Field label="Category">
                    <select style={inputStyle} value={pf.categoryId} onChange={e => setPf("categoryId", e.target.value)}>
                      <option value="">No Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <Field label="Product Image">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <label style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "9px 16px", background: uploading ? "var(--border)" : "var(--accent)",
                        color: uploading ? "var(--muted)" : "#fff", borderRadius: "var(--radius-sm)",
                        fontWeight: 600, fontSize: "13px", cursor: uploading ? "not-allowed" : "pointer",
                        border: "none", whiteSpace: "nowrap"
                      }}>
                        {uploading ? "⏳ Uploading..." : "📁 Choose Photo"}
                        <input type="file" accept="image/*" style={{ display: "none" }}
                          onChange={e => e.target.files[0] && uploadToCloudinary(e.target.files[0])}
                          disabled={uploading} />
                      </label>
                      {pf.imageUrl && (
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <img src={pf.imageUrl} alt="preview" style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", display: "block" }} />
                          <button type="button"
                            style={{ position: "absolute", top: "-6px", right: "-6px", width: "20px", height: "20px", borderRadius: "50%", background: "var(--danger)", color: "#fff", border: "none", fontSize: "11px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => setPf("imageUrl", "")}>✕</button>
                        </div>
                      )}
                    </div>
                    <input style={{ ...inputStyle, marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}
                      placeholder="Or paste image URL..."
                      value={pf.imageUrl} onChange={e => setPf("imageUrl", e.target.value)}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"} />
                  </Field>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <Field label="Description">
                    <input style={inputStyle} placeholder="Product description..." value={pf.description}
                      onChange={e => setPf("description", e.target.value)}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"} />
                  </Field>
                </div>

                <button type="submit" style={{ padding: "10px 24px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}>
                  Add Product
                </button>
              </form>
            </div>

            {/* Products table */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                All Products
                <span style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "2px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 700 }}>{products.length}</span>
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr>
                      {["ID", "Name", "Price", "Stock", "Category", ""].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid var(--border)", background: "var(--bg)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: "var(--border)", color: "var(--muted)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>#{p.id}</span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--navy)" }}>{p.name}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                              style={{ ...inputStyle, width: "90px", padding: "5px 8px", fontSize: "13px" }}
                              type="number" step="0.01"
                              value={editPrices[p.id] !== undefined ? editPrices[p.id] : p.price}
                              onChange={e => setEditPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                            />
                            {editPrices[p.id] !== undefined && (
                              <button style={{ padding: "5px 10px", background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                                onClick={() => updatePrice(p, editPrices[p.id])}>Save</button>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: p.stock > 0 ? "var(--success-bg)" : "var(--danger-bg)", color: p.stock > 0 ? "var(--success)" : "var(--danger)" }}>
                            {p.stock}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", color: "var(--body)" }}>{p.category?.name || <span style={{ color: "var(--muted)" }}>—</span>}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <button style={{ padding: "5px 12px", background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                            onClick={() => deleteProduct(p.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === "categories" && (
          <div>
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", marginBottom: "20px" }}>Add New Category</h3>
              <form onSubmit={saveCategory}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "14px", alignItems: "flex-end" }}>
                  <Field label="Category Name *">
                    <input style={inputStyle} placeholder="e.g. Land" value={categoryForm.name}
                      onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"}
                      required />
                  </Field>
                  <Field label="Description">
                    <input style={inputStyle} placeholder="Optional" value={categoryForm.description}
                      onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      onFocus={e => e.target.style.borderColor = "var(--accent)"}
                      onBlur={e => e.target.style.borderColor = "var(--border)"} />
                  </Field>
                  <button type="submit" style={{ padding: "10px 20px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    Add Category
                  </button>
                </div>
              </form>
            </div>

            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                All Categories
                <span style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "2px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 700 }}>{categories.length}</span>
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr>
                      {["ID", "Name", "Description", ""].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid var(--border)", background: "var(--bg)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(c => (
                      <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: "var(--border)", color: "var(--muted)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>#{c.id}</span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--navy)" }}>{c.name}</td>
                        <td style={{ padding: "12px 14px", color: "var(--body)" }}>{c.description || <span style={{ color: "var(--muted)" }}>—</span>}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <button style={{ padding: "5px 12px", background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid #FECACA", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}
                            onClick={() => deleteCategory(c.id)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              All Orders
              <span style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "2px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 700 }}>{orders.length}</span>
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr>
                    {["Order", "Customer", "Total", "Address", "Status", "Update"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "2px solid var(--border)", background: "var(--bg)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const sc = STATUS_COLORS[o.status] || { color: "var(--muted)", bg: "var(--bg)", border: "var(--border)" };
                    return (
                      <tr key={o.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: "var(--border)", color: "var(--muted)", padding: "2px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: 700 }}>#{o.id}</span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "var(--navy)" }}>{o.user?.username}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: "var(--accent)" }}>Rs. {Number(o.totalAmount).toLocaleString()}</td>
                        <td style={{ padding: "12px 14px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--body)" }}>
                          {o.shippingAddress}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <select
                            style={{ padding: "6px 10px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "12px", cursor: "pointer", color: "var(--navy)", outline: "none", background: "#fff" }}
                            value={o.status}
                            onChange={e => updateStatus(o.id, e.target.value)}
                          >
                            {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(st => (
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

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--body)", textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</label>
      {children}
    </div>
  );
}
