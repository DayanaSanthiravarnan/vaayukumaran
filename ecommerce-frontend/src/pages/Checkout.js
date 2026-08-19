import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Checkout() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const product = state?.product;

  const [form, setForm] = useState({ fullName: "", phone: "", addressLine: "", city: "", pincode: "" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  if (!product) { navigate("/"); return null; }

  const shippingAddress = `${form.fullName}, ${form.phone}, ${form.addressLine}, ${form.city} - ${form.pincode}`;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOrder = async (e) => {
    e.preventDefault();
    const { fullName, phone, addressLine, city, pincode } = form;
    if (!fullName || !phone || !addressLine || !city || !pincode) return setError("Please fill all fields.");
    if (!/^\d{10}$/.test(phone)) return setError("Enter a valid 10-digit phone number.");
    if (!/^\d{6}$/.test(pincode)) return setError("Enter a valid 6-digit pincode.");
    setError(""); setPlacing(true);
    try {
      await api.post("/cart/add", { productId: product.id, quantity: 1 });
      await api.post("/orders/place", { shippingAddress });
      navigate("/orders", { state: { success: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order. Try again.");
    } finally { setPlacing(false); }
  };

  const inputStyle = {
    padding: "11px 14px", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)", fontSize: "14px", outline: "none",
    color: "var(--navy)", background: "#fff", width: "100%", boxSizing: "border-box",
    transition: "border 0.2s"
  };

  const fields = [
    { name: "fullName",    label: "Full Name",     placeholder: "Enter your full name" },
    { name: "phone",       label: "Phone Number",  placeholder: "10-digit mobile number" },
    { name: "addressLine", label: "Address",       placeholder: "House no, Street, Area" },
    { name: "city",        label: "City",          placeholder: "City / Town" },
    { name: "pincode",     label: "Pincode",       placeholder: "6-digit pincode" },
  ];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "36px 0" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px" }}>
        <button
          style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, fontSize: "14px", marginBottom: "16px", cursor: "pointer", padding: 0 }}
          onClick={() => navigate(-1)}
        >← Back</button>

        <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--navy)", marginBottom: "28px" }}>Checkout</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>

          {/* Delivery form */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", marginBottom: "20px" }}>📦 Delivery Details</h3>
            <form onSubmit={handleOrder} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {fields.map(({ name, label, placeholder }) => (
                <div key={name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>{label}</label>
                  <input
                    style={inputStyle}
                    name={name}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={handleChange}
                    onFocus={e => e.target.style.borderColor = "var(--accent)"}
                    onBlur={e => e.target.style.borderColor = "var(--border)"}
                    required
                  />
                </div>
              ))}

              {error && (
                <div style={{ background: "var(--danger-bg)", border: "1px solid #FECACA", color: "var(--danger)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: "13px" }}>
                  ⚠ {error}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "var(--success-bg)", border: "1px solid #BBF7D0", borderRadius: "var(--radius-sm)", padding: "14px" }}>
                <span style={{ fontSize: "24px" }}>💵</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "14px", color: "#15803D", margin: "0 0 2px" }}>Cash on Delivery</p>
                  <p style={{ fontSize: "12px", color: "#16A34A", margin: 0 }}>Pay when your order arrives</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing}
                style={{ padding: "14px", background: placing ? "var(--border)" : "var(--navy)", color: placing ? "var(--muted)" : "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "15px", cursor: placing ? "not-allowed" : "pointer", transition: "var(--transition)" }}
              >
                {placing ? "Placing Order..." : "Confirm Order →"}
              </button>
            </form>
          </div>

          {/* Order summary */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", position: "sticky", top: "80px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", marginBottom: "20px" }}>🛍 Order Summary</h3>

            <div style={{ display: "flex", gap: "14px", marginBottom: "16px", alignItems: "center" }}>
              <img
                src={product.imageUrl || "https://via.placeholder.com/80"}
                alt={product.name}
                style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", flexShrink: 0 }}
              />
              <div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--navy)", margin: "0 0 4px" }}>{product.name}</p>
                {product.category && <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0 }}>{product.category.name}</p>}
              </div>
            </div>

            <div style={{ height: "1px", background: "var(--border)", margin: "14px 0" }} />

            {[
              { label: "Price",    value: `Rs. ${Number(product.price).toLocaleString()}` },
              { label: "Shipping", value: "Free", valueStyle: { color: "var(--success)", fontWeight: 600 } },
              { label: "Payment",  value: "Cash on Delivery", valueStyle: { fontWeight: 600 } },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--muted)", marginBottom: "10px" }}>
                <span>{row.label}</span>
                <span style={row.valueStyle || {}}>{row.value}</span>
              </div>
            ))}

            <div style={{ height: "1px", background: "var(--border)", margin: "14px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--navy)" }}>Total</span>
              <span style={{ fontSize: "22px", fontWeight: 900, color: "var(--accent)" }}>
                Rs. {Number(product.price).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
