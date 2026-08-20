import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ServerError from "../components/ServerError";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/orders/my")
      .then(r => { setOrders(r.data); setError(""); })
      .catch(err => setError(!err.response ? "Cannot connect to server." : "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return { bg: "var(--bg-ivory)", color: "var(--brand-gold)" };
      case "CONFIRMED": return { bg: "#E0F2FE", color: "#0284C7" };
      case "SHIPPED": return { bg: "#FEF9C3", color: "#CA8A04" };
      case "DELIVERED": return { bg: "#DCFCE7", color: "#16A34A" };
      case "CANCELLED": return { bg: "#FEE2E2", color: "#DC2626" };
      default: return { bg: "var(--border-light)", color: "var(--text-muted)" };
    }
  };

  return (
    <div style={{ backgroundColor: "var(--bg-ivory)", minHeight: "calc(100vh - var(--nav-height))", padding: "var(--space-2xl) 0 var(--space-4xl)" }}>
      <div className="container">
        
        <div style={{ marginBottom: "var(--space-xl)", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="text-editorial" style={{ fontSize: "36px", margin: "0 0 8px" }}>Order History</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>View and track your recent purchases.</p>
          </div>
        </div>

        {error && <ServerError message={error} />}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: "200px", width: "100%", borderRadius: "var(--radius-lg)" }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ backgroundColor: "var(--bg-white)", border: "1px dashed var(--border-beige)", borderRadius: "var(--radius-lg)", padding: "80px 24px", textAlign: "center" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ color: "var(--text-muted)", marginBottom: "24px" }}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            <h2 className="text-editorial" style={{ fontSize: "28px", marginBottom: "12px" }}>No orders yet</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px", fontSize: "16px" }}>You haven't placed any orders. Start exploring the marketplace.</p>
            <Link to="/listings" className="btn-primary" style={{ padding: "14px 32px", fontSize: "16px" }}>Explore Listings</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              return (
                <div key={order.id} style={{ backgroundColor: "var(--bg-white)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                  
                  {/* Order Header */}
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)", backgroundColor: "#FCFAF7", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Order Placed</div>
                        <div style={{ fontSize: "15px", color: "var(--text-charcoal)", fontWeight: 500 }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Total Amount</div>
                        <div style={{ fontSize: "15px", color: "var(--brand-forest)", fontWeight: 600 }}>₹ {Number(order.totalAmount).toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Order ID</div>
                        <div style={{ fontSize: "15px", color: "var(--text-charcoal)", fontWeight: 500 }}>#VK-{order.id.toString().padStart(6, '0')}</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, padding: "6px 12px", borderRadius: "var(--radius-sm)", fontSize: "13px", fontWeight: 700, border: `1px solid ${statusStyle.color}40` }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: "0 24px" }}>
                    {order.orderItems?.map(item => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "24px", padding: "24px 0", borderBottom: "1px solid var(--border-light)" }}>
                        <img src={item.product?.imageUrl || "https://via.placeholder.com/100"} alt={item.product?.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-beige)" }} />
                        <div style={{ flex: 1 }}>
                          <Link to={`/product/${item.product?.id}`} className="text-editorial" style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-charcoal)", textDecoration: "none", display: "inline-block", marginBottom: "4px" }}>{item.product?.name}</Link>
                          <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>Quantity: {item.quantity}</div>
                        </div>
                        <div style={{ textAlign: "right", fontSize: "16px", fontWeight: 600, color: "var(--text-charcoal)" }}>
                          ₹ {(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "var(--bg-white)" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Shipping To</div>
                      <div style={{ fontSize: "14px", color: "var(--text-charcoal)", maxWidth: "300px" }}>{order.shippingAddress}</div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
