import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await login(form.username, form.password); navigate("/"); }
    catch (err) {
      if (!err.response) setError("Cannot connect to server. Please make sure the backend is running.");
      else setError("Invalid username or password. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        {/* Left */}
        <div style={s.left}>
          <div style={s.leftInner}>
            <div style={s.logoBox}><span style={s.logoV}>V</span></div>
            <h1 style={s.leftTitle}>Vaayukumaaran</h1>
            <p style={s.leftSub}>Your royal destination for Wedding & Vehicle collections</p>
            <div style={s.features}>
              {[{ icon: "💍", text: "Exclusive Wedding Collections" },
                { icon: "🚗", text: "Premium Vehicle Accessories" },
                { icon: "🚚", text: "Free Shipping on All Orders" },
                { icon: "🔒", text: "100% Secure Checkout" }].map((f) => (
                <div key={f.text} style={s.feature}>
                  <div style={s.featureIcon}>{f.icon}</div>
                  <span style={s.featureText}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={s.right}>
          <div style={s.formWrap}>
            <h2 style={s.title}>Welcome back 👋</h2>
            <p style={s.sub}>Sign in to your account to continue</p>

            {error && <div style={s.errorBox}>⚠ {error}</div>}

            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.field}>
                <label style={s.label}>Username</label>
                <input style={s.input} placeholder="Enter your username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <div style={s.pwdWrap}>
                  <input style={{ ...s.input, paddingRight: "44px" }} type={showPwd ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(!showPwd)}>{showPwd ? "🙈" : "👁"}</button>
                </div>
              </div>
              <button style={{ ...s.btn, ...(loading ? s.btnOff : {}) }} type="submit" disabled={loading}>
                {loading ? <span style={s.btnRow}><span style={s.spinner} /> Signing in...</span> : "Sign In →"}
              </button>
            </form>

            <div style={s.divider}><span style={s.divText}>New to Vaayukumaaran?</span></div>
            <Link to="/register" style={s.regLink}>Create a free account</Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" },
  card: { display: "flex", width: "100%", maxWidth: "920px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" },
  left: { flex: "0 0 380px", background: "linear-gradient(160deg, #4c1d95 0%, #7c3aed 100%)", padding: "52px 44px", display: "flex", alignItems: "center" },
  leftInner: {},
  logoBox: { width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.25)" },
  logoV: { color: "#fff", fontSize: "24px", fontWeight: "900" },
  leftTitle: { color: "#fff", fontSize: "26px", fontWeight: "800", marginBottom: "10px", letterSpacing: "-0.5px" },
  leftSub: { color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: "1.7", marginBottom: "36px" },
  features: { display: "flex", flexDirection: "column", gap: "14px" },
  feature: { display: "flex", alignItems: "center", gap: "12px" },
  featureIcon: { width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 },
  featureText: { color: "rgba(255,255,255,0.85)", fontSize: "14px", fontWeight: "500" },

  right: { flex: 1, background: "#fff", padding: "52px 48px", display: "flex", alignItems: "center" },
  formWrap: { width: "100%" },
  title: { fontSize: "26px", fontWeight: "800", color: "#1e1b4b", marginBottom: "6px", letterSpacing: "-0.5px" },
  sub: { color: "#a78bfa", fontSize: "14px", marginBottom: "28px" },
  errorBox: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px" },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#4c1d95" },
  input: { width: "100%", padding: "12px 16px", border: "1.5px solid #ddd6fe", borderRadius: "10px", fontSize: "14px", outline: "none", color: "#1e1b4b", background: "#faf5ff" },
  pwdWrap: { position: "relative" },
  eyeBtn: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: "16px", padding: "4px" },
  btn: { padding: "14px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", boxShadow: "0 4px 16px rgba(124,58,237,0.4)", marginTop: "4px" },
  btnOff: { opacity: 0.7, cursor: "not-allowed" },
  btnRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  divider: { textAlign: "center", margin: "24px 0 16px" },
  divText: { color: "#a78bfa", fontSize: "13px" },
  regLink: { display: "block", textAlign: "center", padding: "12px", border: "1.5px solid #ddd6fe", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "#7c3aed", background: "#faf5ff" },
};
