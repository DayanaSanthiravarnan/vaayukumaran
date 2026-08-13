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
    catch (err) { setCart([]); if (!err.response) setError("Cannot connect to server. Please make sure the backend is running."); }
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
      flash("Order placed successfully! Redirecting...");
      setAddress(""); fetchCart();
      setTimeout(() => navigate("/orders"), 1800);
    } catch (err) { flash(err.response?.data?.message || "Error placing order", "error"); }
    finally { setPlacing(false); }
  };

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div style={s.page}>
      {msg.text && <div style={{ ...s.toast, background: msg.type === "success" ? "#7c3aed" : "#dc2626" }}>{msg.text}</div>}
      <div style={s.container}>
        <div style={s.pageHead}>
          <h2 style={s.pageTitle}>🛒 Shopping Cart</h2>
          {cart.length > 0 && <span style={s.badge}>{cart.length} item{cart.length !== 1 ? "s" : ""}</span>}
        </div>
        {error && <ServerError message={error} />}
        {!error && cart.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>🛒</div>
            <h3 style={s.emptyTitle}>Your cart is empty</h3>
            <p style={s.emptySub}>Looks like you haven't added anything yet.</p>
            <button style={s.browseBtn} onClick={() => navigate("/")}>Browse Products</button>
          </div>
        ) : !error && (
          <div style={s.layout}>
            <div style={s.itemsPanel}>
              <div style={s.panelHead}>
                <span style={s.panelTitle}>Cart Items</span>
                <button style={s.clearBtn} onClick={clearCart}>🗑 Clear all</button>
              </div>
              {cart.map((item) => (
                <div key={item.id} style={s.item}>
                  <img src={item.product.imageUrl || "https://via.placeholder.com/80"} alt={item.product.name} style={s.itemImg} />
                  <div style={s.itemInfo}>
                    <p style={s.itemName}>{item.product.name}</p>
                    {item.product.category && <p style={s.itemCat}>{item.product.category.name}</p>}
                    <p style={s.itemPrice}>Rs. {Number(item.product.price).toLocaleString()}</p>
                  </div>
                  <div style={s.qtyBox}>
                    <button style={s.qBtn} onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                    <span style={s.qNum}>{item.quantity}</span>
                    <button style={s.qBtn} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div style={s.itemRight}>
                    <p style={s.itemTotal}>Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                    <button style={s.removeBtn} onClick={() => remove(item.id)}>✕ Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={s.summary}>
              <h3 style={s.summaryTitle}>Order Summary</h3>
              <div style={s.summaryLines}>
                <div style={s.summaryLine}><span>Subtotal ({cart.length} items)</span><span>Rs. {total.toLocaleString()}</span></div>
                <div style={s.summaryLine}><span>Shipping</span><span style={{ color: "#7c3aed", fontWeight: "600" }}>FREE</span></div>
              </div>
              <div style={s.totalBox}>
                <span style={s.totalLabel}>Total Amount</span>
                <span style={s.totalAmt}>Rs. {total.toLocaleString()}</span>
              </div>
              <div style={s.addressBox}>
                <label style={s.addressLabel}>📍 Shipping Address</label>
                <textarea style={s.addressInput} placeholder="Enter your full delivery address..." value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
              </div>
              <button style={{ ...s.orderBtn, ...(placing ? s.orderBtnOff : {}) }} onClick={placeOrder} disabled={placing}>
                {placing ? "Placing Order..." : "Place Order →"}
              </button>
              <p style={s.secureNote}>🔒 Secure & encrypted checkout</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { background: "#f5f3ff", minHeight: "100vh", padding: "36px 0" },
  toast: { position: "fixed", top: "80px", right: "24px", color: "#fff", padding: "12px 22px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", zIndex: 9999, boxShadow: "0 4px 20px rgba(124,58,237,0.4)" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "0 24px" },
  pageHead: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" },
  pageTitle: { fontSize: "28px", fontWeight: "800", color: "#1e1b4b" },
  badge: { background: "#ede9fe", color: "#7c3aed", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" },
  empty: { background: "#fff", borderRadius: "20px", padding: "80px 40px", textAlign: "center", boxShadow: "0 2px 16px rgba(124,58,237,0.1)", border: "1px solid #ede9fe" },
  emptyIcon: { fontSize: "64px", marginBottom: "16px" },
  emptyTitle: { fontSize: "22px", fontWeight: "700", color: "#1e1b4b", marginBottom: "8px" },
  emptySub: { color: "#a78bfa", marginBottom: "28px", fontSize: "15px" },
  browseBtn: { padding: "13px 32px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" },
  layout: { display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" },
  itemsPanel: { background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(124,58,237,0.08)", border: "1px solid #ede9fe" },
  panelHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f5f3ff" },
  panelTitle: { fontWeight: "700", fontSize: "15px", color: "#1e1b4b" },
  clearBtn: { background: "none", border: "none", color: "#dc2626", fontSize: "13px", fontWeight: "500" },
  item: { display: "flex", alignItems: "center", gap: "16px", padding: "18px 24px", borderBottom: "1px solid #faf5ff" },
  itemImg: { width: "76px", height: "76px", objectFit: "cover", borderRadius: "10px", flexShrink: 0, border: "2px solid #ede9fe" },
  itemInfo: { flex: 1 },
  itemName: { fontWeight: "700", fontSize: "14px", color: "#1e1b4b", marginBottom: "3px" },
  itemCat: { fontSize: "11px", color: "#7c3aed", fontWeight: "600", textTransform: "uppercase", marginBottom: "4px" },
  itemPrice: { color: "#a78bfa", fontSize: "13px" },
  qtyBox: { display: "flex", alignItems: "center", gap: "4px" },
  qBtn: { width: "32px", height: "32px", border: "1.5px solid #ddd6fe", borderRadius: "8px", background: "#faf5ff", fontWeight: "700", fontSize: "16px", color: "#4c1d95" },
  qNum: { minWidth: "36px", textAlign: "center", fontWeight: "700", fontSize: "15px", color: "#1e1b4b" },
  itemRight: { textAlign: "right" },
  itemTotal: { fontWeight: "800", fontSize: "15px", color: "#4c1d95", marginBottom: "6px" },
  removeBtn: { background: "none", border: "none", color: "#a78bfa", fontSize: "12px", fontWeight: "500" },
  summary: { background: "#fff", borderRadius: "20px", padding: "24px", boxShadow: "0 2px 16px rgba(124,58,237,0.08)", border: "1px solid #ede9fe", position: "sticky", top: "80px" },
  summaryTitle: { fontSize: "17px", fontWeight: "800", color: "#1e1b4b", marginBottom: "20px" },
  summaryLines: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" },
  summaryLine: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#7c6fa0" },
  totalBox: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#faf5ff", borderRadius: "12px", padding: "14px 16px", marginBottom: "20px", border: "1px solid #ede9fe" },
  totalLabel: { fontSize: "14px", fontWeight: "600", color: "#4c1d95" },
  totalAmt: { fontSize: "22px", fontWeight: "900", color: "#7c3aed" },
  addressBox: { marginBottom: "16px" },
  addressLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#4c1d95", marginBottom: "8px" },
  addressInput: { width: "100%", padding: "11px 14px", border: "1.5px solid #ddd6fe", borderRadius: "10px", fontSize: "13px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit", color: "#1e1b4b", background: "#faf5ff", outline: "none" },
  orderBtn: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "15px", boxShadow: "0 4px 16px rgba(124,58,237,0.35)", marginBottom: "12px" },
  orderBtnOff: { opacity: 0.7, cursor: "not-allowed" },
  secureNote: { textAlign: "center", fontSize: "12px", color: "#a78bfa" },
};
