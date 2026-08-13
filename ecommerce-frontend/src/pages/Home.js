import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ServerError from "../components/ServerError";

const CAT_STYLES = [
  { banner: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", icon: "💍" },
  { banner: "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)", icon: "🚗" },
  { banner: "linear-gradient(135deg, #6d28d9 0%, #c084fc 100%)", icon: "🛍️" },
  { banner: "linear-gradient(135deg, #5b21b6 0%, #a78bfa 100%)", icon: "⭐" },
  { banner: "linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)", icon: "📦" },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    setLoading(true); setError("");
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get("/categories"),
        api.get("/products?page=0&size=100&sortBy=id"),
      ]);
      setCategories(catRes.data);
      setAllProducts(prodRes.data.content || []);
    } catch (err) {
      if (!err.response) setError("Cannot connect to server. Please make sure the backend is running.");
      else setError("Failed to load products.");
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) { setSearchResults(null); return; }
    try {
      const res = await api.get(`/products/search?name=${encodeURIComponent(search)}`);
      setSearchResults(res.data);
    } catch { setSearchResults([]); }
  };

  const clearSearch = () => { setSearch(""); setSearchResults(null); };

  const addToCart = async (productId) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart/add", { productId, quantity: 1 });
      setMsg({ text: "✓ Added to cart!", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 2500);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Error adding to cart", type: "error" });
      setTimeout(() => setMsg({ text: "", type: "" }), 2500);
    }
  };

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const productsByCategory = {};
  allProducts.forEach((p) => {
    const key = p.category?.name || "Other";
    if (!productsByCategory[key]) productsByCategory[key] = [];
    productsByCategory[key].push(p);
  });

  return (
    <div style={s.page}>
      {msg.text && (
        <div style={{ ...s.toast, background: msg.type === "success" ? "#7c3aed" : "#dc2626" }}>
          {msg.text}
        </div>
      )}

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroOverlay} />
        <div style={s.heroContent}>
          <div style={s.heroBadge}>✨ Premium Collections</div>
          <h1 style={s.heroTitle}>Vaayukumaran</h1>
          <p style={s.heroSub}>Your royal destination for Wedding & Vehicle collections</p>
          {categories.length > 0 && (
            <div style={s.heroButtons}>
              {categories.map((cat, i) => {
                const cs = CAT_STYLES[i % CAT_STYLES.length];
                return (
                  <button key={cat.id} style={s.heroBtn} onClick={() => scrollTo(`cat-${cat.id}`)}>
                    {cs.icon} {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={s.searchBar}>
        <form onSubmit={handleSearch} style={s.searchForm}>
          <div style={s.searchInputWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (!e.target.value) clearSearch(); }}
            />
          </div>
          <button style={s.searchBtn} type="submit">Search</button>
          {searchResults !== null && (
            <button style={s.clearBtn} type="button" onClick={clearSearch}>✕ Clear</button>
          )}
        </form>
      </div>

      <div style={s.container}>
        {error && <ServerError message={error} />}

        {/* Search Results */}
        {searchResults !== null && (
          <div style={s.section}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Search Results</h2>
              <span style={s.countPill}>{searchResults.length} items</span>
            </div>
            {searchResults.length === 0 ? (
              <div style={s.emptyDash}>
                <p style={s.emptyIcon}>🔍</p>
                <p style={s.emptyText}>No products found for "<strong>{search}</strong>"</p>
              </div>
            ) : (
              <div style={s.grid}>
                {searchResults.map((p) => <ProductCard key={p.id} p={p} onCart={addToCart} />)}
              </div>
            )}
          </div>
        )}

        {/* Category Sections */}
        {!searchResults && !loading && !error && (
          <>
            {categories.length === 0 && (
              <div style={s.emptyDash}>
                <p style={s.emptyIcon}>🏷️</p>
                <p style={s.emptyText}>No categories yet. Add from <strong>Admin panel</strong>.</p>
              </div>
            )}
            {categories.map((cat, i) => {
              const cs = CAT_STYLES[i % CAT_STYLES.length];
              const prods = productsByCategory[cat.name] || [];
              return (
                <section key={cat.id} id={`cat-${cat.id}`} style={s.section}>
                  <div style={{ ...s.catBanner, background: cs.banner }}>
                    <div>
                      <h2 style={s.catTitle}>{cs.icon} {cat.name}</h2>
                      {cat.description && <p style={s.catDesc}>{cat.description}</p>}
                    </div>
                    <span style={s.catCount}>{prods.length} Products</span>
                  </div>
                  {prods.length === 0 ? (
                    <div style={s.emptyDash}>
                      <p style={s.emptyIcon}>{cs.icon}</p>
                      <p style={s.emptyText}>No products in <strong>{cat.name}</strong> yet.</p>
                      <p style={s.emptyHint}>Add products from Admin panel → select "{cat.name}" category.</p>
                    </div>
                  ) : (
                    <div style={s.grid}>
                      {prods.map((p) => <ProductCard key={p.id} p={p} onCart={addToCart} />)}
                    </div>
                  )}
                </section>
              );
            })}
          </>
        )}

        {loading && (
          <div style={s.loadBox}>
            <div style={s.spinner} />
            <p style={s.loadText}>Loading...</p>
          </div>
        )}
      </div>

      <footer style={s.footer}>
        <div style={s.footerLogo}>V</div>
        <p style={s.footerName}>Vaayukumaran</p>
        <p style={s.footerText}>© 2024 All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .pcard:hover{transform:translateY(-5px);box-shadow:0 16px 40px rgba(124,58,237,0.18)!important}
      `}</style>
    </div>
  );
}

function ProductCard({ p, onCart }) {
  return (
    <div className="pcard" style={s.card}>
      <div style={s.imgWrap}>
        <img src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} alt={p.name} style={s.img} />
        {p.stock === 0 && <div style={s.outBadge}>Out of Stock</div>}
        {p.category && <div style={s.catBadge}>{p.category.name}</div>}
      </div>
      <div style={s.cardBody}>
        <h4 style={s.cardName}>{p.name}</h4>
        <p style={s.cardDesc}>{p.description || ""}</p>
        <div style={s.cardFoot}>
          <div>
            <span style={s.price}>Rs. {Number(p.price).toLocaleString()}</span>
            {p.stock > 0 && p.stock <= 5 && <span style={s.lowStock}>Only {p.stock} left!</span>}
          </div>
          <button
            style={{ ...s.cartBtn, ...(p.stock === 0 ? s.cartBtnOff : {}) }}
            onClick={() => onCart(p.id)}
            disabled={p.stock === 0}
          >
            {p.stock === 0 ? "Sold Out" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: "#f5f3ff", minHeight: "100vh" },
  toast: { position: "fixed", top: "80px", right: "24px", color: "#fff", padding: "12px 22px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", zIndex: 9999, boxShadow: "0 4px 20px rgba(124,58,237,0.4)", animation: "fadeIn 0.2s ease" },

  hero: { position: "relative", background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)", padding: "90px 40px", textAlign: "center", overflow: "hidden" },
  heroOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)", pointerEvents: "none" },
  heroContent: { position: "relative", maxWidth: "700px", margin: "0 auto" },
  heroBadge: { display: "inline-block", background: "rgba(255,255,255,0.12)", color: "#e9d5ff", padding: "6px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" },
  heroTitle: { color: "#fff", fontSize: "56px", fontWeight: "900", letterSpacing: "-2px", lineHeight: "1.1", margin: "0 0 14px", textShadow: "0 2px 20px rgba(0,0,0,0.3)" },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: "16px", margin: "0 0 32px" },
  heroButtons: { display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" },
  heroBtn: { padding: "11px 26px", background: "rgba(255,255,255,0.12)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", borderRadius: "50px", fontWeight: "700", fontSize: "14px", backdropFilter: "blur(4px)", transition: "all 0.2s" },

  searchBar: { background: "#fff", borderBottom: "2px solid #ede9fe", padding: "14px 24px", boxShadow: "0 2px 8px rgba(124,58,237,0.06)" },
  searchForm: { display: "flex", gap: "8px", maxWidth: "680px", margin: "0 auto" },
  searchInputWrap: { flex: 1, position: "relative", display: "flex", alignItems: "center" },
  searchIcon: { position: "absolute", left: "12px", fontSize: "16px", pointerEvents: "none" },
  searchInput: { width: "100%", padding: "11px 14px 11px 38px", border: "1.5px solid #ddd6fe", borderRadius: "10px", fontSize: "14px", outline: "none", color: "#1e1b4b", background: "#faf5ff" },
  searchBtn: { padding: "11px 22px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", whiteSpace: "nowrap", boxShadow: "0 2px 10px rgba(124,58,237,0.3)" },
  clearBtn: { padding: "11px 16px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "10px", fontWeight: "600" },

  container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" },
  section: { marginBottom: "60px" },
  sectionHead: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" },
  sectionTitle: { fontSize: "22px", fontWeight: "800", color: "#1e1b4b" },
  countPill: { background: "#ede9fe", color: "#7c3aed", padding: "3px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" },

  catBanner: { borderRadius: "16px", padding: "28px 32px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 20px rgba(124,58,237,0.25)" },
  catTitle: { color: "#fff", fontSize: "26px", fontWeight: "800", margin: "0 0 6px" },
  catDesc: { color: "rgba(255,255,255,0.75)", fontSize: "14px", margin: 0 },
  catCount: { background: "rgba(255,255,255,0.2)", color: "#fff", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap" },

  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" },
  card: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 12px rgba(124,58,237,0.08)", border: "1px solid #ede9fe", display: "flex", flexDirection: "column", transition: "transform 0.2s, box-shadow 0.2s" },
  imgWrap: { position: "relative", overflow: "hidden" },
  img: { width: "100%", height: "200px", objectFit: "cover", display: "block" },
  outBadge: { position: "absolute", top: "10px", left: "10px", background: "rgba(30,27,75,0.75)", color: "#fff", fontSize: "11px", padding: "3px 8px", borderRadius: "4px", fontWeight: "600" },
  catBadge: { position: "absolute", top: "10px", right: "10px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontWeight: "700", textTransform: "uppercase" },
  cardBody: { padding: "14px", display: "flex", flexDirection: "column", flex: 1 },
  cardName: { fontSize: "14px", fontWeight: "700", color: "#1e1b4b", margin: "0 0 6px" },
  cardDesc: { fontSize: "12px", color: "#7c6fa0", margin: "0 0 12px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", flex: 1 },
  cardFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  price: { fontSize: "17px", fontWeight: "800", color: "#4c1d95", display: "block" },
  lowStock: { fontSize: "11px", color: "#dc2626", fontWeight: "600", display: "block", marginTop: "2px" },
  cartBtn: { padding: "8px 14px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "13px", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" },
  cartBtnOff: { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed", boxShadow: "none" },

  emptyDash: { background: "#faf5ff", border: "2px dashed #ddd6fe", borderRadius: "14px", padding: "40px", textAlign: "center" },
  emptyIcon: { fontSize: "40px", margin: "0 0 10px" },
  emptyText: { color: "#6d28d9", fontSize: "14px", marginBottom: "6px" },
  emptyHint: { color: "#a78bfa", fontSize: "12px" },

  loadBox: { textAlign: "center", padding: "80px 0" },
  spinner: { width: "40px", height: "40px", border: "3px solid #ede9fe", borderTop: "3px solid #7c3aed", borderRadius: "50%", margin: "0 auto", animation: "spin 0.8s linear infinite" },
  loadText: { color: "#a78bfa", marginTop: "14px", fontSize: "14px" },

  footer: { background: "#1e1b4b", padding: "32px", textAlign: "center", marginTop: "40px" },
  footerLogo: { width: "40px", height: "40px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", fontSize: "18px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" },
  footerName: { color: "#e9d5ff", fontWeight: "700", fontSize: "15px", marginBottom: "4px" },
  footerText: { color: "rgba(255,255,255,0.3)", fontSize: "12px" },
};
