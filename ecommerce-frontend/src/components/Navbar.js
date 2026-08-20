import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/listings", label: "Marketplace" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const isActive = (p) => location.pathname === p;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMobileOpen(false);
    setDropOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const allNavLinks = [
    ...NAV_LINKS,
    ...(user ? [
      { to: "/cart", label: "Cart" },
      { to: "/orders", label: "My Orders" },
      ...(user.role === "ADMIN" ? [{ to: "/admin", label: "Admin" }] : []),
    ] : []),
  ];

  return (
    <>
      {/* Announcement bar */}
      <div style={{
        backgroundColor: "var(--brand-forest)",
        color: "var(--bg-white)",
        textAlign: "center",
        fontSize: "12px",
        fontWeight: 500,
        padding: "8px 16px",
        letterSpacing: "0.5px"
      }}>
        Verified listings for land, weddings and vehicles.
      </div>

      {/* Main navbar */}
      <header style={{
        backgroundColor: "var(--bg-white)",
        borderBottom: "1px solid var(--border-beige)",
        position: "sticky",
        top: 0,
        zIndex: 800,
      }}>
        <div className="container" style={{
          display: "flex",
          alignItems: "center",
          height: "var(--nav-height)",
          justifyContent: "space-between"
        }}>
          
          {/* Logo - Left */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px", height: "40px",
              backgroundColor: "var(--bg-ivory)",
              border: "1px solid var(--border-beige)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "var(--radius-sm)"
            }}>
              <span className="text-editorial" style={{ 
                color: "var(--brand-forest)", 
                fontSize: "20px", 
                fontWeight: 600,
                fontStyle: "italic"
              }}>V</span>
            </div>
            <div className="hide-mobile">
              <div className="text-editorial" style={{ 
                fontSize: "22px", 
                fontWeight: 600, 
                color: "var(--text-charcoal)", 
                lineHeight: 1 
              }}>
                Vaayukumaaran
              </div>
            </div>
          </Link>

          {/* Links - Middle (Desktop) */}
          <nav className="hide-mobile" style={{ display: "flex", gap: "32px", alignItems: "center" }}>
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} style={{
                fontSize: "15px",
                fontWeight: isActive(to) ? 600 : 400,
                color: isActive(to) ? "var(--brand-forest)" : "var(--text-charcoal)",
                borderBottom: isActive(to) ? "2px solid var(--brand-forest)" : "2px solid transparent",
                padding: "4px 0"
              }}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions - Right (Desktop) */}
          <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            
            <Link to="/listings" style={{ display: "flex", alignItems: "center", color: "var(--text-charcoal)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </Link>

            {user && (
              <Link to="/cart" style={{ display: "flex", alignItems: "center", color: "var(--text-charcoal)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </Link>
            )}

            {user ? (
              <div ref={dropRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "6px 12px", border: "1px solid var(--border-beige)",
                    borderRadius: "var(--radius-sm)", backgroundColor: "var(--bg-ivory)"
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-charcoal)" }}>
                    {user.username}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dropOpen ? "rotate(180deg)" : "none" }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {dropOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", right: 0,
                    backgroundColor: "var(--bg-white)", border: "1px solid var(--border-beige)",
                    borderRadius: "var(--radius-sm)", boxShadow: "var(--shadow-md)",
                    minWidth: "160px", padding: "8px", zIndex: 100
                  }}>
                    {[
                      { to: "/profile", label: "Profile" },
                      { to: "/orders", label: "Orders" },
                      ...(user.role === "ADMIN" ? [{ to: "/admin", label: "Admin" }] : []),
                    ].map(({ to, label }) => (
                      <Link key={to} to={to} style={{
                        display: "block", padding: "8px 12px", fontSize: "14px",
                        color: "var(--text-charcoal)", borderRadius: "var(--radius-sm)"
                      }} onMouseEnter={e => e.target.style.backgroundColor = "var(--bg-ivory)"} onMouseLeave={e => e.target.style.backgroundColor = "transparent"}>
                        {label}
                      </Link>
                    ))}
                    <button onClick={handleLogout} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "8px 12px",
                      fontSize: "14px", color: "var(--status-error)", borderRadius: "var(--radius-sm)",
                      marginTop: "4px"
                    }} onMouseEnter={e => e.target.style.backgroundColor = "#FEF2F2"} onMouseLeave={e => e.target.style.backgroundColor = "transparent"}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" style={{ fontSize: "15px", fontWeight: 500, color: "var(--text-charcoal)" }}>Sign in</Link>
            )}

            <Link to="/admin" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "14px" }}>
              Post Listing
            </Link>
          </div>

          {/* Mobile right icons */}
          <div className="hide-desktop" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link to="/listings" style={{ color: "var(--text-charcoal)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </Link>
            {user && (
              <Link to="/cart" style={{ color: "var(--text-charcoal)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </Link>
            )}
            <button onClick={() => setMobileOpen(true)} style={{ color: "var(--text-charcoal)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 900,
          backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex", justifyContent: "flex-end"
        }}>
          <div style={{
            width: "80%", maxWidth: "320px", height: "100%",
            backgroundColor: "var(--bg-white)", padding: "24px",
            display: "flex", flexDirection: "column"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <span className="text-editorial" style={{ fontSize: "20px", fontWeight: 600 }}>Vaayukumaaran</span>
              <button onClick={() => setMobileOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
              {allNavLinks.map(({ to, label }) => (
                <Link key={to} to={to} style={{
                  fontSize: "18px", fontWeight: 500, color: "var(--text-charcoal)",
                  paddingBottom: "8px", borderBottom: "1px solid var(--border-beige)"
                }} onClick={() => setMobileOpen(false)}>{label}</Link>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border-beige)", paddingTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {user ? (
                <>
                  <div style={{ fontSize: "14px", color: "var(--text-muted)" }}>Signed in as {user.username}</div>
                  <button onClick={handleLogout} className="btn-outline" style={{ color: "var(--status-error)", borderColor: "var(--status-error)" }}>Sign out</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline" style={{ width: "100%", textAlign: "center" }} onClick={() => setMobileOpen(false)}>Sign in</Link>
                  <Link to="/register" className="btn-primary" style={{ width: "100%", textAlign: "center" }} onClick={() => setMobileOpen(false)}>Create Account</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
