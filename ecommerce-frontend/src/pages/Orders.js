import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ServerError from "../components/ServerError";

const STATUS = {
  PENDING:   { color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "⏳" },
  CONFIRMED: { color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", icon: "✅" },
  SHIPPED:   { color: "#6d28d9", bg: "#ede9fe", border: "#c4b5fd", icon: "🚚" },
  DELIVERED: { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: "📦" },
  CANCELLED: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca", icon: "❌" },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try { const r = await api.get("/orders"); setOrders(r.data); setError(""); }
    catch (err) { setOrders([]); if (!err.response) setError("Cannot connect to server. Please make sure the backend is running."); }
  };
  useEffect(() => { fetchOrders(); }, []);

  const cancel = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      setMsg({ text: "Order cancelled successfully.", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000); fetchOrders();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Cannot cancel order", type: "error" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    }
  };

  return (
    <div style={s.page}>
      {msg.text && <div style={{ ...s.toast, background: msg.type === "success" ? "#7c3aed" : "#dc2626" }}>{msg.text}</div>}
      <div style={s.container}>
        <div style={s.pageHead}>
          <h2 style={s.pageTitle}>📦 My Orders</h2>
          {orders.length > 0 && <span style={s.badge}>{orders.length} order{orders.length !== 1 ? "s" : ""}</span>}
        </div>
        {error && <ServerError message={error} />}
        {!error && orders.length === 0 && (
          <div style={s.empty}>
            <div style={s.emptyIcon}>📋</div>
            <h3 style={s.emptyTitle}>No orders yet</h3>
            <p style={s.emptySub}>Your order history will appear here once you make a purchase.</p>
            <button style={s.shopBtn} onClick={() => navigate("/")}>Start Shopping</button>
          </div>
        )}
        <div style={s.list}>
          {orders.map((order) => {
            const sc = STATUS[order.status] || { color: "#64748b", bg: "#f8fafc", border: "#e2e8f0", icon: "•" };
            return (
              <div key={order.id} style={s.card}>
                <div style={s.cardHead}>
                  <div style={s.orderInfo}>
                    <span style={s.orderId}>Order #{order.id}</span>
                    <span style={s.dot}>·</span>
                    <span style={s.date}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <div style={s.headRight}>
                    <span style={{ ...s.statusBadge, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>{sc.icon} {order.status}</span>
                    {order.status === "PENDING" && <button style={s.cancelBtn} onClick={() => cancel(order.id)}>Cancel</button>}
                  </div>
                </div>
                <div style={s.addressRow}><span>📍</span><span style={s.addressText}>{order.shippingAddress}</span></div>
                <div style={s.itemsWrap}>
                  {order.orderItems.map((oi) => (
                    <div key={oi.id} style={s.itemRow}>
                      <span style={s.itemName}>{oi.product.name}</span>
                      <span style={s.itemQty}>× {oi.quantity}</span>
                      <span style={s.itemAmt}>Rs. {(oi.price * oi.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div style={s.cardFoot}>
                  <span style={s.footLabel}>{order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}</span>
                  <div style={s.totalWrap}>
                    <span style={s.totalLabel}>Order Total</span>
                    <span style={s.totalAmt}>Rs. {Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: "#f5f3ff", minHeight: "100vh", padding: "36px 0" },
  toast: { position: "fixed", top: "80px", right: "24px", color: "#fff", padding: "12px 22px", borderRadius: "10px", fontWeight: "600", fontSize: "14px", zIndex: 9999, boxShadow: "0 4px 20px rgba(124,58,237,0.4)" },
  container: { maxWidth: "860px", margin: "0 auto", padding: "0 24px" },
  pageHead: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" },
  pageTitle: { fontSize: "28px", fontWeight: "800", color: "#1e1b4b" },
  badge: { background: "#ede9fe", color: "#7c3aed", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" },
  empty: { background: "#fff", borderRadius: "20px", padding: "72px 40px", textAlign: "center", boxShadow: "0 2px 16px rgba(124,58,237,0.08)", border: "1px solid #ede9fe" },
  emptyIcon: { fontSize: "52px", marginBottom: "14px" },
  emptyTitle: { fontSize: "20px", fontWeight: "700", color: "#1e1b4b", marginBottom: "8px" },
  emptySub: { color: "#a78bfa", marginBottom: "24px", fontSize: "14px" },
  shopBtn: { padding: "12px 28px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { background: "#fff", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 16px rgba(124,58,237,0.08)", border: "1px solid #ede9fe" },
  cardHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #f5f3ff", flexWrap: "wrap", gap: "10px" },
  orderInfo: { display: "flex", alignItems: "center", gap: "8px" },
  orderId: { fontSize: "15px", fontWeight: "800", color: "#1e1b4b" },
  dot: { color: "#c4b5fd" },
  date: { fontSize: "13px", color: "#a78bfa" },
  headRight: { display: "flex", alignItems: "center", gap: "10px" },
  statusBadge: { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  cancelBtn: { padding: "6px 14px", background: "#fff", color: "#dc2626", border: "1.5px solid #dc2626", borderRadius: "8px", fontSize: "12px", fontWeight: "600" },
  addressRow: { display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 24px", background: "#faf5ff", borderBottom: "1px solid #f5f3ff", fontSize: "13px", color: "#7c6fa0" },
  addressText: { lineHeight: "1.5" },
  itemsWrap: { padding: "8px 24px" },
  itemRow: { display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px dashed #ede9fe" },
  itemName: { flex: 1, fontSize: "14px", color: "#334155" },
  itemQty: { fontSize: "13px", color: "#a78bfa", minWidth: "40px" },
  itemAmt: { fontSize: "14px", fontWeight: "700", color: "#4c1d95", minWidth: "90px", textAlign: "right" },
  cardFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", background: "#faf5ff", borderTop: "1px solid #ede9fe" },
  footLabel: { fontSize: "13px", color: "#a78bfa" },
  totalWrap: { display: "flex", alignItems: "center", gap: "10px" },
  totalLabel: { fontSize: "13px", color: "#7c6fa0" },
  totalAmt: { fontSize: "20px", fontWeight: "900", color: "#7c3aed" },
};
