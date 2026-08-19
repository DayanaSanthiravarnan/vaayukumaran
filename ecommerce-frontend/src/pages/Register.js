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

  const inputStyle = {
    padding: "11px 14px", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)", fontSize: "14px", outline: "none",
    color: "var(--navy)", background: "#fff", transition: "border 0.2s",
    width: "100%", boxSizing: "border-box"
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
    }}>
      <div style={{
        width: "100%", maxWidth: "480px",
        background: "var(--surface)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
        overflow: "hidden"
      }}>
        {/* Top accent bar */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, var(--navy), var(--accent))" }} />

        <div style={{ padding: "40px 40px 36px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "var(--navy)", color: "#fff", fontSize: "22px",
              fontWeight: 900, display: "inline-flex", alignItems: "center",
              justifyContent: "center", marginBottom: "14px"
            }}>V</div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>
              Create account
            </h1>
            <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
              Join Vaayukumaaran — it's free
            </p>
          </div>

          {error && (
            <div style={{
              background: "var(--danger-bg)", border: "1px solid #FECACA",
              color: "var(--danger)", padding: "11px 14px", borderRadius: "var(--radius-sm)",
              fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px"
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Full Name</label>
                <input style={inputStyle} placeholder="Your name"
                  value={form.name} onChange={set("name")}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Username</label>
                <input style={inputStyle} placeholder="username"
                  value={form.username} onChange={set("username")}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  required />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Email Address</label>
              <input style={inputStyle} type="email" placeholder="you@example.com"
                value={form.email} onChange={set("email")}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
                required />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  type={showPwd ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password} onChange={set("password")}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  required
                />
                <button type="button"
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: "16px", padding: "4px", cursor: "pointer" }}
                  onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "13px", background: loading ? "var(--border)" : "var(--navy)",
                color: loading ? "var(--muted)" : "#fff", border: "none",
                borderRadius: "var(--radius-sm)", fontSize: "15px", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", marginTop: "4px",
                transition: "var(--transition)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
            >
              {loading && <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>Already have an account? </span>
            <Link to="/login" style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent)" }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
