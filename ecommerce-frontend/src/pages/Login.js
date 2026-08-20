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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", minHeight: "100vh" }}>
      
      {/* Left: Image / Brand Side */}
      <div className="hide-mobile" style={{ position: "relative", backgroundColor: "var(--brand-forest)", color: "var(--bg-white)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}>
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80" alt="Marketplace" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "var(--brand-forest)", mixBlendMode: "multiply" }}></div>
        </div>
        
        <div style={{ position: "relative", zIndex: 10 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", backgroundColor: "var(--bg-white)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)" }}>
              <span className="text-editorial" style={{ color: "var(--brand-forest)", fontSize: "20px", fontWeight: 600, fontStyle: "italic" }}>V</span>
            </div>
            <span className="text-editorial" style={{ fontSize: "24px", fontWeight: 600, color: "var(--bg-white)", lineHeight: 1 }}>
              Vaayukumaaran
            </span>
          </Link>
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: "400px" }}>
          <h2 className="text-editorial" style={{ fontSize: "40px", fontWeight: 500, lineHeight: 1.2, marginBottom: "16px" }}>Everything important, found in one trusted place.</h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.8)" }}>Sign in to connect with sellers, manage your listings, and explore verified lands, wedding services, and vehicles.</p>
        </div>
      </div>

      {/* Right: Form Side */}
      <div style={{ backgroundColor: "var(--bg-ivory)", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <div className="hide-desktop" style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
              <div style={{ width: "48px", height: "48px", backgroundColor: "var(--bg-white)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-beige)" }}>
                <span className="text-editorial" style={{ color: "var(--brand-forest)", fontSize: "24px", fontWeight: 600, fontStyle: "italic" }}>V</span>
              </div>
            </div>
            <h1 className="text-editorial" style={{ fontSize: "32px", color: "var(--text-charcoal)", marginBottom: "8px" }}>Welcome Back</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Please sign in to your account.</p>
          </div>

          {error && (
            <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "var(--status-error)", padding: "12px 16px", borderRadius: "var(--radius-sm)", fontSize: "14px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-charcoal)" }}>Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
                style={{ width: "100%", padding: "12px 16px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 600, marginBottom: "8px", color: "var(--text-charcoal)" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{ width: "100%", padding: "12px 16px", paddingRight: "48px" }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {showPwd ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", height: "48px", marginTop: "8px", fontSize: "16px" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "32px", fontSize: "15px", color: "var(--text-muted)" }}>
            Don't have an account? <Link to="/register" style={{ color: "var(--brand-forest)", fontWeight: 600, textDecoration: "underline" }}>Create one here</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
