import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ServerError from "../components/ServerError";

const CAT_META = {
  land:    { icon: "🏡", color: "#0F766E" },
  wedding: { icon: "💍", color: "#B7791F" },
  vehicle: { icon: "🚗", color: "#4F46E5" },
  sale:    { icon: "🏷️", color: "#0F766E" },
  default: { icon: "✦",  color: "#10233F" },
};
const getCat = (name = "") => {
  const l = name.toLowerCase();
  const key = Object.keys(CAT_META).find(k => l.includes(k));
  return key ? CAT_META[key] : CAT_META.default;
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
      setMsg({ text: "Added to cart!", type: "success" });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Error", type: "error" });
    }
    setTimeout(() => setMsg({ text: "", type: "" }), 2500);
  };

  const byCategory = {};
  allProducts.forEach(p => {
    const k = p.category?.name || "Other";
    if (!byCategory[k]) byCategory[k] = [];
    byCategory[k].push(p);
  });

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {msg.text && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 9999,
          background: msg.type === "success" ? "var(--success)" : "var(--danger)",
          color: "#fff", padding: "12px 20px", borderRadius: "var(--radius-sm)",
          fontWeight: 600, fontSize: "14px", boxShadow: "var(--shadow-md)",
          animation: "fadeUp 0.3s ease"
        }}>
          {msg.type === "success" ? "✓ " : "✕ "}{msg.text}
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        background: "linear-gradient(160deg, #10233F 0%, #1a3a5c 60%, #0F766E 100%)",
        padding: "80px 24px 64px", textAlign: "center"
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(255,255,255,0.1)", color: "#FEF3C7",
            padding: "6px 16px", borderRadius: "20px", fontSize: "12px",
            fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
            marginBottom: "24px", border: "1px solid rgba(255,255,255,0.15)"
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FCD34D", display: "inline-block" }} />
            Premium South Asian Marketplace
          </div>

          <h1 style={{
            fontSize: "clamp(36px,7vw,68px)", fontWeight: 900, color: "#FFFFFF",
            letterSpacing: "-2px", lineHeight: 1.05, marginBottom: "16px"
          }}>
            Vaayukumaaran
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.72)", fontSize: "17px", lineHeight: 1.7,
            marginBottom: "40px", fontWeight: 400
          }}>
            Trusted listings for Land, Weddings & Vehicles —<br />
            curated for the Tamil community.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "8px", maxWidth: "560px", margin: "0 auto 32px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>🔍</span>
              <input
                style={{
                  width: "100%", padding: "14px 14px 14px 44px",
                  border: "2px solid rgba(255,255,255,0.2)", borderRadius: "var(--radius-md)",
                  fontSize: "15px", outline: "none", background: "rgba(255,255,255,0.12)",
                  color: "#fff", backdropFilter: "blur(8px)",
                  boxSizing: "border-box"
                }}
                placeholder="Search listings..."
                value={search}
                onChange={e => { setSearch(e.target.value); if (!e.target.value) setSearchResults(null); }}
              />
            </div>
            <button style={{
              padding: "14px 24px", background: "#0F766E", color: "#fff",
              border: "none", borderRadius: "var(--radius-md)", fontWeight: 700,
              fontSize: "15px", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(15,118,110,0.4)"
            }} type="submit">Search</button>
            {searchResults !== null && (
              <button style={{
                padding: "14px 16px", background: "rgba(255,255,255,0.1)",
                color: "#fff", border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "var(--radius-md)", fontWeight: 600
              }} type="button" onClick={() => { setSearch(""); setSearchResults(null); }}>✕</button>
            )}
          </form>

          {/* Category pills */}
          {categories.length > 0 && (
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              {categories.map(cat => (
                <button key={cat.id}
                  onClick={() => document.getElementById(`cat-${cat.id}`)?.scrollIntoView({ behavior: "smooth" })}
                  style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "8px 18px", background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "50px", fontWeight: 600, fontSize: "13px",
                    backdropFilter: "blur(8px)", transition: "var(--transition)"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; }}
                >
                  {getCat(cat.name).icon} {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div style={{
          maxWidth: "960px", margin: "0 auto", padding: "20px 24px",
          display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap"
        }}>
          {[
            { icon: "✅", label: "Verified Listings" },
            { icon: "🔒", label: "Secure Transactions" },
            { icon: "🤝", label: "Trusted Community" },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>{t.icon}</span>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div style={{ background: "var(--bg)", padding: "32px 24px" }}>
        <div style={{
          maxWidth: "600px", margin: "0 auto",
          display: "flex", justifyContent: "center", gap: "0",
          background: "var(--surface)", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden"
        }}>
          {[
            { num: allProducts.length, label: "Listings" },
            { num: categories.length, label: "Categories" },
            { num: "100%", label: "Verified" },
          ].map((st, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center", padding: "20px 16px",
              borderRight: i < 2 ? "1px solid var(--border)" : "none"
            }}>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "var(--navy)", letterSpacing: "-1px" }}>
                {st.num}{typeof st.num === "number" ? "+" : ""}
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "1px", marginTop: "4px", fontWeight: 600 }}>
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── LISTINGS ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "8px 24px 64px" }}>
        {error && <ServerError message={error} />}

        {searchResults !== null && (
          <div style={{ marginBottom: "48px" }}>
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
                <section key={cat.id} id={`cat-${cat.id}`} style={{ marginBottom: "56px" }}>
                  {/* Category header */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "20px 24px", marginBottom: "20px",
                    background: "var(--surface)", borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
                    borderLeft: `4px solid ${cm.color}`
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "var(--radius-sm)",
                        background: cm.color + "15", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "22px", flexShrink: 0
                      }}>
                        {cm.icon}
                      </div>
                      <div>
                        <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--navy)", margin: "0 0 2px" }}>{cat.name}</h2>
                        {cat.description && <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>{cat.description}</p>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        background: cm.color + "15", color: cm.color,
                        padding: "5px 14px", borderRadius: "20px",
                        fontSize: "12px", fontWeight: 700, border: `1px solid ${cm.color}30`
                      }}>
                        {prods.length} Listings
                      </span>
                      {prods.length > 0 && (
                        <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                          {prods.filter(p => p.stock > 0).length} available
                        </div>
                      )}
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
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: "40px", height: "40px", border: "3px solid var(--border)",
              borderTop: "3px solid var(--accent)", borderRadius: "50%",
              margin: "0 auto", animation: "spin 0.8s linear infinite"
            }} />
            <p style={{ color: "var(--muted)", marginTop: "16px", fontSize: "14px" }}>Loading listings...</p>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--navy)", padding: "40px 24px" }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "var(--accent)", color: "#fff", fontSize: "18px",
              fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center"
            }}>V</div>
            <div>
              <p style={{ color: "#fff", fontWeight: 800, fontSize: "15px", margin: 0 }}>Vaayukumaaran</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>Premium Marketplace</p>
            </div>
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>© 2024 Vaayukumaaran. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function SectionHead({ title, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
      <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--navy)" }}>{title}</h2>
      <span style={{
        background: "var(--accent-light)", color: "var(--accent)",
        padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700
      }}>{count} items</span>
    </div>
  );
}

