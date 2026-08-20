/* Shared reusable UI primitives */

/* ── Button ── */
export function Btn({ children, variant = "primary", size = "md", disabled, loading, onClick, type = "button", style = {}, ...rest }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: "7px", fontFamily: "var(--font-sans)", fontWeight: 600,
    border: "none", borderRadius: "var(--r-sm)", cursor: disabled || loading ? "not-allowed" : "pointer",
    transition: "var(--t-base)", whiteSpace: "nowrap", flexShrink: 0,
    opacity: disabled || loading ? 0.6 : 1,
  };
  const sizes = {
    sm: { padding: "7px 14px", fontSize: "12px" },
    md: { padding: "10px 20px", fontSize: "13px" },
    lg: { padding: "13px 28px", fontSize: "14px" },
    xl: { padding: "15px 36px", fontSize: "15px" },
  };
  const variants = {
    primary:   { background: "var(--forest)", color: "#fff" },
    secondary: { background: "var(--white)", color: "var(--charcoal)", border: "1.5px solid var(--beige)" },
    terra:     { background: "var(--terra)", color: "#fff" },
    ghost:     { background: "transparent", color: "var(--forest)", border: "1.5px solid var(--forest)" },
    danger:    { background: "var(--danger-bg)", color: "var(--danger)", border: "1px solid #FECACA" },
    link:      { background: "transparent", color: "var(--forest)", padding: 0, fontWeight: 600 },
  };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...rest}
    >
      {loading && <Spinner size={14} color={variant === "secondary" ? "var(--forest)" : "#fff"} />}
      {children}
    </button>
  );
}

/* ── Spinner ── */
export function Spinner({ size = 18, color = "var(--forest)" }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size, flexShrink: 0,
      border: `2px solid ${color}30`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

/* ── Badge ── */
export function Badge({ children, variant = "default", style = {} }) {
  const variants = {
    default:  { background: "var(--beige)", color: "var(--body)" },
    forest:   { background: "var(--forest-lt)", color: "var(--forest)" },
    terra:    { background: "var(--terra-lt)", color: "var(--terra)" },
    gold:     { background: "var(--gold-lt)", color: "var(--gold)" },
    success:  { background: "var(--success-bg)", color: "var(--success)" },
    danger:   { background: "var(--danger-bg)", color: "var(--danger)" },
    warn:     { background: "var(--warn-bg)", color: "var(--warn)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 10px", borderRadius: "var(--r-full)",
      fontSize: "11px", fontWeight: 700, letterSpacing: "0.2px",
      ...variants[variant], ...style,
    }}>
      {children}
    </span>
  );
}

/* ── Input ── */
export function Input({ label, error, style = {}, wrapStyle = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...wrapStyle }}>
      {label && (
        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--body)", letterSpacing: "0.2px" }}>
          {label}
        </label>
      )}
      <input
        style={{
          padding: "10px 14px", border: `1.5px solid ${error ? "var(--danger)" : "var(--beige)"}`,
          borderRadius: "var(--r-sm)", fontSize: "14px", outline: "none",
          color: "var(--charcoal)", background: "var(--white)", transition: "border 0.18s",
          width: "100%", boxSizing: "border-box",
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = "var(--forest)"}
        onBlur={e => e.target.style.borderColor = error ? "var(--danger)" : "var(--beige)"}
        {...props}
      />
      {error && <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

/* ── Textarea ── */
export function Textarea({ label, error, style = {}, wrapStyle = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...wrapStyle }}>
      {label && (
        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--body)", letterSpacing: "0.2px" }}>
          {label}
        </label>
      )}
      <textarea
        style={{
          padding: "10px 14px", border: `1.5px solid ${error ? "var(--danger)" : "var(--beige)"}`,
          borderRadius: "var(--r-sm)", fontSize: "14px", outline: "none",
          color: "var(--charcoal)", background: "var(--white)", transition: "border 0.18s",
          width: "100%", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit",
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = "var(--forest)"}
        onBlur={e => e.target.style.borderColor = error ? "var(--danger)" : "var(--beige)"}
        {...props}
      />
      {error && <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

/* ── Select ── */
export function Select({ label, error, style = {}, wrapStyle = {}, children, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", ...wrapStyle }}>
      {label && (
        <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--body)", letterSpacing: "0.2px" }}>
          {label}
        </label>
      )}
      <select
        style={{
          padding: "10px 14px", border: `1.5px solid ${error ? "var(--danger)" : "var(--beige)"}`,
          borderRadius: "var(--r-sm)", fontSize: "14px", outline: "none",
          color: "var(--charcoal)", background: "var(--white)", transition: "border 0.18s",
          width: "100%", boxSizing: "border-box", cursor: "pointer",
          ...style,
        }}
        {...props}
      >
        {children}
      </select>
      {error && <span style={{ fontSize: "11px", color: "var(--danger)", fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

/* ── Card ── */
export function Card({ children, style = {}, hover = false, onClick }) {
  const [hov, setHov] = hover ? [false, () => {}] : [false, () => {}];
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--white)", borderRadius: "var(--r-lg)",
        border: "1px solid var(--beige)", boxShadow: "var(--sh-sm)",
        transition: "var(--t-base)", ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Divider ── */
export function Divider({ style = {} }) {
  return <div style={{ height: "1px", background: "var(--beige)", ...style }} />;
}

/* ── Alert ── */
export function Alert({ type = "error", children, style = {} }) {
  const map = {
    error:   { bg: "var(--danger-bg)", border: "#FECACA", color: "var(--danger)", icon: "⚠" },
    success: { bg: "var(--success-bg)", border: "#A7F3D0", color: "var(--success)", icon: "✓" },
    warn:    { bg: "var(--warn-bg)", border: "#FDE68A", color: "var(--warn)", icon: "⚠" },
    info:    { bg: "var(--forest-xlt)", border: "var(--forest-lt)", color: "var(--forest)", icon: "ℹ" },
  };
  const t = map[type];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: "10px",
      padding: "12px 16px", borderRadius: "var(--r-sm)",
      background: t.bg, border: `1px solid ${t.border}`,
      fontSize: "13px", color: t.color, fontWeight: 500,
      ...style,
    }}>
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{t.icon}</span>
      <span>{children}</span>
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "64px 32px", textAlign: "center",
      background: "var(--white)", borderRadius: "var(--r-xl)",
      border: "1.5px dashed var(--beige-mid)",
    }}>
      <span style={{ fontSize: "40px", marginBottom: "16px" }}>{icon}</span>
      <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--charcoal)", marginBottom: "8px" }}>{title}</p>
      {description && <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px", maxWidth: "320px" }}>{description}</p>}
      {action}
    </div>
  );
}

/* ── Toast ── */
export function Toast({ message, type = "success", onClose }) {
  return (
    <div className={`toast toast-${type}`}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "⚠"}</span>
      <span>{message}</span>
    </div>
  );
}

/* ── useToast hook ── */
import { useState, useCallback } from "react";
export function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((message, type = "success", duration = 2800) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, []);
  return { toast, show };
}

