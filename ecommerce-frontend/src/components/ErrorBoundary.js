import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", background: "var(--bg)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "24px"
        }}>
          <div style={{
            background: "var(--surface)", borderRadius: "var(--radius-lg)",
            padding: "48px", textAlign: "center", maxWidth: "480px",
            border: "1px solid var(--border)", boxShadow: "var(--shadow-md)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--navy)", marginBottom: "8px" }}>
              Something went wrong
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "24px" }}>
              An unexpected error occurred. Please refresh the page.
            </p>
            <button
              style={{
                padding: "12px 28px", background: "var(--navy)", color: "#fff",
                border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700,
                fontSize: "14px", cursor: "pointer"
              }}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
