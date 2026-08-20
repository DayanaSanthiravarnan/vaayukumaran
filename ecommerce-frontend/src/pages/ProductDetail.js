import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ServerError from "../components/ServerError";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data);
        // Fetch related products (same category)
        if (r.data.category) {
          api.get(`/products?page=0&size=4&sortBy=id`)
            .then(res => setRelatedProducts(res.data.content?.filter(p => p.category?.id === r.data.category.id && p.id !== r.data.id) || []))
            .catch(() => {});
        }
      })
      .catch(() => setError("Product not found or server error."))
      .finally(() => setLoading(false));
  }, [id]);

  const flash = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: "", type: "" }), 2500);
  };

  const addToCart = async () => {
    if (!user) return navigate("/login");
    try {
      await api.post("/cart/add", { productId: product.id, quantity: 1 });
      flash("Added to cart!");
    } catch (err) {
      flash(err.response?.data?.message || "Error adding to cart", "error");
    }
  };

  const buyNow = () => {
    if (!user) return navigate("/login");
    navigate("/checkout", { state: { product } });
  };

  if (error) return <div style={{ minHeight: "100vh", padding: "var(--space-2xl) 0" }} className="container"><ServerError message={error} /></div>;
  if (loading || !product) return (
    <div className="container" style={{ minHeight: "100vh", padding: "var(--space-2xl) 0" }}>
      <div className="skeleton" style={{ height: "40px", width: "300px", marginBottom: "32px" }}></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
        <div className="skeleton" style={{ height: "500px", borderRadius: "var(--radius-lg)" }}></div>
        <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }}></div>
      </div>
    </div>
  );

  // Mocking a gallery using the single image URL for demo
  const images = [
    product.imageUrl || "https://via.placeholder.com/800x600?text=No+Image",
    product.imageUrl || "https://via.placeholder.com/800x600?text=No+Image",
    product.imageUrl || "https://via.placeholder.com/800x600?text=No+Image"
  ];

  return (
    <div style={{ backgroundColor: "var(--bg-ivory)", minHeight: "calc(100vh - var(--nav-height))", padding: "var(--space-xl) 0 var(--space-4xl)" }}>
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
        
        {/* Breadcrumbs */}
        <nav style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "var(--space-lg)" }}>
          <Link to="/" style={{ textDecoration: "underline" }}>Home</Link>
          <span style={{ margin: "0 8px" }}>/</span>
          <Link to="/listings" style={{ textDecoration: "underline" }}>Marketplace</Link>
          {product.category && (
            <>
              <span style={{ margin: "0 8px" }}>/</span>
              <Link to={`/listings?category=${product.category.name}`} style={{ textDecoration: "underline" }}>{product.category.name}</Link>
            </>
          )}
          <span style={{ margin: "0 8px" }}>/</span>
          <span style={{ color: "var(--text-charcoal)" }}>{product.name}</span>
        </nav>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: "var(--space-3xl)", alignItems: "start", marginBottom: "var(--space-4xl)" }}>
          
          {/* Left: Images */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ position: "relative", width: "100%", height: "500px", borderRadius: "var(--radius-lg)", overflow: "hidden", backgroundColor: "var(--bg-white)", border: "1px solid var(--border-light)" }}>
              <img src={images[activeImage]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {product.stock === 0 && (
                <div style={{ position: "absolute", top: "16px", left: "16px", backgroundColor: "var(--status-error)", color: "#fff", padding: "6px 12px", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: "14px" }}>
                  Sold Out
                </div>
              )}
            </div>
            {/* Thumbnails */}
            <div style={{ display: "flex", gap: "12px" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} style={{ width: "80px", height: "80px", borderRadius: "var(--radius-md)", overflow: "hidden", border: activeImage === i ? "2px solid var(--brand-forest)" : "2px solid transparent", padding: 0 }}>
                  <img src={img} alt={`Thumbnail ${i}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ backgroundColor: "var(--bg-white)", padding: "var(--space-xl)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                {product.category && <span style={{ backgroundColor: "var(--bg-ivory)", border: "1px solid var(--border-beige)", color: "var(--text-charcoal)", padding: "4px 12px", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600 }}>{product.category.name}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--status-success)", fontSize: "12px", fontWeight: 600 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg> Verified Listing</span>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button style={{ color: "var(--text-muted)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg></button>
                <button style={{ color: "var(--text-muted)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>
              </div>
            </div>

            <h1 className="text-editorial" style={{ fontSize: "32px", fontWeight: 600, margin: "0 0 16px", lineHeight: 1.2 }}>{product.name}</h1>
            
            <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "24px" }}>
              <span className="text-editorial" style={{ fontSize: "36px", fontWeight: 600, color: "var(--brand-forest)" }}>₹ {Number(product.price).toLocaleString()}</span>
              {product.stock > 0 && <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{product.stock} available</span>}
            </div>

            <div style={{ borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)", padding: "16px 0", marginBottom: "24px" }}>
              <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6 }}>{product.description || "No description provided."}</p>
            </div>

            {/* Static Specs Block */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
              <div>
                <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Location</span>
                <span style={{ fontSize: "15px" }}>Tamil Nadu, India</span>
              </div>
              <div>
                <span style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Condition</span>
                <span style={{ fontSize: "15px" }}>Excellent / Verified</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <button 
                  onClick={addToCart} 
                  disabled={product.stock === 0} 
                  className="btn-outline" 
                  style={{ flex: 1, height: "48px", borderColor: "var(--brand-forest)", color: "var(--brand-forest)" }}
                >
                  Add to Cart
                </button>
                <button 
                  onClick={buyNow} 
                  disabled={product.stock === 0} 
                  className="btn-primary" 
                  style={{ flex: 1, height: "48px" }}
                >
                  {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                </button>
              </div>
              <button className="btn-secondary" style={{ width: "100%", height: "48px", backgroundColor: "var(--bg-ivory)", color: "var(--text-charcoal)", border: "1px solid var(--border-beige)" }}>
                Enquire about listing
              </button>
            </div>
          </div>
        </div>

        {/* ── TRUST PANEL & SELLER INFO ── */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: "var(--space-3xl)", marginBottom: "var(--space-4xl)" }}>
          <div style={{ backgroundColor: "var(--bg-white)", padding: "var(--space-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)" }}>
            <h3 className="text-editorial" style={{ fontSize: "20px", marginBottom: "16px" }}>Seller Information</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "var(--bg-ivory)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border-beige)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>Verified Seller</div>
                <div style={{ fontSize: "14px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Member since 2023
                </div>
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: "var(--bg-ivory)", padding: "var(--space-lg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-beige)" }}>
            <h3 className="text-editorial" style={{ fontSize: "20px", marginBottom: "16px" }}>Buyer Protection</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "12px" }}>Your transaction is secure. We hold payment until you receive and verify the item.</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "14px", color: "var(--text-charcoal)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> 100% Secure Payment</li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--status-success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Verified Listing Data</li>
            </ul>
          </div>
        </div>

        {/* ── RELATED LISTINGS ── */}
        {relatedProducts.length > 0 && (
          <div>
            <h3 className="text-editorial" style={{ fontSize: "24px", marginBottom: "24px" }}>Similar Listings</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px" }}>
              {relatedProducts.map(p => (
                <div key={p.id} style={{ border: "1px solid var(--border-beige)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-white)" }}>
                  <div style={{ position: "relative", height: "180px", cursor: "pointer" }} onClick={() => navigate(`/product/${p.id}`)}>
                    <img src={p.imageUrl || "https://via.placeholder.com/300x200?text=No+Image"} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h4 className="text-editorial" style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 8px", cursor: "pointer" }} onClick={() => navigate(`/product/${p.id}`)}>{p.name}</h4>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "var(--brand-forest)", marginTop: "auto" }}>₹ {Number(p.price).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