function Grid({ products, onCart }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "20px" }}>
      {products.map(p => <ProductCard key={p.id} p={p} onCart={onCart} />)}
    </div>
  );
}

function Empty({ icon, text, hint }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1.5px dashed var(--border-dark)",
      borderRadius: "var(--radius-lg)", padding: "48px", textAlign: "center"
    }}>
      <p style={{ fontSize: "32px", marginBottom: "10px" }}>{icon}</p>
      <p style={{ color: "var(--body)", fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>{text}</p>
      {hint && <p style={{ color: "var(--muted)", fontSize: "13px" }}>{hint}</p>}
    </div>
  );
}

function ProductCard({ p, onCart }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)", borderRadius: "var(--radius-lg)",
        overflow: "hidden", border: "1px solid var(--border)",
        boxShadow: hovered ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transform: hovered ? "translateY(-4px)" : "none",
        transition: "var(--transition)", display: "flex", flexDirection: "column"
      }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <img
          src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"}
          alt={p.name}
          style={{ width: "100%", height: "188px", objectFit: "cover", display: "block", transition: "transform 0.4s", transform: hovered ? "scale(1.04)" : "scale(1)" }}
        />
        {p.stock === 0 && (
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ background: "var(--navy)", color: "#fff", padding: "6px 16px", borderRadius: "6px", fontWeight: 700, fontSize: "12px" }}>Sold Out</span>
          </div>
        )}
        {p.category && (
          <div style={{
            position: "absolute", top: "10px", right: "10px",
            background: "var(--navy)", color: "#fff",
            fontSize: "10px", padding: "4px 10px", borderRadius: "6px",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px"
          }}>{p.category.name}</div>
        )}
        {p.stock > 0 && p.stock <= 3 && (
          <div style={{
            position: "absolute", bottom: "10px", left: "10px",
            background: "var(--warning-bg)", color: "var(--warning)",
            fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontWeight: 700,
            border: "1px solid var(--warning)"
          }}>Only {p.stock} left</div>
        )}
      </div>

      <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", margin: "0 0 6px", lineHeight: 1.4 }}>{p.name}</h4>
        <p style={{
          fontSize: "12px", color: "var(--muted)", margin: "0 0 14px",
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", flex: 1, lineHeight: 1.5
        }}>{p.description || ""}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div>
            <span style={{ fontSize: "17px", fontWeight: 900, color: "var(--accent)", display: "block", letterSpacing: "-0.5px" }}>
              Rs. {Number(p.price).toLocaleString()}
            </span>
            {p.stock > 3 && p.stock <= 5 && (
              <span style={{ fontSize: "11px", color: "var(--amber)", fontWeight: 600 }}>Only {p.stock} left!</span>
            )}
          </div>
          <button
            style={{
              padding: "9px 16px",
              background: p.stock === 0 ? "var(--border)" : "var(--accent)",
              color: p.stock === 0 ? "var(--muted)" : "#fff",
              border: "none", borderRadius: "var(--radius-sm)",
              fontWeight: 700, fontSize: "13px",
              cursor: p.stock === 0 ? "not-allowed" : "pointer",
              transition: "var(--transition)",
              boxShadow: p.stock === 0 ? "none" : "0 2px 8px rgba(15,118,110,0.3)"
            }}
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
