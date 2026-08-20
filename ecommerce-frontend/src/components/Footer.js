import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: "var(--bg-white)", borderTop: "1px solid var(--border-beige)", paddingTop: "64px", paddingBottom: "32px" }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "48px", marginBottom: "64px" }}>
        
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px", height: "40px",
              backgroundColor: "var(--bg-ivory)",
              border: "1px solid var(--border-beige)",
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "var(--radius-sm)"
            }}>
              <span className="text-editorial" style={{ color: "var(--brand-forest)", fontSize: "20px", fontWeight: 600, fontStyle: "italic" }}>V</span>
            </div>
            <span className="text-editorial" style={{ fontSize: "22px", fontWeight: 600, color: "var(--text-charcoal)", lineHeight: 1 }}>
              Vaayukumaaran
            </span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6 }}>
            A trusted marketplace for land, wedding services, and vehicles in the South Asian community.
          </p>
        </div>

        {/* Categories */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 className="text-editorial" style={{ fontSize: "18px", fontWeight: 600 }}>Categories</h4>
          <Link to="/listings?category=Land" style={{ color: "var(--text-muted)", fontSize: "15px" }}>Land Sale</Link>
          <Link to="/listings?category=Wedding" style={{ color: "var(--text-muted)", fontSize: "15px" }}>Weddings & Events</Link>
          <Link to="/listings?category=Vehicle" style={{ color: "var(--text-muted)", fontSize: "15px" }}>Vehicles</Link>
        </div>

        {/* Account & Support */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 className="text-editorial" style={{ fontSize: "18px", fontWeight: 600 }}>Account & Support</h4>
          <Link to="/login" style={{ color: "var(--text-muted)", fontSize: "15px" }}>Sign In</Link>
          <Link to="/register" style={{ color: "var(--text-muted)", fontSize: "15px" }}>Create Account</Link>
          <Link to="/orders" style={{ color: "var(--text-muted)", fontSize: "15px" }}>My Orders</Link>
          <a href="#support" style={{ color: "var(--text-muted)", fontSize: "15px" }}>Help Center</a>
        </div>

        {/* Contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h4 className="text-editorial" style={{ fontSize: "18px", fontWeight: 600 }}>Contact</h4>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>info@vaayukumaaran.com</p>
          <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>+91 98765 43210</p>
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {/* Social Icons (Placeholders) */}
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--bg-ivory)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-forest)" }}>FB</div>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "var(--bg-ivory)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--brand-forest)" }}>IG</div>
          </div>
        </div>

      </div>

      <div className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", borderTop: "1px solid var(--border-beige)", paddingTop: "32px" }}>
        <div style={{ display: "flex", gap: "24px", color: "var(--text-muted)", fontSize: "14px" }}>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>© {new Date().getFullYear()} Vaayukumaaran. All rights reserved.</p>
      </div>
    </footer>
  );
}
