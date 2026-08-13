import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/login"); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;
  const close = () => setMenuOpen(false);

  return (
    <>
      <nav style={s.nav}>
        <Link to="/" style={s.brand} onClick={close}>
          <div style={s.logoBox}><span style={s.logoV}>V</span></div>
          <div>
            <div style={s.brandName}>VaayuKumaaran</div>
            <div style={s.brandTagline}></div>
          </div>
        </Link>

        <div style={s.navLinks} className="nav-desktop">
          {[{ to: "/", label: "Home" },
            ...(user ? [
              { to: "/cart",    label: "🛒 Cart" },
              { to: "/orders",  label: "📦 Orders" },
              { to: "/profile", label: "Profile" },
              ...(user.role === "ADMIN" ? [{ to: "/admin", label: "⚙ Admin" }] : []),
            ] : [])
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{ ...s.navLink, ...(isActive(to) ? s.navLinkActive : {}) }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={s.navRight} className="nav-desktop">
          {user ? (
            <div style={s.userArea}>
              <div style={s.userAvatar}>{user.username?.[0]?.toUpperCase()}</div>
              <div style={s.userInfo}>
                <span style={s.userName}>{user.username}</span>
                {user.role === "ADMIN" && <span style={s.adminTag}>Admin</span>}
              </div>
              <button onClick={handleLogout} style={s.logoutBtn}>Sign out</button>
            </div>
          ) : (
            <div style={s.authBtns}>
              <Link to="/login" style={s.loginBtn}>Sign in</Link>
              <Link to="/register" style={s.registerBtn}>Get started</Link>
            </div>
          )}
        </div>

        <button style={s.hamburger} className="nav-mobile" onClick={() => setMenuOpen(!menuOpen)}>
          <span style={{ ...s.bar, ...(menuOpen ? s.b1 : {}) }} />
          <span style={{ ...s.bar, ...(menuOpen ? s.b2 : {}) }} />
          <span style={{ ...s.bar, ...(menuOpen ? s.b3 : {}) }} />
        </button>
      </nav>

      {menuOpen && (
        <div style={s.mobileMenu}>
          {[{ to: "/", label: "🏠 Home" },
            ...(user ? [
              { to: "/cart",    label: "🛒 Cart" },
              { to: "/orders",  label: "📦 Orders" },
              { to: "/profile", label: "👤 Profile" },
              ...(user.role === "ADMIN" ? [{ to: "/admin", label: "⚙ Admin" }] : []),
            ] : [
              { to: "/login",    label: "Sign in" },
              { to: "/register", label: "Get started →" },
            ])
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={close} style={s.mobileLink}>{label}</Link>
          ))}
          {user && (
            <>
              <div style={s.mobileDivider} />
              <button onClick={handleLogout} style={s.mobileLogout}>Sign out</button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .nav-desktop{display:none!important} .nav-mobile{display:flex!important} }
        @media (min-width: 769px) { .nav-mobile{display:none!important} }
        .nav-link-hover:hover { background: #ede9fe !important; color: #7c3aed !important; }
      `}</style>
    </>
  );
}

const s = {
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: "68px", background: "#fff", borderBottom: "2px solid #ede9fe", position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 2px 16px rgba(124,58,237,0.08)" },
  brand: { display: "flex", alignItems: "center", gap: "12px" },
  logoBox: { width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" },
  logoV: { color: "#fff", fontSize: "20px", fontWeight: "900" },
  brandName: { fontSize: "17px", fontWeight: "800", color: "#1e1b4b", letterSpacing: "-0.3px" },
  brandTagline: { fontSize: "10px", color: "#a78bfa", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" },
  navLinks: { display: "flex", alignItems: "center", gap: "2px" },
  navLink: { padding: "7px 14px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", color: "#6d28d9", transition: "all 0.15s" },
  navLinkActive: { color: "#7c3aed", background: "#ede9fe", fontWeight: "700" },
  navRight: { display: "flex", alignItems: "center" },
  userArea: { display: "flex", alignItems: "center", gap: "10px" },
  userAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700" },
  userInfo: { display: "flex", flexDirection: "column" },
  userName: { fontSize: "13px", fontWeight: "700", color: "#1e1b4b" },
  adminTag: { fontSize: "10px", fontWeight: "700", color: "#7c3aed", background: "#ede9fe", padding: "1px 6px", borderRadius: "4px", textTransform: "uppercase" },
  logoutBtn: { padding: "6px 14px", background: "transparent", border: "1.5px solid #ddd6fe", borderRadius: "8px", fontSize: "13px", fontWeight: "500", color: "#7c3aed" },
  authBtns: { display: "flex", gap: "8px", alignItems: "center" },
  loginBtn: { padding: "7px 16px", border: "1.5px solid #ddd6fe", borderRadius: "8px", fontSize: "14px", fontWeight: "500", color: "#6d28d9" },
  registerBtn: { padding: "7px 18px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", boxShadow: "0 2px 10px rgba(124,58,237,0.35)" },
  hamburger: { display: "none", flexDirection: "column", gap: "5px", background: "none", border: "none", padding: "6px" },
  bar: { display: "block", width: "22px", height: "2px", background: "#6d28d9", borderRadius: "2px", transition: "all 0.25s" },
  b1: { transform: "translateY(7px) rotate(45deg)" },
  b2: { opacity: 0 },
  b3: { transform: "translateY(-7px) rotate(-45deg)" },
  mobileMenu: { position: "fixed", top: "68px", left: 0, right: 0, background: "#fff", borderBottom: "2px solid #ede9fe", padding: "12px 20px 20px", zIndex: 999, boxShadow: "0 8px 24px rgba(124,58,237,0.12)", display: "flex", flexDirection: "column", gap: "2px", animation: "fadeIn 0.2s ease" },
  mobileLink: { display: "block", padding: "12px 16px", fontSize: "15px", fontWeight: "500", color: "#4c1d95", borderRadius: "8px" },
  mobileDivider: { height: "1px", background: "#ede9fe", margin: "8px 0" },
  mobileLogout: { padding: "12px 16px", background: "#faf5ff", color: "#7c3aed", border: "1px solid #ddd6fe", borderRadius: "8px", fontWeight: "600", fontSize: "14px", textAlign: "left" },
};
