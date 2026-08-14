import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/login"); setMenuOpen(false); };
  const isActive = p => location.pathname === p;
  const close = () => setMenuOpen(false);

  const publicLinks = [
    { to: "/",          label: "Home" },
    { to: "/#listings", label: "Categories" },
    { to: "/about",     label: "About" },
    { to: "/contact",   label: "Contact" },
  ];

  const authLinks = user ? [
    { to: "/cart",    label: "🛒 Cart" },
    { to: "/orders",  label: "📦 Orders" },
    { to: "/profile", label: "Profile" },
    ...(user.role === "ADMIN" ? [{ to: "/admin", label: "⚙ Admin" }] : []),
  ] : [];

  return (
    <>
      <nav style={s.nav}>
        <Link to="/" style={s.brand} onClick={close}>
          <div style={s.logoBox}><span style={s.logoV}>V</span></div>
          <div>
            <div style={s.brandName}>Vaayukumaaran</div>
            <div style={s.brandTag}>Premium Marketplace</div>
          </div>
        </Link>

        <div style={s.links} className="nav-desktop">
          {[...publicLinks, ...authLinks].map(({ to, label }) => (
            <Link key={to} to={to}
              style={{ ...s.link, ...(isActive(to) ? s.linkActive : {}) }}>
              {label}
            </Link>
          ))}
        </div>

        <div style={s.right} className="nav-desktop">
          {user ? (
            <div style={s.userArea}>
              <div style={s.avatar}>{user.username?.[0]?.toUpperCase()}</div>
              <div style={s.userInfo}>
                <span style={s.userName}>{user.username}</span>
                {user.role === "ADMIN" && <span style={s.adminTag}>Admin</span>}
              </div>
              <button onClick={handleLogout} style={s.signOutBtn}>Sign out</button>
            </div>
          ) : (
            <div style={s.authBtns}>
              <Link to="/login" style={s.signInBtn} className="signin-btn">Sign in</Link>
              <Link to="/register" style={s.getStartedBtn}>Get started</Link>
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
          {[...publicLinks, ...authLinks,
            ...(user ? [] : [{ to: "/login", label: "Sign in" }, { to: "/register", label: "Get started →" }])
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
        @media(max-width:768px){.nav-desktop{display:none!important}.nav-mobile{display:flex!important}}
        @media(min-width:769px){.nav-mobile{display:none!important}}
        .signin-btn:hover{background:rgba(59,130,246,0.1)!important;border-color:#3b82f6!important;color:#93c5fd!important;box-shadow:0 0 16px rgba(59,130,246,0.2)!important}
        .nav-link:hover{color:#93c5fd!important;background:rgba(59,130,246,0.08)!important}
      `}</style>
    </>
  );
}

const s = {
  nav: { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", height:"66px", background:"rgba(10,14,26,0.95)", borderBottom:"1px solid #1e293b", position:"sticky", top:0, zIndex:1000, backdropFilter:"blur(16px)", boxShadow:"0 1px 0 #1e293b, 0 4px 24px rgba(0,0,0,0.4)" },
  brand: { display:"flex", alignItems:"center", gap:"12px" },
  logoBox: { width:"40px", height:"40px", borderRadius:"10px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(37,99,235,0.45)" },
  logoV: { color:"#fff", fontSize:"19px", fontWeight:"900" },
  brandName: { fontSize:"16px", fontWeight:"800", color:"#f1f5f9", letterSpacing:"-0.3px" },
  brandTag: { fontSize:"10px", color:"#475569", fontWeight:"500", letterSpacing:"1px", textTransform:"uppercase" },
  links: { display:"flex", alignItems:"center", gap:"2px" },
  link: { padding:"7px 13px", borderRadius:"8px", fontSize:"13px", fontWeight:"500", color:"#94a3b8", transition:"all 0.2s", letterSpacing:"0.2px" },
  linkActive: { color:"#60a5fa", background:"rgba(59,130,246,0.1)", fontWeight:"600" },
  right: { display:"flex", alignItems:"center" },
  userArea: { display:"flex", alignItems:"center", gap:"10px" },
  avatar: { width:"34px", height:"34px", borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#06b6d4)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:"700" },
  userInfo: { display:"flex", flexDirection:"column" },
  userName: { fontSize:"13px", fontWeight:"700", color:"#f1f5f9" },
  adminTag: { fontSize:"10px", fontWeight:"700", color:"#38bdf8", background:"rgba(56,189,248,0.1)", padding:"1px 6px", borderRadius:"4px", textTransform:"uppercase" },
  signOutBtn: { padding:"6px 14px", background:"transparent", border:"1px solid #1e293b", borderRadius:"8px", fontSize:"13px", color:"#64748b", transition:"all 0.2s" },
  authBtns: { display:"flex", gap:"8px", alignItems:"center" },
  signInBtn: { padding:"7px 16px", border:"1.5px solid #1e293b", borderRadius:"9px", fontSize:"13px", fontWeight:"600", color:"#94a3b8", transition:"all 0.3s ease", letterSpacing:"0.2px" },
  getStartedBtn: { padding:"7px 18px", background:"linear-gradient(135deg,#2563eb,#06b6d4)", color:"#fff", border:"none", borderRadius:"9px", fontSize:"13px", fontWeight:"700", boxShadow:"0 2px 12px rgba(37,99,235,0.4)", letterSpacing:"0.2px" },
  hamburger: { display:"none", flexDirection:"column", gap:"5px", background:"none", border:"none", padding:"6px", cursor:"pointer" },
  bar: { display:"block", width:"22px", height:"2px", background:"#64748b", borderRadius:"2px", transition:"all 0.25s" },
  b1: { transform:"translateY(7px) rotate(45deg)" },
  b2: { opacity:0 },
  b3: { transform:"translateY(-7px) rotate(-45deg)" },
  mobileMenu: { position:"fixed", top:"66px", left:0, right:0, background:"#0b1120", borderBottom:"1px solid #1e293b", padding:"12px 20px 20px", zIndex:999, boxShadow:"0 8px 32px rgba(0,0,0,0.5)", display:"flex", flexDirection:"column", gap:"2px" },
  mobileLink: { display:"block", padding:"12px 16px", fontSize:"14px", fontWeight:"500", color:"#94a3b8", borderRadius:"8px" },
  mobileDivider: { height:"1px", background:"#1e293b", margin:"8px 0" },
  mobileLogout: { padding:"12px 16px", background:"rgba(59,130,246,0.06)", color:"#64748b", border:"1px solid #1e293b", borderRadius:"8px", fontWeight:"600", fontSize:"14px", textAlign:"left" },
};
