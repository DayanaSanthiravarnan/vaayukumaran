import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import ServerError from "../components/ServerError";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    setLoading(true);
    try { const r = await api.get("/cart"); setCart(r.data); setError(""); }
    catch (err) { setCart([]); if (!err.response) setError("Cannot connect to server."); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchCart(); }, []);

  const flash = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 2500); };
  const updateQty = async (id, qty) => { try { await api.put(`/cart/${id}`, { quantity: qty }); fetchCart(); } catch (err) { flash(err.response?.data?.message || "Error", "error"); } };
  const remove = async (id) => { try { await api.delete(`/cart/${id}`); fetchCart(); } catch (err) { flash(err.response?.data?.message || "Error", "error"); } };
  
  const placeOrder = async () => {
    if (!address.trim()) return flash("Please enter a shipping address", "error");
    setPlacing(true);
    try {
      await api.post("/orders/place", { shippingAddress: address });
      flash("Order placed! Redirecting...");
      setAddress(""); fetchCart();
      setTimeout(() => navigate("/orders"), 1800);
    } catch (err) { flash(err.response?.data?.message || "Error placing order", "error"); }
    finally { setPlacing(false); }
  };

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div style={{ backgroundColor: "var(--bg-ivory)", minHeight: "calc(100vh - var(--nav-height))", padding: "var(--space-2xl) 0 var(--space-4xl)" }}>
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
        
        <div style={{ marginBottom: "var(--space-xl)" }}>
          <h1 className="text-editorial" style={{ fontSize: "36px", margin: "0 0 8px" }}>Your Cart</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>{cart.length > 0 ? `You have ${cart.length} item${cart.length !== 1 ? "s" : ""} in your cart.` : "Your cart is currently empty."}</p>
        </div>

        {error && <ServerError message={error} />}

        {loading ? (
           <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "var(--space-2xl)" }}>
              <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }}></div>
              <div className="skeleton" style={{ height: "300px", borderRadius: "var(--radius-lg)" }}></div>
           </div>
        ) : cart.length === 0 ? (
          <div style={{ backgroundColor: "var(--bg-white)", border: "1px dashed var(--border-beige)", borderRadius: "var(--radius-lg)", padding: "80px 24px", textAlign: "center" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "var(--text-muted)", marginBottom: "24px" }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
            <h2 className="text-editorial" style={{ fontSize: "28px", marginBottom: "12px" }}>Your cart is empty</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "16px" }}>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/listings" className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>Continue Shopping</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)", gap: "var(--space-2xl)", alignItems: "start" }}>
            
            {/* Cart Items */}
            <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: "var(--space-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "16px", borderBottom: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: "14px", fontWeight: 600, textTransform: "uppercase" }}>
                <span style={{ flex: 2 }}>Product</span>
                <span style={{ flex: 1, textAlign: "center" }}>Quantity</span>
                <span style={{ flex: 1, textAlign: "right" }}>Total</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column" }}>
                {cart.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "24px 0", borderBottom: "1px solid var(--border-light)" }}>
                    {/* Product Info */}
                    <div style={{ flex: 2, display: "flex", alignItems: "center", gap: "16px" }}>
                      <img src={item.product.imageUrl || "https://via.placeholder.com/100"} alt={item.product.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-beige)" }} />
                      <div>
                        {item.product.category && <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>{item.product.category.name}</div>}
                        <Link to={`/product/${item.product.id}`} className="text-editorial" style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-charcoal)", display: "block", marginBottom: "4px" }}>{item.product.name}</Link>
                        <div style={{ color: "var(--brand-forest)", fontWeight: 600, fontSize: "14px" }}>₹ {Number(item.product.price).toLocaleString()}</div>
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-beige)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                        <button onClick={() => updateQty(item.id, item.quantity - 1)} style={{ width: "32px", height: "32px", backgroundColor: "var(--bg-ivory)", color: "var(--text-charcoal)", fontWeight: 600 }}>-</button>
                        <div style={{ width: "40px", textAlign: "center", fontSize: "14px", fontWeight: 600 }}>{item.quantity}</div>
                        <button onClick={() => updateQty(item.id, item.quantity + 1)} style={{ width: "32px", height: "32px", backgroundColor: "var(--bg-ivory)", color: "var(--text-charcoal)", fontWeight: 600 }}>+</button>
                      </div>
                    </div>

                    {/* Subtotal & Remove */}
                    <div style={{ flex: 1, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                      <div style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-charcoal)" }}>₹ {(item.product.price * item.quantity).toLocaleString()}</div>
                      <button onClick={() => remove(item.id)} style={{ color: "var(--status-error)", fontSize: "13px", textDecoration: "underline" }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary & Checkout */}
            <div style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", padding: "var(--space-xl)", position: "sticky", top: "calc(var(--nav-height) + var(--space-xl))" }}>
              <h3 className="text-editorial" style={{ fontSize: "24px", marginBottom: "24px" }}>Order Summary</h3>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "15px", color: "var(--text-charcoal)" }}>
                <span>Subtotal ({cart.length} items)</span>
                <span style={{ fontWeight: 600 }}>₹ {total.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", fontSize: "15px", color: "var(--text-charcoal)" }}>
                <span>Shipping</span>
                <span style={{ color: "var(--brand-forest)", fontWeight: 600 }}>Free</span>
              </div>
              
              <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "24px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "16px", fontWeight: 600 }}>Total</span>
                <span className="text-editorial" style={{ fontSize: "28px", fontWeight: 600, color: "var(--brand-forest)" }}>₹ {total.toLocaleString()}</span>
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Shipping Address</label>
                <textarea
                  style={{ width: "100%", padding: "12px", border: "1px solid var(--border-beige)", borderRadius: "var(--radius-sm)", fontSize: "15px", resize: "vertical", backgroundColor: "var(--bg-ivory)" }}
                  placeholder="Enter your full delivery address..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  rows={3}
                />
              </div>

              <button
                className="btn-primary"
                style={{ width: "100%", height: "54px", fontSize: "16px", fontWeight: 600 }}
                onClick={placeOrder}
                disabled={placing}
              >
                {placing ? "Processing..." : "Complete Checkout"}
              </button>
              
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "16px", color: "var(--text-muted)", fontSize: "13px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
                Secure Encrypted Checkout
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
