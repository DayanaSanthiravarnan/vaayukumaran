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
      setError(!err.response ? "Cannot connect to server." : "Invalid username or password.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
    }}>
      <div style={{
        width: "100%", maxWidth: "440px",
        background: "var(--surface)", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
        overflow: "hidden"
      }}>
        {/* Top accent bar */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, var(--navy), var(--accent))" }} />

        <div style={{ padding: "40px 40px 36px" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "var(--navy)", color: "#fff", fontSize: "22px",
              fontWeight: 900, display: "inline-flex", alignItems: "center",
              justifyContent: "center", marginBottom: "14px"
            }}>V</div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--navy)", margin: "0 0 4px" }}>
              Welcome back
            </h1>
            <p style={{ fontSize: "14px", color: "var(--muted)", margin: 0 }}>
              Sign in to Vaayukumaaran
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Username</label>
              <input
                style={{
                  padding: "11px 14px", border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-sm)", fontSize: "14px", outline: "none",
                  color: "var(--navy)", background: "#fff", transition: "border 0.2s",
                  width: "100%", boxSizing: "border-box"
                }}
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border)"}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{
                    padding: "11px 44px 11px 14px", border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-sm)", fontSize: "14px", outline: "none",
                    color: "var(--navy)", background: "#fff", transition: "border 0.2s",
                    width: "100%", boxSizing: "border-box"
                  }}
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
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
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "13px", color: "var(--muted)" }}>New to Vaayukumaaran? </span>
            <Link to="/register" style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent)" }}>
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
