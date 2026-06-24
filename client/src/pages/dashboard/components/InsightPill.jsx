export default function InsightPill({ text, type = "insight" }) {
  const colors = {
    insight: { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", dot: "#7c3aed" },
    rec: { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", dot: "#10b981" },
  };
  const c = colors[type];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 14, padding: "14px",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, marginTop: 7, flexShrink: 0, boxShadow: `0 0 8px ${c.dot}` }} />
      <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
