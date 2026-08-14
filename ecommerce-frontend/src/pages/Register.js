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
      setError(!err.response ? "Cannot connect to server." : err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div style={s.page}>
      <div style={s.glow1} /><div style={s.glow2} />
      <div style={s.card}>
        {/* Left */}
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

        {/* Right */}
        <div style={s.right}>
          <div style={s.formWrap}>
            <h2 style={s.title}>Create account</h2>
            <p style={s.sub}>Fill in the details below to get started</p>
            {error && <div style={s.errorBox}>⚠ {error}</div>}
            <form onSubmit={handleSubmit} style={s.form}>
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>Full Name</label>
                  <input style={s.input} placeholder="John Doe" value={form.name} onChange={set("name")} required />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Username</label>
                  <input style={s.input} placeholder="johndoe" value={form.username} onChange={set("username")} required />
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Email Address</label>
                <input style={s.input} type="email" placeholder="john@example.com" value={form.email} onChange={set("email")} required />
              </div>
              <div style={s.field}>
                <label style={s.label}>Password</label>
                <div style={s.pwdWrap}>
                  <input style={{ ...s.input, paddingRight: "44px" }}
                    type={showPwd ? "text" : "password"} placeholder="Min. 6 characters"
                    value={form.password} onChange={set("password")} required />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <button style={{ ...s.btn, ...(loading ? s.btnOff : {}) }} type="submit" disabled={loading}>
                {loading
                  ? <span style={s.btnRow}><span style={s.spinner} /> Creating...</span>
                  : "Create Account →"}
              </button>
            </form>
            <div style={s.divider}><span style={s.divText}>Already have an account?</span></div>
            <Link to="/login" style={s.loginLink}>Sign in instead</Link>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:"#0a0e1a", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", position:"relative", overflow:"hidden" },
  glow1: { position:"absolute", top:"-100px", left:"-100px", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)", pointerEvents:"none" },
  glow2: { position:"absolute", bottom:"-80px", right:"-80px", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)", pointerEvents:"none" },
  card: { display:"flex", width:"100%", maxWidth:"920px", borderRadius:"24px", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.6)", border:"1px solid #1e293b", position:"relative", zIndex:1 },
  left: { flex:"0 0 360px", background:"linear-gradient(160deg,#0f172a 0%,#1e3a5f 100%)", padding:"52px 44px", display:"flex", alignItems:"center", borderRight:"1px solid #1e293b" },
  logoBox: { width:"52px", height:"52px", borderRadius:"14px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"20px", boxShadow:"0 4px 16px rgba(37,99,235,0.4)" },
  logoV: { color:"#fff", fontSize:"24px", fontWeight:"900" },
  leftTitle: { color:"#f1f5f9", fontSize:"24px", fontWeight:"800", marginBottom:"10px", letterSpacing:"-0.5px" },
  leftSub: { color:"#64748b", fontSize:"14px", lineHeight:"1.7", marginBottom:"36px" },
  steps: { display:"flex", flexDirection:"column", gap:"16px" },
  step: { display:"flex", alignItems:"center", gap:"12px" },
  stepNum: { width:"28px", height:"28px", borderRadius:"50%", background:"rgba(59,130,246,0.15)", border:"1px solid rgba(59,130,246,0.3)", color:"#60a5fa", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700", flexShrink:0 },
  stepText: { color:"#94a3b8", fontSize:"14px" },
  right: { flex:1, background:"#0b1120", padding:"48px", display:"flex", alignItems:"center" },
  formWrap: { width:"100%" },
  title: { fontSize:"24px", fontWeight:"800", color:"#f1f5f9", marginBottom:"6px", letterSpacing:"-0.5px" },
  sub: { color:"#475569", fontSize:"14px", marginBottom:"24px" },
  errorBox: { background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171", padding:"12px 16px", borderRadius:"10px", fontSize:"13px", marginBottom:"18px" },
  form: { display:"flex", flexDirection:"column", gap:"16px" },
  row: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" },
  field: { display:"flex", flexDirection:"column", gap:"7px" },
  label: { fontSize:"12px", fontWeight:"600", color:"#64748b", textTransform:"uppercase", letterSpacing:"0.5px" },
  input: { width:"100%", padding:"11px 14px", border:"1.5px solid #1e293b", borderRadius:"10px", fontSize:"14px", outline:"none", color:"#e2e8f0", background:"rgba(59,130,246,0.05)", transition:"border 0.3s" },
  pwdWrap: { position:"relative" },
  eyeBtn: { position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", fontSize:"16px", padding:"4px" },
  btn: { padding:"13px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", color:"#fff", border:"none", borderRadius:"10px", fontSize:"15px", fontWeight:"700", boxShadow:"0 4px 16px rgba(37,99,235,0.4)", transition:"all 0.3s" },
  btnOff: { opacity:0.6, cursor:"not-allowed" },
  btnRow: { display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" },
  spinner: { width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" },
  divider: { textAlign:"center", margin:"20px 0 14px" },
  divText: { color:"#334155", fontSize:"13px" },
  loginLink: { display:"block", textAlign:"center", padding:"11px", border:"1.5px solid #1e293b", borderRadius:"10px", fontSize:"14px", fontWeight:"600", color:"#60a5fa", background:"rgba(59,130,246,0.05)", transition:"all 0.3s" },
};
