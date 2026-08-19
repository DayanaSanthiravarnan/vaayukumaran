import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import ServerError from "../components/ServerError";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [pwdMsg, setPwdMsg] = useState({ text: "", type: "" });
  const [error, setError] = useState("");

  const flash = (setter, text, type) => { setter({ text, type }); setTimeout(() => setter({ text: "", type: "" }), 3000); };

  const updateProfile = async (e) => {
    e.preventDefault(); setError("");
    try { await api.put("/user/profile", profile); flash(setProfileMsg, "Profile updated!", "success"); }
    catch (err) {
      if (!err.response) setError("Cannot connect to server.");
      else flash(setProfileMsg, err.response?.data?.message || "Error updating profile", "error");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault(); setError("");
    try { await api.put("/user/password", pwd); flash(setPwdMsg, "Password changed!", "success"); setPwd({ currentPassword: "", newPassword: "" }); }
    catch (err) {
      if (!err.response) setError("Cannot connect to server.");
      else flash(setPwdMsg, err.response?.data?.message || "Error changing password", "error");
    }
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const isAdmin = user?.role === "ADMIN";

  const inputStyle = {
    padding: "11px 14px", border: "1.5px solid var(--border)",
    borderRadius: "var(--radius-sm)", fontSize: "14px", outline: "none",
    color: "var(--navy)", background: "#fff", width: "100%", boxSizing: "border-box",
    transition: "border 0.2s"
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", padding: "36px 0" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>

        {/* Hero banner */}
        <div style={{
          display: "flex", alignItems: "center", gap: "24px",
          background: "linear-gradient(135deg, var(--navy) 0%, #1a3a5c 100%)",
          borderRadius: "var(--radius-lg)", padding: "32px 36px",
          marginBottom: "24px", boxShadow: "var(--shadow-lg)"
        }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 900, flexShrink: 0, border: "3px solid rgba(255,255,255,0.2)" }}>
            {initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
              <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 800, margin: 0 }}>{user?.name}</h2>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, background: isAdmin ? "var(--amber-light)" : "rgba(255,255,255,0.15)", color: isAdmin ? "var(--amber)" : "#fff" }}>
                {isAdmin ? "⚙ Admin" : "👤 Customer"}
              </span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 0 2px" }}>@{user?.username}</p>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: 0 }}>✉ {user?.email}</p>
          </div>
        </div>

        {error && <ServerError message={error} />}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Update Profile */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "24px" }}>✏️</span>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", margin: "0 0 3px" }}>Update Profile</h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>Change your name or email</p>
              </div>
            </div>

            {profileMsg.text && (
              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: "13px", marginBottom: "16px", fontWeight: 600, background: profileMsg.type === "success" ? "var(--success-bg)" : "var(--danger-bg)", color: profileMsg.type === "success" ? "var(--success)" : "var(--danger)", border: `1px solid ${profileMsg.type === "success" ? "#A7F3D0" : "#FECACA"}` }}>
                {profileMsg.type === "success" ? "✓ " : "✕ "}{profileMsg.text}
              </div>
            )}

            <form onSubmit={updateProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Full Name</label>
                <input style={inputStyle} value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Email Address</label>
                <input style={inputStyle} type="email" value={profile.email}
                  onChange={e => setProfile({ ...profile, email: e.target.value })}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  required />
              </div>
              <button type="submit" style={{ padding: "12px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "14px", cursor: "pointer", marginTop: "4px" }}>
                Save Changes
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)", padding: "28px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "24px" }}>🔒</span>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--navy)", margin: "0 0 3px" }}>Change Password</h3>
                <p style={{ fontSize: "13px", color: "var(--muted)", margin: 0 }}>Keep your account secure</p>
              </div>
            </div>

            {pwdMsg.text && (
              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: "13px", marginBottom: "16px", fontWeight: 600, background: pwdMsg.type === "success" ? "var(--success-bg)" : "var(--danger-bg)", color: pwdMsg.type === "success" ? "var(--success)" : "var(--danger)", border: `1px solid ${pwdMsg.type === "success" ? "#A7F3D0" : "#FECACA"}` }}>
                {pwdMsg.type === "success" ? "✓ " : "✕ "}{pwdMsg.text}
              </div>
            )}

            <form onSubmit={changePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>Current Password</label>
                <input style={inputStyle} type="password" value={pwd.currentPassword}
                  onChange={e => setPwd({ ...pwd, currentPassword: e.target.value })}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  required />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "var(--body)" }}>New Password</label>
                <input style={inputStyle} type="password" value={pwd.newPassword}
                  onChange={e => setPwd({ ...pwd, newPassword: e.target.value })}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border)"}
                  required />
              </div>
              <button type="submit" style={{ padding: "12px", background: "var(--navy)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "14px", cursor: "pointer", marginTop: "4px" }}>
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
