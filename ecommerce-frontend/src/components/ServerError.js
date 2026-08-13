export default function ServerError({ message }) {
  return (
    <div style={s.box}>
      <div style={s.icon}>⚠️</div>
      <div>
        <p style={s.title}>Connection Error</p>
        <p style={s.text}>{message || "Cannot connect to server. Please make sure the backend is running."}</p>
      </div>
    </div>
  );
}

const s = {
  box: { display: "flex", alignItems: "flex-start", gap: "14px", margin: "0 0 24px", padding: "16px 20px", border: "1px solid #ddd6fe", borderRadius: "12px", background: "#faf5ff" },
  icon: { fontSize: "24px", flexShrink: 0 },
  title: { margin: "0 0 4px", fontWeight: "700", color: "#4c1d95", fontSize: "14px" },
  text: { margin: 0, color: "#7c3aed", fontSize: "13px" },
};
