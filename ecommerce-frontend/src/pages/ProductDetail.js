import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ServerError from "../components/ServerError";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => setError("Product not found or server error."));
  }, [id]);

  const flash = (text, type = "success") => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(""), 2500);
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

  if (error) return <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "36px 24px" }}><ServerError message={error} /></div>;
  if (!product) return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "40px", height: "40px", border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "36px 0" }}>
      {msg && (
        <div style={{
          position: "fixed", top: "80px", right: "24px", zIndex: 9999,
          background: msgType === "success" ? "var(--success)" : "var(--danger)",
          color: "#fff", padding: "12px 20px", borderRadius: "var(--radius-sm)",
          fontWeight: 600, fontSize: "14px", boxShadow: "var(--shadow-md)", animation: "fadeUp 0.3s ease"
        }}>
          {msgType === "success" ? "✓ " : "✕ "}{msg}
        </div>
      )}

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 24px" }}>
        <button
          style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, fontSize: "14px", marginBottom: "20px", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}
          onClick={() => navigate(-1)}
        >← Back</button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)", overflow: "hidden" }}>
          {/* Image */}
          <div style={{ position: "relative", overflow: "hidden" }}>
            <img
              src={product.imageUrl || "https://via.placeholder.com/500x400?text=No+Image"}
              alt={product.name}
              style={{ width: "100%", height: "100%", minHeight: "420px", objectFit: "cover", display: "block" }}
            />
            {product.stock === 0 && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ background: "var(--navy)", color: "#fff", padding: "8px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}>Out of Stock</span>
              </div>
            )}
            {product.category && (
              <div style={{ position: "absolute", top: "14px", right: "14px", background: "var(--navy)", color: "#fff", fontSize: "11px", padding: "4px 10px", borderRadius: "6px", fontWeight: 700, textTransform: "uppercase" }}>
                {product.category.name}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ padding: "36px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--navy)", lineHeight: 1.2, margin: 0 }}>{product.name}</h1>

            {product.description && (
              <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.7, margin: 0 }}>{product.description}</p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "32px", fontWeight: 900, color: "var(--accent)" }}>
                Rs. {Number(product.price).toLocaleString()}
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span style={{ fontSize: "12px", color: "var(--amber)", fontWeight: 700, background: "var(--amber-light)", padding: "3px 10px", borderRadius: "20px" }}>
                  Only {product.stock} left!
                </span>
              )}
              {product.stock > 5 && (
                <span style={{ fontSize: "13px", color: "var(--success)", fontWeight: 600 }}>✓ In Stock</span>
              )}
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--success-bg)", border: "1px solid #BBF7D0", color: "#15803D", fontSize: "13px", fontWeight: 600, padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
              💵 Cash on Delivery available
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                style={{ flex: 1, padding: "14px", background: "#fff", color: "var(--navy)", border: "2px solid var(--navy)", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "15px", cursor: product.stock === 0 ? "not-allowed" : "pointer", opacity: product.stock === 0 ? 0.4 : 1, transition: "var(--transition)" }}
                onClick={addToCart}
                disabled={product.stock === 0}
              >🛒 Add to Cart</button>
              <button
                style={{ flex: 1, padding: "14px", background: product.stock === 0 ? "var(--border)" : "var(--navy)", color: product.stock === 0 ? "var(--muted)" : "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "15px", cursor: product.stock === 0 ? "not-allowed" : "pointer", transition: "var(--transition)" }}
                onClick={buyNow}
                disabled={product.stock === 0}
              >{product.stock === 0 ? "Out of Stock" : "Buy Now →"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
