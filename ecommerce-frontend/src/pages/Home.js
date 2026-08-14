import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ServerError from "../components/ServerError";

const CAT_META = {
  land:    { icon: "🏡", g: "linear-gradient(135deg,#0f172a,#1e3a5f)" },
  wedding: { icon: "💍", g: "linear-gradient(135deg,#0f172a,#1e1b4b)" },
  vehicle: { icon: "🚗", g: "linear-gradient(135deg,#0f172a,#0c2340)" },
  sale:    { icon: "🏷️", g: "linear-gradient(135deg,#0f172a,#1e3a5f)" },
  default: { icon: "✦",  g: "linear-gradient(135deg,#0f172a,#1e293b)" },
};
const getCat = (name="") => {
  const l = name.toLowerCase();
  return Object.keys(CAT_META).find(k => l.includes(k))
    ? CAT_META[Object.keys(CAT_META).find(k => l.includes(k))]
    : CAT_META.default;
};

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

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/categories"), api.get("/products?page=0&size=100&sortBy=id")])
      .then(([c, p]) => { setCategories(c.data); setAllProducts(p.data.content || []); })
      .catch(err => setError(!err.response ? "Cannot connect to server." : "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) { setSearchResults(null); return; }
    try { setSearchResults((await api.get(`/products/search?name=${encodeURIComponent(search)}`)).data); }
    catch { setSearchResults([]); }
  };

  const addToCart = async (productId) => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart/add", { productId, quantity: 1 });
      setMsg({ text: "✓ Added to cart!", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Error", type: "error" });
    }
    setTimeout(() => setMsg({ text: "", type: "" }), 2500);
  };

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const byCategory = {};
  allProducts.forEach(p => {
    const k = p.category?.name || "Other";
    if (!byCategory[k]) byCategory[k] = [];
    byCategory[k].push(p);
  });

  return (
    <div style={s.page}>
      {msg.text && <div style={{ ...s.toast, background: msg.type === "success" ? "#2563eb" : "#dc2626" }}>{msg.text}</div>}

      {/* ── HERO ── */}
      <section style={s.hero}>
        <div style={s.glowTL} /><div style={s.glowBR} /><div style={s.glowC} />
        <div style={s.heroInner}>
          <div style={s.badge}><span style={s.badgeDot} />Premium Marketplace</div>

          <h1 style={s.heroTitle}>
            <span style={s.titleLine1}>Discover. Buy.</span>
            <span style={s.titleLine2}>Vaayu kumaaran</span>
          </h1>

          <p style={s.heroSub}>
            Explore exclusive listings across{" "}
            <strong style={{ color: "#60a5fa", fontWeight: 600 }}>
              {categories.length > 0 ? categories.length : "multiple"} categories
            </strong>{" "}
            — Land, Wedding & Vehicles.
          </p>

          <div style={s.ctaRow}>
            <button style={s.btnPrimary} onClick={() => navigate(user ? "/cart" : "/register")}>
              {user ? "Go to Cart →" : "Get Started →"}
            </button>
            <button style={s.btnSecondary} onClick={() => document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" })}>
              Explore Listings ↓
            </button>
          </div>

          {/* Stats */}
          <div style={s.statsCard}>
            {[
              { num: allProducts.length, label: "Listings" },
              { num: categories.length,  label: "Categories" },
              { num: "100%",             label: "Verified" },
            ].map((st, i) => (
              <div key={i} style={s.statWrap}>
                {i > 0 && <div style={s.statDiv} />}
                <div style={s.stat}>
                  {typeof st.num === "number" && st.num === 0
                    ? <span style={s.comingSoon}>Soon</span>
                    : <span style={s.statNum}>{st.num}{typeof st.num === "number" ? "+" : ""}</span>
                  }
                  <span style={s.statLabel}>{st.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Category pills */}
          {categories.length > 0 && (
            <div style={s.pills}>
              {categories.map(cat => (
                <button key={cat.id} style={s.pill} onClick={() => scrollTo(`cat-${cat.id}`)}>
                  {getCat(cat.name).icon} {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scroll indicator */}
        <div style={s.scrollIndicator}>
          <span style={s.scrollText}>Scroll</span>
          <div style={s.scrollArrow}>↓</div>
        </div>
      </section>

      {/* ── SEARCH ── */}
      <div style={s.searchBar}>
        <form onSubmit={handleSearch} style={s.searchForm}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search products, categories..."
              value={search}
              onChange={e => { setSearch(e.target.value); if (!e.target.value) setSearchResults(null); }}
            />
          </div>
          <button style={s.searchBtn} type="submit">Search</button>
          {searchResults !== null && (
            <button style={s.clearBtn} type="button" onClick={() => { setSearch(""); setSearchResults(null); }}>✕</button>
          )}
        </form>
      </div>

      {/* ── LISTINGS ── */}
      <div id="listings" style={s.container}>
        {error && <ServerError message={error} />}

        {searchResults !== null && (
          <div style={s.section}>
            <SectionHead title="Search Results" count={searchResults.length} />
            {searchResults.length === 0
              ? <Empty icon="🔍" text={`No results for "${search}"`} />
              : <Grid products={searchResults} onCart={addToCart} />}
          </div>
        )}

        {!searchResults && !loading && !error && (
          <>
            {categories.length === 0 && <Empty icon="🏷️" text="No categories yet." hint="Add from Admin panel." />}
            {categories.map(cat => {
              const cm = getCat(cat.name);
              const prods = byCategory[cat.name] || [];
              return (
                <section key={cat.id} id={`cat-${cat.id}`} style={s.section}>
                  <div style={{ ...s.catBanner, background: cm.g }}>
                    <div style={s.catLeft}>
                      <div style={s.catIcon}>{cm.icon}</div>
                      <div>
                        <h2 style={s.catName}>{cat.name}</h2>
                        {cat.description && <p style={s.catDesc}>{cat.description}</p>}
                      </div>
                    </div>
                    <div style={s.catRight}>
                      <span style={s.catPill}>{prods.length} Listings</span>
                      {prods.length > 0 && <span style={s.catAvail}>{prods.filter(p=>p.stock>0).length} available</span>}
                    </div>
                  </div>
                  {prods.length === 0
                    ? <Empty icon={cm.icon} text={`No products in ${cat.name} yet.`} hint={`Add from Admin → "${cat.name}"`} />
                    : <Grid products={prods} onCart={addToCart} />}
                </section>
              );
            })}
          </>
        )}

        {loading && (
          <div style={s.loadBox}>
            <div style={s.spinner} />
            <p style={s.loadText}>Loading collections...</p>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <div style={s.footerLogo}>V</div>
            <div>
              <p style={s.footerName}>Vaayukumaaran</p>
              <p style={s.footerTag}>Premium Marketplace</p>
            </div>
          </div>
          <p style={s.footerCopy}>© 2024 Vaayukumaaran. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-32px)}}
        @keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(24px)}}
        @keyframes scrollBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
        .pcard:hover{transform:translateY(-7px) scale(1.015)!important;box-shadow:0 20px 48px rgba(59,130,246,0.18)!important;border-color:#3b82f6!important}
        .pcard:hover .cta-btn{background:linear-gradient(135deg,#1d4ed8,#0891b2)!important}
        .stat-block:hover{transform:scale(1.06);background:rgba(59,130,246,0.08)!important}
        .pill-btn:hover{background:rgba(59,130,246,0.18)!important;border-color:#3b82f6!important;color:#93c5fd!important}
        .btn-secondary:hover{background:rgba(59,130,246,0.12)!important;border-color:#60a5fa!important;box-shadow:0 0 20px rgba(59,130,246,0.25)!important}
        .btn-primary:hover{transform:translateY(-2px) scale(1.03)!important;box-shadow:0 8px 28px rgba(37,99,235,0.5)!important}
      `}</style>
    </div>
  );
}

function SectionHead({ title, count }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"24px" }}>
      <h2 style={{ fontSize:"20px", fontWeight:"800", color:"#f1f5f9" }}>{title}</h2>
      <span style={{ background:"rgba(59,130,246,0.15)", color:"#60a5fa", padding:"3px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", border:"1px solid rgba(59,130,246,0.25)" }}>{count} items</span>
    </div>
  );
}

function Grid({ products, onCart }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(248px,1fr))", gap:"20px" }}>
      {products.map(p => <ProductCard key={p.id} p={p} onCart={onCart} />)}
    </div>
  );
}

function Empty({ icon, text, hint }) {
  return (
    <div style={{ background:"rgba(59,130,246,0.04)", border:"1.5px dashed rgba(59,130,246,0.2)", borderRadius:"16px", padding:"48px", textAlign:"center" }}>
      <p style={{ fontSize:"36px", marginBottom:"12px" }}>{icon}</p>
      <p style={{ color:"#60a5fa", fontSize:"15px", fontWeight:"600", marginBottom:"6px" }}>{text}</p>
      {hint && <p style={{ color:"#475569", fontSize:"13px" }}>{hint}</p>}
    </div>
  );
}

function ProductCard({ p, onCart }) {
  return (
    <div className="pcard" style={s.card}>
      <div style={{ position:"relative", overflow:"hidden" }}>
        <img src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} alt={p.name}
          style={{ width:"100%", height:"196px", objectFit:"cover", display:"block", transition:"transform 0.4s" }} />
        {p.stock === 0 && <div style={s.soldBadge}>Sold Out</div>}
        {p.category && <div style={s.catTag}>{p.category.name}</div>}
        {p.stock > 0 && p.stock <= 3 && <div style={s.urgentTag}>Only {p.stock} left</div>}
      </div>
      <div style={s.cardBody}>
        <h4 style={s.cardName}>{p.name}</h4>
        <p style={s.cardDesc}>{p.description || ""}</p>
        <div style={s.cardFoot}>
          <div>
            <span style={s.price}>Rs. {Number(p.price).toLocaleString()}</span>
            {p.stock > 3 && p.stock <= 5 && <span style={s.lowStock}>Only {p.stock} left!</span>}
          </div>
          <button className="cta-btn" style={{ ...s.cartBtn, ...(p.stock===0 ? s.cartOff : {}) }}
            onClick={() => onCart(p.id)} disabled={p.stock===0}>
            {p.stock === 0 ? "Sold Out" : "+ Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background:"#0a0e1a", minHeight:"100vh" },
  toast: { position:"fixed", top:"80px", right:"24px", color:"#fff", padding:"12px 22px", borderRadius:"10px", fontWeight:"600", fontSize:"14px", zIndex:9999, boxShadow:"0 4px 20px rgba(37,99,235,0.5)" },

  // Hero
  hero: { position:"relative", minHeight:"94vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden", borderBottom:"1px solid #1e293b" },
  glowTL: { position:"absolute", top:"-80px", left:"-80px", width:"520px", height:"520px", borderRadius:"50%", background:"radial-gradient(circle,rgba(30,64,175,0.14) 0%,transparent 70%)", pointerEvents:"none", animation:"floatA 10s ease-in-out infinite" },
  glowBR: { position:"absolute", bottom:"-100px", right:"-60px", width:"480px", height:"480px", borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 70%)", pointerEvents:"none", animation:"floatB 12s ease-in-out infinite" },
  glowC:  { position:"absolute", top:"40%", left:"50%", transform:"translate(-50%,-50%)", width:"600px", height:"300px", borderRadius:"50%", background:"radial-gradient(ellipse,rgba(59,130,246,0.07) 0%,transparent 70%)", pointerEvents:"none" },

  heroInner: { position:"relative", zIndex:2, textAlign:"center", maxWidth:"820px", padding:"48px 24px 24px", animation:"fadeUp 0.8s ease both" },

  badge: { display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(59,130,246,0.1)", color:"#93c5fd", padding:"7px 18px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", marginBottom:"28px", border:"1px solid rgba(59,130,246,0.25)", letterSpacing:"2px", textTransform:"uppercase", backdropFilter:"blur(8px)" },
  badgeDot: { width:"7px", height:"7px", borderRadius:"50%", background:"#3b82f6", display:"inline-block", animation:"pulse 2s infinite", boxShadow:"0 0 8px rgba(59,130,246,0.9)" },

  heroTitle: { margin:"0 0 20px", lineHeight:1.05 },
  titleLine1: { display:"block", fontSize:"clamp(18px,3vw,28px)", fontWeight:"300", color:"#94a3b8", letterSpacing:"4px", textTransform:"uppercase", marginBottom:"8px" },
  titleLine2: { display:"block", fontSize:"clamp(52px,9vw,96px)", fontWeight:"900", letterSpacing:"-3px", background:"linear-gradient(135deg,#ffffff 0%,#60a5fa 50%,#22d3ee 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 4px 32px rgba(59,130,246,0.4))" },

  heroSub: { color:"#94a3b8", fontSize:"17px", margin:"0 0 36px", lineHeight:1.75, fontWeight:"300", maxWidth:"560px", marginLeft:"auto", marginRight:"auto" },

  ctaRow: { display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", marginBottom:"48px" },
  btnPrimary: { className:"btn-primary", padding:"14px 32px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", color:"#fff", border:"none", borderRadius:"14px", fontWeight:"700", fontSize:"15px", letterSpacing:"0.3px", boxShadow:"0 4px 20px rgba(37,99,235,0.4)", transition:"all 0.3s ease", cursor:"pointer" },
  btnSecondary: { className:"btn-secondary", padding:"14px 32px", background:"transparent", color:"#93c5fd", border:"1.5px solid rgba(59,130,246,0.4)", borderRadius:"14px", fontWeight:"600", fontSize:"15px", letterSpacing:"0.3px", transition:"all 0.3s ease", cursor:"pointer", backdropFilter:"blur(8px)" },

  statsCard: { display:"inline-flex", alignItems:"center", background:"rgba(15,23,42,0.8)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:"20px", padding:"20px 40px", backdropFilter:"blur(16px)", boxShadow:"0 0 0 1px rgba(59,130,246,0.08), 0 8px 32px rgba(0,0,0,0.4)", marginBottom:"36px" },
  statWrap: { display:"flex", alignItems:"center" },
  stat: { className:"stat-block", display:"flex", flexDirection:"column", alignItems:"center", padding:"0 28px", borderRadius:"12px", transition:"all 0.3s ease", cursor:"default" },
  statNum: { fontSize:"28px", fontWeight:"900", color:"#f1f5f9", letterSpacing:"-1px", lineHeight:1 },
  statLabel: { fontSize:"11px", color:"#64748b", textTransform:"uppercase", letterSpacing:"1.5px", marginTop:"5px" },
  statDiv: { width:"1px", height:"40px", background:"linear-gradient(to bottom,transparent,rgba(59,130,246,0.3),transparent)" },
  comingSoon: { fontSize:"12px", fontWeight:"700", color:"#06b6d4", background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.3)", padding:"4px 10px", borderRadius:"8px", letterSpacing:"1px" },

  pills: { display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap" },
  pill: { className:"pill-btn", display:"flex", alignItems:"center", gap:"7px", padding:"10px 22px", background:"rgba(255,255,255,0.04)", color:"#cbd5e1", border:"1px solid #1e293b", borderRadius:"50px", fontWeight:"600", fontSize:"13px", backdropFilter:"blur(8px)", transition:"all 0.3s ease", letterSpacing:"0.3px" },

  scrollIndicator: { position:"absolute", bottom:"28px", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", zIndex:2 },
  scrollText: { fontSize:"10px", color:"#475569", letterSpacing:"2px", textTransform:"uppercase" },
  scrollArrow: { fontSize:"16px", color:"#3b82f6", animation:"scrollBounce 1.6s ease-in-out infinite" },

  // Search
  searchBar: { background:"#0b1120", borderBottom:"1px solid #1e293b", padding:"14px 24px", boxShadow:"0 2px 12px rgba(0,0,0,0.3)" },
  searchForm: { display:"flex", gap:"8px", maxWidth:"700px", margin:"0 auto" },
  searchWrap: { flex:1, position:"relative", display:"flex", alignItems:"center" },
  searchIcon: { position:"absolute", left:"14px", fontSize:"15px", pointerEvents:"none" },
  searchInput: { width:"100%", padding:"12px 14px 12px 42px", border:"1.5px solid #1e293b", borderRadius:"10px", fontSize:"14px", outline:"none", color:"#e2e8f0", background:"rgba(59,130,246,0.06)", transition:"border 0.3s" },
  searchBtn: { padding:"12px 24px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", color:"#fff", border:"none", borderRadius:"10px", fontWeight:"700", whiteSpace:"nowrap", boxShadow:"0 4px 14px rgba(37,99,235,0.35)", letterSpacing:"0.3px" },
  clearBtn: { padding:"12px 16px", background:"rgba(239,68,68,0.08)", color:"#f87171", border:"1px solid rgba(239,68,68,0.25)", borderRadius:"10px", fontWeight:"600" },

  // Content
  container: { maxWidth:"1280px", margin:"0 auto", padding:"52px 24px" },
  section: { marginBottom:"72px" },

  // Category banner
  catBanner: { borderRadius:"18px", padding:"28px 32px", marginBottom:"24px", display:"flex", justifyContent:"space-between", alignItems:"center", border:"1px solid #1e293b", boxShadow:"0 8px 32px rgba(0,0,0,0.35)" },
  catLeft: { display:"flex", alignItems:"center", gap:"18px" },
  catIcon: { width:"52px", height:"52px", borderRadius:"14px", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px", flexShrink:0 },
  catName: { color:"#f1f5f9", fontSize:"22px", fontWeight:"800", margin:"0 0 4px", letterSpacing:"-0.5px" },
  catDesc: { color:"#64748b", fontSize:"13px", margin:0 },
  catRight: { display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px" },
  catPill: { background:"rgba(59,130,246,0.12)", color:"#93c5fd", padding:"6px 16px", borderRadius:"20px", fontSize:"12px", fontWeight:"700", border:"1px solid rgba(59,130,246,0.2)" },
  catAvail: { color:"#475569", fontSize:"12px" },

  // Cards
  card: { background:"#0f172a", borderRadius:"16px", overflow:"hidden", border:"1px solid #1e293b", display:"flex", flexDirection:"column", transition:"transform 0.3s, box-shadow 0.3s, border-color 0.3s" },
  soldBadge: { position:"absolute", top:"10px", left:"10px", background:"rgba(0,0,0,0.75)", color:"#94a3b8", fontSize:"11px", padding:"4px 10px", borderRadius:"6px", fontWeight:"700", backdropFilter:"blur(4px)" },
  catTag: { position:"absolute", top:"10px", right:"10px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", color:"#fff", fontSize:"10px", padding:"4px 10px", borderRadius:"6px", fontWeight:"700", textTransform:"uppercase", letterSpacing:"0.5px" },
  urgentTag: { position:"absolute", bottom:"10px", left:"10px", background:"rgba(220,38,38,0.85)", color:"#fff", fontSize:"10px", padding:"3px 8px", borderRadius:"4px", fontWeight:"700" },
  cardBody: { padding:"16px", display:"flex", flexDirection:"column", flex:1 },
  cardName: { fontSize:"14px", fontWeight:"700", color:"#f1f5f9", margin:"0 0 6px", lineHeight:1.4 },
  cardDesc: { fontSize:"12px", color:"#475569", margin:"0 0 14px", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", flex:1, lineHeight:1.5 },
  cardFoot: { display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"auto" },
  price: { fontSize:"18px", fontWeight:"900", color:"#60a5fa", display:"block", letterSpacing:"-0.5px" },
  lowStock: { fontSize:"11px", color:"#f59e0b", fontWeight:"600", display:"block", marginTop:"2px" },
  cartBtn: { padding:"9px 16px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", color:"#fff", border:"none", borderRadius:"8px", fontWeight:"700", fontSize:"13px", boxShadow:"0 4px 12px rgba(37,99,235,0.3)", transition:"background 0.3s", letterSpacing:"0.3px" },
  cartOff: { background:"#1e293b", color:"#475569", cursor:"not-allowed", boxShadow:"none" },

  // Loader
  loadBox: { textAlign:"center", padding:"100px 0" },
  spinner: { width:"44px", height:"44px", border:"3px solid rgba(59,130,246,0.15)", borderTop:"3px solid #3b82f6", borderRadius:"50%", margin:"0 auto", animation:"spin 0.8s linear infinite" },
  loadText: { color:"#475569", marginTop:"16px", fontSize:"14px" },

  // Footer
  footer: { background:"#060912", borderTop:"1px solid #1e293b", padding:"40px 24px" },
  footerInner: { maxWidth:"1280px", margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" },
  footerBrand: { display:"flex", alignItems:"center", gap:"14px" },
  footerLogo: { width:"44px", height:"44px", borderRadius:"12px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", color:"#fff", fontSize:"20px", fontWeight:"900", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(37,99,235,0.4)" },
  footerName: { color:"#e2e8f0", fontWeight:"800", fontSize:"16px", marginBottom:"2px" },
  footerTag: { color:"#475569", fontSize:"11px", textTransform:"uppercase", letterSpacing:"1px" },
  footerCopy: { color:"#334155", fontSize:"13px" },
};
