export default function CustomTooltip({ active, payload, label, unit }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(10,6,20,0.95)",
        border: "1px solid rgba(124,58,237,0.3)",
        borderRadius: 12,
        padding: "12px",
        fontFamily: "'DM Sans', sans-serif",
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.4)"
      }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, textTransform: "uppercase", margin: "0 0 4px" }}>
          Mission Session {label}
        </p>
        <p style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>
          {payload[0].value}{unit}
        </p>
      </div>
    );
  }
  return null;
}
