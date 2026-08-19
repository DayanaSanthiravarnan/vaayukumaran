import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ServerError from "../components/ServerError";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try { const r = await api.get("/cart"); setCart(r.data); setError(""); }
    catch (err) { setCart([]); if (!err.response) setError("Cannot connect to server."); }
  };
  useEffect(() => { fetchCart(); }, []);

  const flash = (text, type = "success") => { setMsg({ text, type }); setTimeout(() => setMsg({ text: "", type: "" }), 2500); };
  const updateQty = async (id, qty) => { try { await api.put(`/cart/${id}`, { quantity: qty }); fetchCart(); } catch (err) { flash(err.response?.data?.message || "Error", "error"); } };
  const remove = async (id) => { try { await api.delete(`/cart/${id}`); fetchCart(); } catch (err) { flash(err.response?.data?.message || "Error", "error"); } };
  const clearCart = async () => { try { await api.delete("/cart/clear"); fetchCart(); } catch (err) { flash(err.response?.data?.message || "Error", "error"); } };

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

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--navy)" }}>Shopping Cart</h2>
          {cart.length > 0 && (
            <span style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
              {cart.length} item{cart.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {error && <ServerError message={error} />}

        {!error && cart.length === 0 ? (
          <div style={{
            background: "var(--surface)", borderRadius: "var(--radius-lg)",
            padding: "80px 40px", textAlign: "center",
            border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)"
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🛒</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--navy)", marginBottom: "8px" }}>Your cart is empty</h3>
            <p style={{ color: "var(--muted)", marginBottom: "28px", fontSize: "14px" }}>Looks like you haven't added anything yet.</p>
            <button
              style={{ padding: "12px 28px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "14px" }}
              onClick={() => navigate("/")}
            >Browse Listings</button>
          </div>
        ) : !error && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>

            {/* Items panel */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontWeight: 700, fontSize: "15px", color: "var(--navy)" }}>Cart Items</span>
                <button
                  style={{ background: "none", border: "none", color: "var(--danger)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                  onClick={clearCart}
                >Clear all</button>
              </div>

              {cart.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
                  <img
                    src={item.product.imageUrl || "https://via.placeholder.com/80"}
                    alt={item.product.name}
                    style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0, border: "1px solid var(--border)" }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--navy)", margin: "0 0 3px" }}>{item.product.name}</p>
                    {item.product.category && (
                      <p style={{ fontSize: "11px", color: "var(--accent)", fontWeight: 600, textTransform: "uppercase", margin: "0 0 4px" }}>{item.product.category.name}</p>
                    )}
                    <p style={{ color: "var(--muted)", fontSize: "13px", margin: 0 }}>Rs. {Number(item.product.price).toLocaleString()} each</p>
                  </div>

                  {/* Qty controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <button
                      style={{ width: "30px", height: "30px", border: "1.5px solid var(--border)", borderRadius: "8px", background: "var(--bg)", fontWeight: 700, fontSize: "16px", color: "var(--navy)", cursor: "pointer" }}
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                    >−</button>
                    <span style={{ minWidth: "32px", textAlign: "center", fontWeight: 700, fontSize: "15px", color: "var(--navy)" }}>{item.quantity}</span>
                    <button
                      style={{ width: "30px", height: "30px", border: "1.5px solid var(--border)", borderRadius: "8px", background: "var(--bg)", fontWeight: 700, fontSize: "16px", color: "var(--navy)", cursor: "pointer" }}
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                    >+</button>
                  </div>

                  <div style={{ textAlign: "right", minWidth: "100px" }}>
                    <p style={{ fontWeight: 800, fontSize: "15px", color: "var(--accent)", margin: "0 0 6px" }}>
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "12px", cursor: "pointer" }}
                      onClick={() => remove(item.id)}
                    >✕ Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary panel */}
            <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", padding: "24px", position: "sticky", top: "80px" }}>
              <h3 style={{ fontSize: "17px", fontWeight: 800, color: "var(--navy)", marginBottom: "20px" }}>Order Summary</h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--body)" }}>
                  <span>Subtotal ({cart.length} items)</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--body)" }}>
                  <span>Shipping</span>
                  <span style={{ color: "var(--success)", fontWeight: 600 }}>FREE</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "14px 16px", marginBottom: "20px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--navy)" }}>Total</span>
                <span style={{ fontSize: "22px", fontWeight: 900, color: "var(--accent)" }}>Rs. {total.toLocaleString()}</span>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--body)", marginBottom: "8px" }}>📍 Shipping Address</label>
                <textarea
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "13px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", color: "var(--navy)", background: "#fff", outline: "none" }}
                  placeholder="Enter your full delivery address..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  rows={3}
                />
              </div>

              <button
                style={{ width: "100%", padding: "14px", background: placing ? "var(--border)" : "var(--navy)", color: placing ? "var(--muted)" : "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "15px", cursor: placing ? "not-allowed" : "pointer", marginBottom: "12px", transition: "var(--transition)" }}
                onClick={placeOrder}
                disabled={placing}
              >
                {placing ? "Placing Order..." : "Place Order →"}
              </button>

              <p style={{ textAlign: "center", fontSize: "12px", color: "var(--muted)" }}>🔒 Secure & encrypted checkout</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