/* ── Skeleton blocks ── */
export function SkeletonLine({ width = "100%", height = 14, style = {} }) {
  return <div className="skeleton" style={{ width, height, borderRadius: "var(--r-xs)", ...style }} />;
}
export function SkeletonCard() {
  return (
    <div style={{ background: "var(--white)", borderRadius: "var(--r-lg)", border: "1px solid var(--beige)", overflow: "hidden" }}>
      <div className="skeleton" style={{ height: 200 }} />
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <SkeletonLine width="60%" height={12} />
        <SkeletonLine width="90%" height={16} />
        <SkeletonLine width="40%" height={12} />
        <SkeletonLine width="50%" height={20} />
      </div>
    </div>
  );
}

/* ── Breadcrumb ── */
export function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {i > 0 && <span style={{ color: "var(--beige-mid)" }}>›</span>}
          {item.href
            ? <a href={item.href} style={{ color: i === items.length - 1 ? "var(--charcoal)" : "var(--muted)", fontWeight: i === items.length - 1 ? 600 : 400 }}>{item.label}</a>
            : <span style={{ color: i === items.length - 1 ? "var(--charcoal)" : "var(--muted)", fontWeight: i === items.length - 1 ? 600 : 400 }}>{item.label}</span>
          }
        </span>
      ))}
    </nav>
  );
}

/* ── Section Header ── */
export function SectionHeader({ eyebrow, title, subtitle, align = "left", style = {} }) {
  return (
    <div style={{ textAlign: align, ...style }}>
      {eyebrow && (
        <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--terra)", marginBottom: "8px" }}>
          {eyebrow}
        </p>
      )}
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(22px,3vw,30px)", fontWeight: 600, color: "var(--charcoal)", lineHeight: 1.25, marginBottom: subtitle ? "10px" : 0 }}>
        {title}
      </h2>
      {subtitle && <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.7, maxWidth: align === "center" ? "520px" : "none", margin: align === "center" ? "0 auto" : 0 }}>{subtitle}</p>}
    </div>
  );
}

/* ── Status Badge ── */
const STATUS_MAP = {
  PENDING:   { label: "Pending",   variant: "warn" },
  CONFIRMED: { label: "Confirmed", variant: "forest" },
  SHIPPED:   { label: "Shipped",   variant: "gold" },
  DELIVERED: { label: "Delivered", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};
export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, variant: "default" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

/* ── Price ── */
export function Price({ value, size = "md", style = {} }) {
  const sizes = { sm: "14px", md: "18px", lg: "24px", xl: "32px" };
  return (
    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: sizes[size], color: "var(--forest)", letterSpacing: "-0.5px", ...style }}>
      ₹{Number(value).toLocaleString("en-IN")}
    </span>
  );
}

/* ── Verified Marker ── */
export function VerifiedBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      fontSize: "10px", fontWeight: 700, color: "var(--gold)",
      background: "var(--gold-lt)", padding: "2px 8px",
      borderRadius: "var(--r-full)", border: "1px solid #E8D5A3",
    }}>
      ✦ Verified
    </span>
  );
}

/* ── Image with fallback ── */
export function ProductImage({ src, alt, style = {}, aspectRatio = "4/3" }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", aspectRatio, background: "var(--ivory-dark)", ...style }}>
      <img
        src={src || "https://via.placeholder.com/400x300/EDE9E0/9CA3AF?text=No+Image"}
        alt={alt || "Product image"}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
        onError={e => { e.target.src = "https://via.placeholder.com/400x300/EDE9E0/9CA3AF?text=No+Image"; }}
      />
    </div>
  );
}

/* ── Confirm Dialog ── */
export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Delete", confirmVariant = "danger" }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(29,41,37,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: "24px", animation: "fadeIn 0.15s ease",
    }}>
      <div style={{
        background: "var(--white)", borderRadius: "var(--r-xl)",
        padding: "32px", maxWidth: "400px", width: "100%",
        boxShadow: "var(--sh-xl)", animation: "scaleIn 0.18s ease",
      }}>
        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--charcoal)", marginBottom: "10px" }}>{title}</h3>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "24px", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
}
