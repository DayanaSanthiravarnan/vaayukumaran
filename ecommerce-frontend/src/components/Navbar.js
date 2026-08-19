import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const isAdmin = location.pathname.startsWith("/admin");

  const handleLogout = () => { logout(); navigate("/"); setMenuOpen(false); setDropOpen(false); };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/#listings", label: "Browse Listings" },
    { to: "/#categories", label: "Categories" },
  ];

  return (
    <nav style={s.nav}>
      <div style={s.inner}>
        {/* Logo */}
        <Link to="/" style={s.brand}>
          <div style={s.logoMark}>V</div>
          <div>
            <span style={s.brandName}>Vaayukumaaran</span>
            <span style={s.brandTag}>Marketplace</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={s.links}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{ ...s.link, ...(location.pathname === l.to ? s.linkActive : {}) }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={s.actions}>
          {user && (
            <Link to="/cart" style={s.cartBtn} title="Cart">
              🛒
            </Link>
          )}
          {!user ? (
            <>
              <Link to="/login" style={s.signInBtn}>Sign in</Link>
              <Link to="/register" style={s.registerBtn}>Get Started</Link>
            </>
          ) : (
            <div style={s.userMenu} onClick={() => setDropOpen(!dropOpen)}>
              <div style={s.avatar} title={user.username}>
                {user.username?.[0]?.toUpperCase()}
              </div>
              {dropOpen && (
                <div style={{ ...s.dropdown, display: "block" }}>
                  <div style={s.dropUser}>
                    <span style={s.dropName}>{user.name || user.username}</span>
                    <span style={s.dropRole}>{user.role}</span>
                  </div>
                  <div style={s.dropDivider} />
                  {user.role === "ADMIN" && (
                    <Link to="/admin" style={s.dropItem} onClick={() => setDropOpen(false)}>⚙ Admin Panel</Link>
                  )}
                  <Link to="/orders" style={s.dropItem} onClick={() => setDropOpen(false)}>📦 My Orders</Link>
                  <Link to="/profile" style={s.dropItem} onClick={() => setDropOpen(false)}>👤 Profile</Link>
                  <div style={s.dropDivider} />
                  <button style={s.dropLogout} onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button style={s.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={s.mobileMenu}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={s.mobileLink} onClick={() => setMenuOpen(false)}>{l.label}</Link>
          ))}
          {user ? (
            <>
              <Link to="/cart" style={s.mobileLink} onClick={() => setMenuOpen(false)}>🛒 Cart</Link>
              <Link to="/orders" style={s.mobileLink} onClick={() => setMenuOpen(false)}>📦 Orders</Link>
              <Link to="/profile" style={s.mobileLink} onClick={() => setMenuOpen(false)}>👤 Profile</Link>
              {user.role === "ADMIN" && <Link to="/admin" style={s.mobileLink} onClick={() => setMenuOpen(false)}>⚙ Admin</Link>}
              <button style={s.mobileLogout} onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" style={{ ...s.mobileLink, color: "var(--accent)", fontWeight: "700" }} onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const s = {
  nav: { background: "var(--navy)", position: "sticky", top: 0, zIndex: 1000, boxShadow: "0 1px 0 rgba(255,255,255,0.06)" },
  inner: { maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" },

  brand: { display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 },
  logoMark: { width: "36px", height: "36px", borderRadius: "10px", background: "var(--accent)", color: "#fff", fontSize: "18px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" },
  brandName: { display: "block", color: "#fff", fontWeight: "800", fontSize: "16px", letterSpacing: "-0.3px", lineHeight: 1.2 },
  brandTag: { display: "block", color: "rgba(255,255,255,0.4)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "1px" },

  links: { display: "flex", gap: "4px", flex: 1, justifyContent: "center" },
  link: { color: "rgba(255,255,255,0.65)", fontSize: "14px", fontWeight: "500", padding: "6px 12px", borderRadius: "8px", transition: "var(--transition)", textDecoration: "none" },
  linkActive: { color: "#fff", background: "rgba(255,255,255,0.08)" },

  actions: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
  cartBtn: { width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "#fff", textDecoration: "none", transition: "var(--transition)" },
  signInBtn: { color: "rgba(255,255,255,0.75)", fontSize: "14px", fontWeight: "500", padding: "7px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none", transition: "var(--transition)" },
  registerBtn: { color: "#fff", fontSize: "14px", fontWeight: "600", padding: "7px 16px", borderRadius: "8px", background: "var(--accent)", textDecoration: "none", transition: "var(--transition)" },

  userMenu: { position: "relative", display: "inline-block", cursor: "pointer" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "var(--accent)", color: "#fff", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" },
  dropdown: { position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-lg)", border: "1px solid var(--border)", minWidth: "200px", padding: "8px", display: "none", zIndex: 100 },
  dropUser: { padding: "8px 12px 12px" },
  dropName: { display: "block", fontWeight: "700", color: "var(--navy)", fontSize: "14px" },
  dropRole: { display: "block", fontSize: "11px", color: "var(--accent)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: "2px" },
  dropDivider: { height: "1px", background: "var(--border)", margin: "4px 0" },
  dropItem: { display: "block", padding: "8px 12px", fontSize: "14px", color: "var(--body)", borderRadius: "8px", textDecoration: "none", transition: "var(--transition)" },
  dropLogout: { display: "block", width: "100%", padding: "8px 12px", fontSize: "14px", color: "var(--danger)", background: "none", border: "none", textAlign: "left", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },

  hamburger: { display: "none", background: "none", border: "none", color: "#fff", fontSize: "20px", padding: "4px 8px" },

  mobileMenu: { background: "var(--navy)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "12px 24px 20px", display: "flex", flexDirection: "column", gap: "4px" },
  mobileLink: { color: "rgba(255,255,255,0.8)", fontSize: "15px", fontWeight: "500", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", textDecoration: "none" },
  mobileLogout: { color: "#f87171", background: "none", border: "none", fontSize: "15px", fontWeight: "600", padding: "10px 0", textAlign: "left", marginTop: "4px" },
};
