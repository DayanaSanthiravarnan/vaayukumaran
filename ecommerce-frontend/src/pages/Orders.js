import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import ServerError from "../components/ServerError";

const STATUS = {
  PENDING:   { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "⏳", label: "Pending" },
  CONFIRMED: { color: "#0F766E", bg: "#F0FDF9", border: "#99F6E4", icon: "✅", label: "Confirmed" },
  SHIPPED:   { color: "#4F46E5", bg: "#EEF2FF", border: "#C7D2FE", icon: "🚚", label: "Shipped" },
  DELIVERED: { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", icon: "📦", label: "Delivered" },
  CANCELLED: { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: "✕",  label: "Cancelled" },
};

const TIMELINE = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try { const r = await api.get("/orders"); setOrders(r.data); setError(""); }
    catch (err) { setOrders([]); if (!err.response) setError("Cannot connect to server."); }
  };
  useEffect(() => { fetchOrders(); }, []);

  const cancel = async (id) => {
    try {
      await api.put(`/orders/${id}/cancel`);
      setMsg({ text: "Order cancelled.", type: "success" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
      fetchOrders();
    } catch (err) {
      setMsg({ text: err.response?.data?.message || "Cannot cancel order", type: "error" });
      setTimeout(() => setMsg({ text: "", type: "" }), 3000);
    }
  };

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

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--navy)" }}>My Orders</h2>
          {orders.length > 0 && (
            <span style={{ background: "var(--accent-light)", color: "var(--accent)", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {error && <ServerError message={error} />}

        {!error && orders.length === 0 && (
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "72px 40px", textAlign: "center", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: "48px", marginBottom: "14px" }}>📋</div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--navy)", marginBottom: "8px" }}>No orders yet</h3>
            <p style={{ color: "var(--muted)", marginBottom: "24px", fontSize: "14px" }}>Your order history will appear here once you make a purchase.</p>
            <button
              style={{ padding: "12px 28px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "14px", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >Start Shopping</button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map((order) => {
            const sc = STATUS[order.status] || STATUS.PENDING;
            const isCancelled = order.status === "CANCELLED";
            const timelineIdx = TIMELINE.indexOf(order.status);

            return (
              <div key={order.id} style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>

                {/* Card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--border)", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 800, color: "var(--navy)" }}>Order #{order.id}</span>
                    <span style={{ color: "var(--border-dark)" }}>·</span>
                    <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                      {sc.icon} {sc.label}
                    </span>
                    {order.status === "PENDING" && (
                      <button
                        style={{ padding: "5px 14px", background: "#fff", color: "var(--danger)", border: "1.5px solid var(--danger)", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                        onClick={() => cancel(order.id)}
                      >Cancel</button>
                    )}
                  </div>
                </div>

                {/* Status timeline */}
                {!isCancelled && (
                  <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                      {TIMELINE.map((step, i) => {
                        const done = i <= timelineIdx;
                        const active = i === timelineIdx;
                        const st = STATUS[step];
                        return (
                          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < TIMELINE.length - 1 ? 1 : "none" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                              <div style={{
                                width: "28px", height: "28px", borderRadius: "50%",
                                background: done ? (active ? st.color : "var(--accent)") : "var(--border)",
                                border: `2px solid ${done ? (active ? st.color : "var(--accent)") : "var(--border-dark)"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "12px", color: done ? "#fff" : "var(--muted)",
                                fontWeight: 700, flexShrink: 0,
                                boxShadow: active ? `0 0 0 3px ${st.color}25` : "none"
                              }}>
                                {done ? (i < timelineIdx ? "✓" : st.icon) : ""}
                              </div>
                              <span style={{ fontSize: "10px", fontWeight: done ? 700 : 400, color: done ? "var(--navy)" : "var(--muted)", whiteSpace: "nowrap" }}>
                                {st.label}
                              </span>
                            </div>
                            {i < TIMELINE.length - 1 && (
                              <div style={{ flex: 1, height: "2px", background: i < timelineIdx ? "var(--accent)" : "var(--border)", margin: "0 4px", marginBottom: "18px" }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Address */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 24px", borderBottom: "1px solid var(--border)", fontSize: "13px", color: "var(--muted)" }}>
                  <span>📍</span>
                  <span style={{ lineHeight: 1.5 }}>{order.shippingAddress}</span>
                </div>

                {/* Items */}
                <div style={{ padding: "8px 24px" }}>
                  {order.orderItems.map((oi) => (
                    <div key={oi.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px dashed var(--border)" }}>
                      <span style={{ flex: 1, fontSize: "14px", color: "var(--body)" }}>{oi.product.name}</span>
                      <span style={{ fontSize: "13px", color: "var(--muted)", minWidth: "40px" }}>× {oi.quantity}</span>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--navy)", minWidth: "90px", textAlign: "right" }}>
                        Rs. {(oi.price * oi.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 24px", background: "var(--bg)", borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "13px", color: "var(--muted)" }}>{order.orderItems.length} item{order.orderItems.length !== 1 ? "s" : ""}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "13px", color: "var(--muted)" }}>Order Total</span>
                    <span style={{ fontSize: "20px", fontWeight: 900, color: "var(--accent)" }}>
                      Rs. {Number(order.totalAmount).toLocaleString()}
                    </span>
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
