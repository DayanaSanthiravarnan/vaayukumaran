import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await api.post("/auth/register", form); navigate("/login"); }
    catch (err) {
      if (!err.response) setError("Cannot connect to server. Please make sure the backend is running.");
      else setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.left}>
          <div>
            <div style={s.logoBox}><span style={s.logoV}>V</span></div>
            <h1 style={s.leftTitle}>Join Vaayukumaaran</h1>
            <p style={s.leftSub}>Create your free account and explore exclusive collections.</p>
            <div style={s.steps}>
              {["Create your account", "Browse our collections", "Order & enjoy fast delivery"].map((step, i) => (
                <div key={step} style={s.step}>
                  <div style={s.stepNum}>{i + 1}</div>
                  <span style={s.stepText}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={s.right}>
          <div style={s.formWrap}>
            <h2 style={s.title}>Create account ✨</h2>
            <p style={s.sub}>Fill in the details below to get started</p>
            {error && <div style={s.errorBox}>⚠ {error}</div>}
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.row}>
                <div style={s.field}><label style={s.label}>Full Name</label><input style={s.input} placeholder="John Doe" value={form.name} onChange={set("name")} required /></div>
                <div style={s.field}><label style={s.label}>Username</label><input style={s.input} placeholder="johndoe" value={form.username} onChange={set("username")} required /></div>
              </div>
              <div style={s.field}><label style={s.label}>Email Address</label><input style={s.input} type="email" placeholder="john@example.com" value={form.email} onChange={set("email")} required /></div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <div style={s.pwdWrap}>
                  <input style={{ ...s.input, paddingRight: "44px" }} type={showPwd ? "text" : "password"} placeholder="Min. 6 characters" value={form.password} onChange={set("password")} required />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(!showPwd)}>{showPwd ? "🙈" : "👁"}</button>
                </div>
              </div>
              <button style={{ ...s.btn, ...(loading ? s.btnOff : {}) }} type="submit" disabled={loading}>
                {loading ? <span style={s.btnRow}><span style={s.spinner} /> Creating...</span> : "Create Account →"}
              </button>
            </form>
            <div style={s.divider}><span style={s.divText}>Already have an account?</span></div>
            <Link to="/login" style={s.loginLink}>Sign in instead</Link>
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
  left: { flex: "0 0 360px", background: "linear-gradient(160deg, #4c1d95 0%, #7c3aed 100%)", padding: "52px 44px", display: "flex", alignItems: "center" },
  logoBox: { width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.25)" },
  logoV: { color: "#fff", fontSize: "24px", fontWeight: "900" },
  leftTitle: { color: "#fff", fontSize: "24px", fontWeight: "800", marginBottom: "10px" },
  leftSub: { color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: "1.7", marginBottom: "36px" },
  steps: { display: "flex", flexDirection: "column", gap: "16px" },
  step: { display: "flex", alignItems: "center", gap: "12px" },
  stepNum: { width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0 },
  stepText: { color: "rgba(255,255,255,0.85)", fontSize: "14px" },
  right: { flex: 1, background: "#fff", padding: "48px", display: "flex", alignItems: "center" },
  formWrap: { width: "100%" },
  title: { fontSize: "24px", fontWeight: "800", color: "#1e1b4b", marginBottom: "6px" },
  sub: { color: "#a78bfa", fontSize: "14px", marginBottom: "24px" },
  errorBox: { background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "18px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#4c1d95" },
  input: { width: "100%", padding: "11px 14px", border: "1.5px solid #ddd6fe", borderRadius: "10px", fontSize: "14px", outline: "none", color: "#1e1b4b", background: "#faf5ff" },
  pwdWrap: { position: "relative" },
  eyeBtn: { position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: "16px", padding: "4px" },
  btn: { padding: "13px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "700", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" },
  btnOff: { opacity: 0.7, cursor: "not-allowed" },
  btnRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  spinner: { width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" },
  divider: { textAlign: "center", margin: "20px 0 14px" },
  divText: { color: "#a78bfa", fontSize: "13px" },
  loginLink: { display: "block", textAlign: "center", padding: "11px", border: "1.5px solid #ddd6fe", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "#7c3aed", background: "#faf5ff" },
};
