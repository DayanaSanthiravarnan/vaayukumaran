import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ServerError from "../components/ServerError";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get("/categories"), api.get("/products?page=0&size=12&sortBy=id")])
      .then(([c, p]) => { setCategories(c.data); setFeaturedProducts(p.data.content || []); })
      .catch(err => setError(!err.response ? "Cannot connect to server." : "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/listings?search=${encodeURIComponent(search)}`);
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

  return (
    <div style={{ paddingBottom: "0" }}>
      {msg.text && (
        <div style={{
          position: "fixed", top: "100px", right: "24px", zIndex: 9999,
          backgroundColor: msg.type === "success" ? "var(--status-success)" : "var(--status-error)",
          color: "#fff", padding: "12px 24px", borderRadius: "var(--radius-sm)",
          fontWeight: 500, boxShadow: "var(--shadow-lg)", animation: "slide-up 0.3s ease"
        }}>
          {msg.text}
        </div>
      )}

      {/* ── SPLIT EDITORIAL HERO ── */}
      <section style={{ backgroundColor: "var(--bg-ivory)", paddingTop: "var(--space-xl)", paddingBottom: "var(--space-4xl)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-xl)", alignItems: "center" }}>
            
            {/* Left Content */}
            <div style={{ paddingRight: "var(--space-md)" }}>
              <div style={{ 
                display: "inline-block", padding: "4px 12px", border: "1px solid var(--border-beige)", 
                borderRadius: "var(--radius-full)", fontSize: "12px", fontWeight: 600, 
                color: "var(--brand-terra)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "var(--space-md)" 
              }}>
                Trusted Local Network
              </div>
              <h1 className="text-editorial" style={{ fontSize: "clamp(40px, 5vw, 64px)", fontWeight: 500, color: "var(--text-charcoal)", marginBottom: "var(--space-md)" }}>
                Everything important, found in one trusted marketplace.
              </h1>
              <p style={{ fontSize: "18px", color: "var(--text-muted)", marginBottom: "var(--space-xl)", maxWidth: "480px" }}>
                Discover verified land sales, premium wedding services, and quality vehicles directly from sellers in your community.
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={() => navigate("/listings")}>Explore Marketplace</button>
                <button className="btn-outline" onClick={() => navigate("/admin")}>Post a Listing</button>
              </div>
            </div>

            {/* Right Collage */}
            <div style={{ position: "relative", height: "480px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: "55%", height: "65%", top: "5%", left: "0", zIndex: 2, borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "4px solid var(--bg-white)" }}>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80" alt="Land" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", width: "50%", height: "70%", top: "20%", right: "0", zIndex: 1, borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "4px solid var(--bg-white)" }}>
                <img src="/wedding-couple.png" alt="Wedding" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "absolute", width: "55%", height: "40%", bottom: "0", left: "15%", zIndex: 3, borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "var(--shadow-lg)", border: "4px solid var(--bg-white)" }}>
                <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=500&q=80" alt="Vehicle" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLOATING SEARCH PANEL ── */}
      <div className="container" style={{ marginTop: "-60px", position: "relative", zIndex: 10 }}>
        <form onSubmit={handleSearch} style={{ 
          backgroundColor: "var(--bg-white)", padding: "16px", borderRadius: "var(--radius-lg)", 
          boxShadow: "var(--shadow-float)", display: "flex", gap: "12px", alignItems: "center", 
          flexWrap: "wrap", border: "1px solid var(--border-light)"
        }}>
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
              type="text" placeholder="What are you looking for?" 
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "14px 16px 14px 44px", border: "none", backgroundColor: "var(--bg-ivory)", borderRadius: "var(--radius-sm)", fontSize: "16px" }}
            />
          </div>
          <select style={{ flex: "1 1 200px", padding: "14px 16px", border: "none", backgroundColor: "var(--bg-ivory)", borderRadius: "var(--radius-sm)", fontSize: "16px", color: "var(--text-muted)" }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button type="submit" className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px", flex: "1 1 auto" }}>Search Listings</button>
        </form>
      </div>

      {/* ── CATEGORY SHOWCASE ── */}
      <section style={{ padding: "var(--space-4xl) 0" }}>
        <div className="container">
          <h2 className="text-editorial" style={{ fontSize: "32px", marginBottom: "var(--space-xl)", textAlign: "center" }}>Browse by Category</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            
            {/* Land Card */}
            <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "200px", overflow: "hidden" }}>
                <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80" alt="Land Sale" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 className="text-editorial" style={{ fontSize: "24px", marginBottom: "8px" }}>Land Sale</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "16px", flex: 1 }}>Residential plots, agricultural lands, and commercial spaces in prime locations.</p>
                <button onClick={() => navigate("/listings?category=Land")} className="btn-outline" style={{ width: "100%" }}>Browse Land</button>
              </div>
            </div>

            {/* Wedding Card */}
            <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "200px", overflow: "hidden" }}>
                <img src="/wedding-couple.png" alt="Weddings" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 className="text-editorial" style={{ fontSize: "24px", marginBottom: "8px" }}>Weddings</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "16px", flex: 1 }}>Traditional attire, jewelry, catering services, and elegant decorations.</p>
                <button onClick={() => navigate("/listings?category=Wedding")} className="btn-outline" style={{ width: "100%" }}>Browse Weddings</button>
              </div>
            </div>

            {/* Vehicles Card */}
            <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column" }}>
              <div style={{ height: "200px", overflow: "hidden" }}>
                <img src="https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&q=80" alt="Vehicles" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} onMouseEnter={e => e.target.style.transform = "scale(1.05)"} onMouseLeave={e => e.target.style.transform = "scale(1)"} />
              </div>
              <div style={{ padding: "24px", display: "flex", flexDirection: "column", flex: 1 }}>
                <h3 className="text-editorial" style={{ fontSize: "24px", marginBottom: "8px" }}>Vehicles</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", marginBottom: "16px", flex: 1 }}>Reliable cars, motorcycles, and commercial vehicles with verified details.</p>
                <button onClick={() => navigate("/listings?category=Vehicle")} className="btn-outline" style={{ width: "100%" }}>Browse Vehicles</button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ── */}
      <section style={{ backgroundColor: "var(--bg-white)", padding: "var(--space-4xl) 0", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-xl)" }}>
            <div>
              <h2 className="text-editorial" style={{ fontSize: "32px", marginBottom: "8px" }}>Recently Added</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>Discover the newest listings across all categories.</p>
            </div>
            <button className="btn-outline hide-mobile" onClick={() => navigate("/listings")}>View All Listings</button>
          </div>
          
          {error && <ServerError message={error} />}
          
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: "320px", borderRadius: "var(--radius-md)" }} />)}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
              {featuredProducts.map(p => (
                <div key={p.id} style={{ border: "1px solid var(--border-beige)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-white)", transition: "box-shadow 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ position: "relative", height: "200px", cursor: "pointer" }} onClick={() => navigate(`/product/${p.id}`)}>
                    <img src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    {p.category && (
                      <span style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "var(--bg-white)", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600, color: "var(--text-charcoal)", boxShadow: "var(--shadow-sm)" }}>
                        {p.category.name}
                      </span>
                    )}
                    {p.stock === 0 && (
                      <span style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "var(--status-error)", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600, color: "#fff" }}>
                        Sold Out
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h4 className="text-editorial" style={{ fontSize: "18px", fontWeight: 600, margin: 0, cursor: "pointer" }} onClick={() => navigate(`/product/${p.id}`)}>{p.name}</h4>
                      <span style={{ color: "var(--brand-gold)", display: "flex", alignItems: "center" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                      </span>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "18px", fontWeight: 600, color: "var(--brand-forest)" }}>₹ {Number(p.price).toLocaleString()}</span>
                      <button 
                        onClick={() => addToCart(p.id)} 
                        disabled={p.stock === 0}
                        style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: p.stock === 0 ? "var(--border-beige)" : "var(--brand-terra)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: p.stock === 0 ? "not-allowed" : "pointer" }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="hide-desktop" style={{ marginTop: "24px", textAlign: "center" }}>
            <button className="btn-outline" style={{ width: "100%" }} onClick={() => navigate("/listings")}>View All Listings</button>
          </div>
        </div>
      </section>

      {/* ── TRUST SECTION ── */}
      <section style={{ padding: "var(--space-4xl) 0" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", textAlign: "center" }}>
            {[
              { icon: "ShieldCheck", title: "Verified Listings", desc: "Every property and vehicle is verified for authenticity." },
              { icon: "Lock", title: "Secure Ordering", desc: "Your data and payments are protected with top security." },
              { icon: "MessageCircle", title: "Easy Communication", desc: "Connect directly with sellers without any hassle." },
              { icon: "HeartHandshake", title: "Responsive Support", desc: "Our local team is ready to assist you anytime." }
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "var(--radius-full)", backgroundColor: "var(--bg-ivory)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-forest)", marginBottom: "16px" }}>
                  {t.icon === "ShieldCheck" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>}
                  {t.icon === "Lock" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>}
                  {t.icon === "MessageCircle" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path></svg>}
                  {t.icon === "HeartHandshake" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>}
                </div>
                <h4 className="text-editorial" style={{ fontSize: "20px", marginBottom: "8px" }}>{t.title}</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "15px", maxWidth: "240px" }}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ backgroundColor: "var(--brand-forest)", padding: "var(--space-4xl) 0", color: "var(--bg-white)", textAlign: "center" }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <h2 className="text-editorial" style={{ fontSize: "36px", marginBottom: "16px", color: "var(--bg-white)" }}>Have something valuable to sell?</h2>
          <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)", marginBottom: "32px" }}>
            Reach thousands of potential buyers in the community. List your property, vehicle, or wedding service today.
          </p>
          <button className="btn-secondary" style={{ padding: "16px 32px", fontSize: "16px" }} onClick={() => navigate("/admin")}>Post Your Listing</button>
        </div>
      </section>

    </div>
  );
}
