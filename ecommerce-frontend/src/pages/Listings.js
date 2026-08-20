import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ServerError from "../components/ServerError";

export default function Listings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get("search") || "";
  const initialCategory = queryParams.get("category") || "";

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [availability, setAvailability] = useState("all"); // 'all', 'instock'

  const [msg, setMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    // Sync URL params to state
    const params = new URLSearchParams(location.search);
    setSearch(params.get("search") || "");
    setSelectedCategory(params.get("category") || "");
  }, [location.search]);

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.get("/categories"),
        search.trim() ? api.get(`/products/search?name=${encodeURIComponent(search)}`) : api.get(`/products?page=0&size=200&sortBy=${sortBy}`)
      ]);
      setCategories(catsRes.data);
      setProducts(search.trim() ? prodsRes.data : prodsRes.data.content || []);
    } catch (err) {
      setError(!err.response ? "Cannot connect to server." : "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    navigate({ search: params.toString() });
    setMobileFilterOpen(false);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("id");
    setAvailability("all");
    navigate("/listings");
    setMobileFilterOpen(false);
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

  // Client-side filtering for price, availability and category (if not searching by name only)
  const filteredProducts = products.filter(p => {
    if (selectedCategory && p.category?.name !== selectedCategory) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (availability === "instock" && p.stock <= 0) return false;
    return true;
  });

  return (
    <div style={{ backgroundColor: "var(--bg-ivory)", minHeight: "calc(100vh - var(--nav-height))", padding: "var(--space-xl) 0" }}>
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

      <div className="container">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-lg)" }}>
          <h1 className="text-editorial" style={{ fontSize: "36px" }}>Marketplace</h1>
          <button className="btn-outline hide-desktop" onClick={() => setMobileFilterOpen(true)} style={{ padding: "8px 16px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "8px", verticalAlign: "middle" }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            Filters
          </button>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2xl)", alignItems: "flex-start" }}>
          
          {/* Sidebar Filters (Desktop) */}
          <aside className="hide-mobile" style={{ flex: "0 0 280px", backgroundColor: "var(--bg-white)", padding: "var(--space-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", position: "sticky", top: "calc(var(--nav-height) + var(--space-xl))" }}>
            <form onSubmit={handleFilterSubmit}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h3 className="text-editorial" style={{ fontSize: "20px" }}>Filters</h3>
                <button type="button" onClick={clearFilters} style={{ color: "var(--text-muted)", fontSize: "14px", textDecoration: "underline" }}>Clear All</button>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Search Keyword</label>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="e.g. Toyota, Villa..." style={{ width: "100%", padding: "10px 12px" }} />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Category</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", cursor: "pointer" }}>
                    <input type="radio" name="category" checked={selectedCategory === ""} onChange={() => setSelectedCategory("")} />
                    All Categories
                  </label>
                  {categories.map(c => (
                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "15px", cursor: "pointer" }}>
                      <input type="radio" name="category" checked={selectedCategory === c.name} onChange={() => setSelectedCategory(c.name)} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Price Range (₹)</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: "100%", padding: "10px" }} />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: "100%", padding: "10px" }} />
                </div>
              </div>

              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)} style={{ width: "100%", padding: "10px 12px" }}>
                  <option value="all">Any Availability</option>
                  <option value="instock">Available Now</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ width: "100%" }}>Apply Filters</button>
            </form>
          </aside>

          {/* Main Content */}
          <main style={{ flex: 1 }}>
            
            {/* Results Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-lg)", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ fontSize: "15px", color: "var(--text-muted)" }}>
                Showing <strong>{filteredProducts.length}</strong> results {search && <span>for "<strong>{search}</strong>"</span>} {selectedCategory && <span>in <strong>{selectedCategory}</strong></span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <label style={{ fontSize: "14px", color: "var(--text-muted)" }}>Sort By:</label>
                <select value={sortBy} onChange={e => { setSortBy(e.target.value); fetchData(); }} style={{ padding: "8px 12px", border: "1px solid var(--border-beige)", borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-white)", fontSize: "14px" }}>
                  <option value="id">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {error && <ServerError message={error} />}

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: "360px", borderRadius: "var(--radius-md)" }} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ backgroundColor: "var(--bg-white)", border: "1px dashed var(--border-beige)", borderRadius: "var(--radius-lg)", padding: "64px 24px", textAlign: "center" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)", marginBottom: "16px" }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <h3 className="text-editorial" style={{ fontSize: "24px", marginBottom: "8px" }}>No listings found</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>We couldn't find any listings matching your current filters.</p>
                <button className="btn-outline" onClick={clearFilters}>Clear all filters</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
                {filteredProducts.map(p => (
                  <div key={p.id} style={{ border: "1px solid var(--border-beige)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-white)", transition: "box-shadow 0.2s ease" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "var(--shadow-md)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                    <div style={{ position: "relative", height: "220px", cursor: "pointer" }} onClick={() => navigate(`/product/${p.id}`)}>
                      <img src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {p.category && (
                        <span style={{ position: "absolute", top: "12px", left: "12px", backgroundColor: "var(--bg-white)", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600, color: "var(--text-charcoal)", boxShadow: "var(--shadow-sm)" }}>
                          {p.category.name}
                        </span>
                      )}
                      <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "rgba(255,255,255,0.9)", padding: "6px", borderRadius: "50%", cursor: "pointer", color: "var(--text-muted)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      </div>
                      {p.stock === 0 && (
                        <span style={{ position: "absolute", bottom: "12px", left: "12px", backgroundColor: "var(--status-error)", padding: "4px 8px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600, color: "#fff" }}>
                          Sold Out
                        </span>
                      )}
                    </div>
                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h4 className="text-editorial" style={{ fontSize: "20px", fontWeight: 600, margin: "0 0 8px", cursor: "pointer" }} onClick={() => navigate(`/product/${p.id}`)}>{p.name}</h4>
                      <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>{p.description}</p>
                      
                      <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "20px", fontWeight: 600, color: "var(--brand-forest)" }}>₹ {Number(p.price).toLocaleString()}</span>
                        <button 
                          onClick={() => addToCart(p.id)} 
                          disabled={p.stock === 0}
                          style={{ padding: "8px 16px", borderRadius: "var(--radius-sm)", backgroundColor: p.stock === 0 ? "var(--border-beige)" : "var(--brand-terra)", color: "#fff", display: "flex", alignItems: "center", gap: "8px", fontWeight: 500, cursor: p.stock === 0 ? "not-allowed" : "pointer" }}
                        >
                          {p.stock === 0 ? "Unavailable" : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 900, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: "85%", maxWidth: "360px", height: "100%", backgroundColor: "var(--bg-white)", padding: "24px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--border-beige)", paddingBottom: "16px" }}>
              <span className="text-editorial" style={{ fontSize: "20px", fontWeight: 600 }}>Filters</span>
              <button onClick={() => setMobileFilterOpen(false)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            </div>
            <form onSubmit={handleFilterSubmit}>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Search Keyword</label>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 12px" }} />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Category</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px" }}><input type="radio" name="mobile_category" checked={selectedCategory === ""} onChange={() => setSelectedCategory("")} /> All Categories</label>
                  {categories.map(c => (
                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "16px" }}><input type="radio" name="mobile_category" checked={selectedCategory === c.name} onChange={() => setSelectedCategory(c.name)} /> {c.name}</label>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Price Range (₹)</label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: "100%", padding: "10px" }} />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: "100%", padding: "10px" }} />
                </div>
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Availability</label>
                <select value={availability} onChange={e => setAvailability(e.target.value)} style={{ width: "100%", padding: "10px 12px" }}>
                  <option value="all">Any Availability</option>
                  <option value="instock">Available Now</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" className="btn-outline" onClick={clearFilters} style={{ flex: 1 }}>Clear</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
