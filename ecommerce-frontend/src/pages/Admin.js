import { useEffect, useState } from "react";
import api from "../api/axios";
import ServerError from "../components/ServerError";

const STATUS_COLORS = {
  PENDING:   { color: "#B89045", bg: "#FBF6EC", border: "#EADCB6" },
  CONFIRMED: { color: "#174A3A", bg: "#EAF0ED", border: "#C4D5CF" },
  SHIPPED:   { color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  DELIVERED: { color: "#206E4E", bg: "#EDF7F3", border: "#BDE2D2" },
  CANCELLED: { color: "#B03A2E", bg: "#FEF2F2", border: "#FECACA" },
};

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // Forms
  const [productForm, setProductForm] = useState({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [error, setError] = useState("");
  const [editPrices, setEditPrices] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search & Pagination mock states for UI
  const [searchQuery, setSearchQuery] = useState("");

  const flash = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 3000); };

  const fetchAll = () => {
    setLoading(true);
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
      .catch(err => { if (!err.response) setError("Cannot connect to server."); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchAll(); }, []);

  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      flash("Cloudinary not configured.", "error");
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
      if (json.secure_url) {
        setProductForm(prev => ({ ...prev, imageUrl: json.secure_url }));
        flash("Image uploaded successfully!");
      }
      else flash("Upload failed", "error");
    } catch { flash("Upload error", "error"); }
    finally { setUploading(false); }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      flash("Please fill all required fields.", "error"); return;
    }
    try {
      await api.post("/products", {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock || 0),
        category: productForm.categoryId ? { id: parseInt(productForm.categoryId) } : null,
      });
      flash("Product created!");
      setProductForm({ name: "", description: "", price: "", stock: "", imageUrl: "", categoryId: "" });
      fetchAll();
      setTab("products");
    } catch (err) { flash(err.response?.data?.message || "Error creating product", "error"); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) return;
    try { await api.delete(`/products/${id}`); fetchAll(); flash("Product deleted!"); }
    catch { flash("Error deleting product", "error"); }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name) { flash("Category name required.", "error"); return; }
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
      flash(`${product.name} updated!`);
      setEditPrices(prev => { const n = { ...prev }; delete n[product.id]; return n; });
      fetchAll();
    } catch { flash("Error updating price", "error"); }
  };

  const pf = productForm;

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      
      {/* Toast */}
      {msg.text && (
        <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 9999, backgroundColor: msg.type === "success" ? "var(--status-success)" : "var(--status-error)", color: "#fff", padding: "16px 24px", borderRadius: "var(--radius-md)", fontWeight: 500, boxShadow: "var(--shadow-float)", animation: "slide-up 0.3s ease", display: "flex", alignItems: "center", gap: "12px" }}>
          {msg.type === "success" ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          )}
          {msg.text}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: "260px", backgroundColor: "var(--bg-white)", borderRight: "1px solid var(--border-light)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px", borderBottom: "1px solid var(--border-light)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", backgroundColor: "var(--bg-ivory)", border: "1px solid var(--border-beige)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)" }}>
              <span className="text-editorial" style={{ color: "var(--brand-forest)", fontSize: "16px", fontWeight: 600, fontStyle: "italic" }}>V</span>
            </div>
            <span className="text-editorial" style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-charcoal)" }}>Admin Panel</span>
          </div>
        </div>
        
        <nav style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
          {[
            { id: "dashboard", label: "Dashboard Overview", icon: "LayoutDashboard" },
            { id: "products", label: "Manage Listings", icon: "Package" },
            { id: "add_product", label: "Add New Listing", icon: "PlusCircle" },
            { id: "categories", label: "Categories", icon: "Tags" },
            { id: "orders", label: "Order Management", icon: "ShoppingCart" }
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "var(--radius-sm)", backgroundColor: tab === item.id ? "var(--bg-ivory)" : "transparent", color: tab === item.id ? "var(--brand-forest)" : "var(--text-muted)", fontWeight: tab === item.id ? 600 : 500, textAlign: "left", transition: "all 0.2s" }}>
              <span style={{ fontSize: "16px" }}>
                {item.icon === "LayoutDashboard" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>}
                {item.icon === "Package" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>}
                {item.icon === "PlusCircle" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>}
                {item.icon === "Tags" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>}
                {item.icon === "ShoppingCart" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        
        {/* Topbar */}
        <header style={{ height: "72px", backgroundColor: "var(--bg-white)", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
          <div style={{ position: "relative", width: "400px" }}>
            <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Search across dashboard..." style={{ width: "100%", padding: "10px 16px 10px 40px", backgroundColor: "#F3F4F6", border: "none", borderRadius: "var(--radius-full)" }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button style={{ position: "relative", color: "var(--text-muted)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span style={{ position: "absolute", top: "-4px", right: "-4px", width: "10px", height: "10px", backgroundColor: "var(--status-error)", borderRadius: "50%" }}></span>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "16px", borderLeft: "1px solid var(--border-light)" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--brand-forest)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>A</div>
              <div style={{ fontSize: "14px", fontWeight: 500 }}>Admin User</div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          
          {error && <ServerError message={error} />}

          {/* DASHBOARD TAB */}
          {tab === "dashboard" && (
            <div>
              <h1 className="text-editorial" style={{ fontSize: "28px", marginBottom: "24px" }}>Overview</h1>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                <div style={{ backgroundColor: "var(--bg-white)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>Total Listings</div>
                  <div style={{ fontSize: "36px", fontWeight: 600, color: "var(--brand-forest)" }}>{products.length}</div>
                </div>
                <div style={{ backgroundColor: "var(--bg-white)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>Total Orders</div>
                  <div style={{ fontSize: "36px", fontWeight: 600, color: "var(--brand-forest)" }}>{orders.length}</div>
                </div>
                <div style={{ backgroundColor: "var(--bg-white)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", marginBottom: "8px" }}>Categories</div>
                  <div style={{ fontSize: "36px", fontWeight: 600, color: "var(--brand-forest)" }}>{categories.length}</div>
                </div>
              </div>
              
              <h2 className="text-editorial" style={{ fontSize: "24px", marginBottom: "16px" }}>Recent Orders</h2>
              <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid var(--border-light)" }}>
                    <tr>
                      {["Order ID", "Customer", "Amount", "Status"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => {
                      const sc = STATUS_COLORS[o.status] || STATUS_COLORS.PENDING;
                      return (
                        <tr key={o.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                          <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500 }}>#VK-{o.id.toString().padStart(5, '0')}</td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "var(--text-muted)" }}>{o.user?.username || "Guest"}</td>
                          <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600, color: "var(--text-charcoal)" }}>₹ {Number(o.totalAmount).toLocaleString()}</td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600, backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{o.status}</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADD PRODUCT TAB */}
          {tab === "add_product" && (
            <div style={{ maxWidth: "800px" }}>
              <h1 className="text-editorial" style={{ fontSize: "28px", marginBottom: "24px" }}>Create New Listing</h1>
              <div style={{ backgroundColor: "var(--bg-white)", padding: "32px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
                <form onSubmit={saveProduct}>
                  
                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginBottom: "16px" }}>Basic Information</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Listing Title *</label>
                        <input type="text" value={pf.name} onChange={e => setProductForm({...pf, name: e.target.value})} placeholder="e.g. 3BHK Villa in Chennai" style={{ width: "100%", padding: "10px 12px" }} required />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Category *</label>
                        <select value={pf.categoryId} onChange={e => setProductForm({...pf, categoryId: e.target.value})} style={{ width: "100%", padding: "10px 12px" }} required>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginBottom: "16px" }}>Pricing & Availability</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Price (₹) *</label>
                        <input type="number" step="0.01" value={pf.price} onChange={e => setProductForm({...pf, price: e.target.value})} placeholder="0.00" style={{ width: "100%", padding: "10px 12px" }} required />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Stock / Quantity</label>
                        <input type="number" value={pf.stock} onChange={e => setProductForm({...pf, stock: e.target.value})} placeholder="1" style={{ width: "100%", padding: "10px 12px" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginBottom: "16px" }}>Description</h3>
                    <textarea value={pf.description} onChange={e => setProductForm({...pf, description: e.target.value})} placeholder="Provide detailed information about the listing..." rows="4" style={{ width: "100%", padding: "12px", border: "1px solid var(--border-beige)", borderRadius: "var(--radius-sm)", resize: "vertical" }}></textarea>
                  </div>

                  <div style={{ marginBottom: "32px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, borderBottom: "1px solid var(--border-light)", paddingBottom: "8px", marginBottom: "16px" }}>Media</h3>
                    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px dashed var(--border-beige)", borderRadius: "var(--radius-lg)", padding: "32px", cursor: uploading ? "not-allowed" : "pointer", backgroundColor: "#F9FAFB" }}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ marginBottom: "12px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--brand-forest)" }}>{uploading ? "Uploading..." : "Click to upload image"}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>PNG, JPG up to 5MB</span>
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && uploadToCloudinary(e.target.files[0])} disabled={uploading} />
                        </label>
                      </div>
                      {pf.imageUrl && (
                        <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "var(--radius-md)", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                          <img src={pf.imageUrl} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button type="button" onClick={() => setProductForm({...pf, imageUrl: ""})} style={{ position: "absolute", top: "4px", right: "4px", backgroundColor: "var(--status-error)", color: "#fff", width: "24px", height: "24px", borderRadius: "50%", display: "flex", alignItems: "center", justifyItems: "center", fontSize: "12px", border: "none" }}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" className="btn-primary" style={{ padding: "12px 32px" }}>Create Listing</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MANAGE LISTINGS TAB */}
          {tab === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h1 className="text-editorial" style={{ fontSize: "28px" }}>Manage Listings</h1>
                <button className="btn-primary" onClick={() => setTab("add_product")}>+ New Listing</button>
              </div>
              <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid var(--border-light)" }}>
                    <tr>
                      {["Listing", "Price", "Stock", "Category", "Actions"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                        <td style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                          <img src={p.imageUrl || "https://via.placeholder.com/40"} alt={p.name} style={{ width: "40px", height: "40px", borderRadius: "4px", objectFit: "cover", border: "1px solid var(--border-beige)" }} />
                          <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-charcoal)" }}>{p.name}</span>
                        </td>
                        <td style={{ padding: "16px" }}>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--brand-forest)" }}>₹</span>
                            <input 
                              type="number" step="0.01" 
                              value={editPrices[p.id] !== undefined ? editPrices[p.id] : p.price} 
                              onChange={e => setEditPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                              style={{ width: "100px", padding: "6px", fontSize: "14px", border: "1px solid var(--border-beige)", borderRadius: "var(--radius-sm)" }}
                            />
                            {editPrices[p.id] !== undefined && (
                              <button onClick={() => updatePrice(p, editPrices[p.id])} style={{ padding: "6px 12px", backgroundColor: "var(--status-success)", color: "#fff", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600 }}>Save</button>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, backgroundColor: p.stock > 0 ? "#DCFCE7" : "#FEE2E2", color: p.stock > 0 ? "#16A34A" : "#DC2626" }}>
                            {p.stock}
                          </span>
                        </td>
                        <td style={{ padding: "16px", fontSize: "14px", color: "var(--text-muted)" }}>{p.category?.name || "Uncategorized"}</td>
                        <td style={{ padding: "16px" }}>
                          <button onClick={() => deleteProduct(p.id)} style={{ color: "var(--status-error)", padding: "6px", backgroundColor: "var(--bg-ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-beige)" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {tab === "categories" && (
            <div>
              <h1 className="text-editorial" style={{ fontSize: "28px", marginBottom: "24px" }}>Categories</h1>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px", alignItems: "start" }}>
                <div style={{ backgroundColor: "var(--bg-white)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>Add New Category</h3>
                  <form onSubmit={saveCategory}>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Name *</label>
                      <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} style={{ width: "100%", padding: "10px" }} required />
                    </div>
                    <div style={{ marginBottom: "24px" }}>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Description</label>
                      <input type="text" value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})} style={{ width: "100%", padding: "10px" }} />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: "100%" }}>Create Category</button>
                  </form>
                </div>
                
                <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid var(--border-light)" }}>
                      <tr>
                        {["Name", "Description", "Actions"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(c => (
                        <tr key={c.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                          <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600 }}>{c.name}</td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "var(--text-muted)" }}>{c.description || "-"}</td>
                          <td style={{ padding: "16px" }}>
                            <button onClick={() => deleteCategory(c.id)} style={{ color: "var(--status-error)", padding: "6px", backgroundColor: "var(--bg-ivory)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-beige)" }}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === "orders" && (
            <div>
              <h1 className="text-editorial" style={{ fontSize: "28px", marginBottom: "24px" }}>Order Management</h1>
              <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#F3F4F6", borderBottom: "1px solid var(--border-light)" }}>
                    <tr>
                      {["Order ID", "Customer", "Total", "Address", "Status", "Update Status"].map(h => <th key={h} style={{ padding: "16px", textAlign: "left", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => {
                      const sc = STATUS_COLORS[o.status] || STATUS_COLORS.PENDING;
                      return (
                        <tr key={o.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                          <td style={{ padding: "16px", fontSize: "14px", fontWeight: 500 }}>#VK-{o.id.toString().padStart(5, '0')}</td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "var(--text-muted)" }}>{o.user?.username || "Guest"}</td>
                          <td style={{ padding: "16px", fontSize: "14px", fontWeight: 600, color: "var(--text-charcoal)" }}>₹ {Number(o.totalAmount).toLocaleString()}</td>
                          <td style={{ padding: "16px", fontSize: "14px", color: "var(--text-muted)", maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.shippingAddress}</td>
                          <td style={{ padding: "16px" }}>
                            <span style={{ padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600, backgroundColor: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{o.status}</span>
                          </td>
                          <td style={{ padding: "16px" }}>
                            <select 
                              value={o.status} 
                              onChange={e => updateStatus(o.id, e.target.value)}
                              style={{ padding: "6px 12px", fontSize: "13px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-beige)", outline: "none" }}
                            >
                              {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
