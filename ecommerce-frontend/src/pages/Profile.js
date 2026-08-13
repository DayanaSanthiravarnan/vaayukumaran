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
    try { await api.put("/user/profile", profile); flash(setProfileMsg, "Profile updated successfully!", "success"); }
    catch (err) {
      if (!err.response) setError("Cannot connect to server. Please make sure the backend is running.");
      else flash(setProfileMsg, err.response?.data?.message || "Error updating profile", "error");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault(); setError("");
    try { await api.put("/user/password", pwd); flash(setPwdMsg, "Password changed successfully!", "success"); setPwd({ currentPassword: "", newPassword: "" }); }
    catch (err) {
      if (!err.response) setError("Cannot connect to server. Please make sure the backend is running.");
      else flash(setPwdMsg, err.response?.data?.message || "Error changing password", "error");
    }
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const isAdmin = user?.role === "ADMIN";

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.hero}>
          <div style={s.avatarRing}>
            <div style={s.avatar}>{initials}</div>
          </div>
          <div style={s.heroInfo}>
            <div style={s.heroTop}>
              <h2 style={s.heroName}>{user?.name}</h2>
              <span style={{ ...s.roleBadge, ...(isAdmin ? s.adminBadge : s.userBadge) }}>
                {isAdmin ? "⚙ Admin" : "👤 Customer"}
              </span>
            </div>
            <p style={s.heroUsername}>@{user?.username}</p>
            <p style={s.heroEmail}>✉ {user?.email}</p>
          </div>
        </div>

        {error && <ServerError message={error} />}

        <div style={s.grid}>
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={s.cardIcon}>✏️</div>
              <div>
                <h3 style={s.cardTitle}>Update Profile</h3>
                <p style={s.cardSub}>Change your name or email</p>
              </div>
            </div>
            {profileMsg.text && <div style={{ ...s.msgBox, ...(profileMsg.type === "success" ? s.msgOk : s.msgErr) }}>{profileMsg.type === "success" ? "✓ " : "✕ "}{profileMsg.text}</div>}
            <form onSubmit={updateProfile} style={s.form}>
              <div style={s.field}><label style={s.label}>Full Name</label><input style={s.input} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></div>
              <div style={s.field}><label style={s.label}>Email Address</label><input style={s.input} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required /></div>
              <button style={s.btn} type="submit">Save Changes</button>
            </form>
          </div>

          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={s.cardIcon}>🔒</div>
              <div>
                <h3 style={s.cardTitle}>Change Password</h3>
                <p style={s.cardSub}>Keep your account secure</p>
              </div>
            </div>
            {pwdMsg.text && <div style={{ ...s.msgBox, ...(pwdMsg.type === "success" ? s.msgOk : s.msgErr) }}>{pwdMsg.type === "success" ? "✓ " : "✕ "}{pwdMsg.text}</div>}
            <form onSubmit={changePassword} style={s.form}>
              <div style={s.field}><label style={s.label}>Current Password</label><input style={s.input} type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} required /></div>
              <div style={s.field}><label style={s.label}>New Password</label><input style={s.input} type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} required /></div>
              <button style={s.btn} type="submit">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: "#f5f3ff", minHeight: "100vh", padding: "36px 0" },
  container: { maxWidth: "900px", margin: "0 auto", padding: "0 24px" },
  hero: { display: "flex", alignItems: "center", gap: "24px", background: "linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)", borderRadius: "20px", padding: "32px 36px", marginBottom: "24px", boxShadow: "0 8px 32px rgba(124,58,237,0.3)" },
  avatarRing: { width: "84px", height: "84px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "3px solid rgba(255,255,255,0.3)" },
  avatar: { width: "72px", height: "72px", borderRadius: "50%", background: "#fff", color: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "900" },
  heroInfo: { flex: 1 },
  heroTop: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" },
  heroName: { color: "#fff", fontSize: "22px", fontWeight: "800" },
  roleBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  adminBadge: { background: "#fef3c7", color: "#d97706" },
  userBadge: { background: "rgba(255,255,255,0.2)", color: "#fff" },
  heroUsername: { color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "4px" },
  heroEmail: { color: "rgba(255,255,255,0.55)", fontSize: "13px" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: { background: "#fff", borderRadius: "20px", padding: "28px", boxShadow: "0 2px 16px rgba(124,58,237,0.08)", border: "1px solid #ede9fe" },
  cardHead: { display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "24px" },
  cardIcon: { fontSize: "28px", flexShrink: 0 },
  cardTitle: { fontSize: "16px", fontWeight: "800", color: "#1e1b4b", marginBottom: "3px" },
  cardSub: { fontSize: "13px", color: "#a78bfa" },
  msgBox: { padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" },
  msgOk: { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" },
  msgErr: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "7px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#4c1d95" },
  input: { padding: "11px 14px", border: "1.5px solid #ddd6fe", borderRadius: "10px", fontSize: "14px", outline: "none", color: "#1e1b4b", background: "#faf5ff" },
  btn: { padding: "12px", background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", fontSize: "14px", boxShadow: "0 3px 10px rgba(124,58,237,0.3)", marginTop: "4px" },
};
