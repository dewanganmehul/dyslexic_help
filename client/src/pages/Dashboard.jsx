import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { generateInsights } from "../utils/insights";

/* ─── styles ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&family=Space+Grotesk:wght@500;600&display=swap');

  .dashboard-root {
    min-height: 100vh;
    background: #0a0614;
    font-family: 'DM Sans', sans-serif;
    color: #e2e8f0;
    position: relative;
    overflow-x: hidden;
  }

  /* Shared Background Elements */
  .dc-grid {
    position: fixed; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(124,58,237,.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(124,58,237,.05) 1px, transparent 1px);
    background-size: 60px 60px;
    z-index: 0;
  }

  .dc-orb { position: fixed; border-radius: 50%; filter: blur(90px); opacity: .12; pointer-events: none; z-index: 0; }
  .dc-orb-1 { width: 500px; height: 500px; background: #7c3aed; top: -100px; right: -100px; }
  .dc-orb-2 { width: 400px; height: 400px; background: #0ea5e9; bottom: -100px; left: -100px; }

  /* Animations */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-up { animation: fadeUp 0.6s ease forwards; }
  .fade-up-1 { animation-delay: 0.1s; opacity: 0; }
  .fade-up-2 { animation-delay: 0.2s; opacity: 0; }
  .fade-up-3 { animation-delay: 0.3s; opacity: 0; }
  .fade-up-4 { animation-delay: 0.4s; opacity: 0; }

  @keyframes spin { to { transform: rotate(360deg); } }
  
  /* Chart Tabs */
  .chart-tab {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.5);
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .chart-tab.active {
    background: rgba(124,58,237,0.2);
    border-color: rgba(124,58,237,0.5);
    color: #fff;
  }

  .star {
    position: absolute;
    background: #fff;
    border-radius: 50%;
    opacity: var(--o);
    animation: twinkle var(--d) infinite ease-in-out var(--delay);
  }
  @keyframes twinkle {
    0%, 100% { opacity: var(--o); transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
`;

const RISK_CONFIG = {
  Low: {
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    label: "Optimal Level",
    icon: "✦",
    desc: "Pilot is performing at peak efficiency.",
  },
  Moderate: {
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    label: "Observation Required",
    icon: "◈",
    desc: "Minor pattern variations detected.",
  },
  High: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    label: "Critical Attention",
    icon: "▲",
    desc: "Significant literacy friction detected.",
  },
};

/* ─── components ─────────────────────────────────────────────── */

const CustomTooltip = ({ active, payload, label, unit }) => {
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
};

function StatCard({ label, value, unit, sub, color = "#7c3aed" }) {
  return (
    <div className="dc-stat-card" style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20,
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -10, right: -10, width: 60, height: 60,
        borderRadius: "50%", background: color, opacity: 0.1, filter: "blur(20px)",
      }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 12px" }}>
        {label}
      </p>
      <p style={{ color: "#fff", fontSize: 32, fontWeight: 700, margin: "0 0 4px", fontFamily: "'Syne', sans-serif" }}>
        {value}<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>{unit}</span>
      </p>
      {sub && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function InsightPill({ text, type = "insight" }) {
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

function Dashboard() {
  const [data, setData] = useState([]);
  const [risk, setRisk] = useState("Low");
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState("accuracy");

  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;
  const userId = parsedUser ? parsedUser._id : null;

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskLevel = (accuracy, time) => {
    if (accuracy > 80 && time < 2000) return "Low";
    if (accuracy > 50) return "Moderate";
    return "High";
  };

  const fetchData = async () => {
    if (!userId) {
      setError("Pilot authentication required. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/sessions/${userId}`);
      const formatted = res.data.map((item, index) => ({
        session: index + 1,
        accuracy: Math.round(item.accuracy),
        responseTime: Math.round(item.avgResponseTime),
      }));
      setData(formatted);
      if (res.data.length > 0) {
        const last = res.data[res.data.length - 1];
        setRisk(getRiskLevel(last.accuracy, last.avgResponseTime));
        const result = generateInsights(last.errorTypes || [], last.accuracy, last.avgResponseTime);
        setInsights(result.insights);
        setRecommendations(result.recommendations);
      }
    } catch (err) {
      setError("Telemetry sync failed. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const avgAccuracy = data.length ? Math.round(data.reduce((a, b) => a + b.accuracy, 0) / data.length) : 0;
  const avgResponse = data.length ? Math.round(data.reduce((a, b) => a + b.responseTime, 0) / data.length) : 0;
  const riskCfg = RISK_CONFIG[risk] || RISK_CONFIG["Low"];

  const chartData = activeChart === "accuracy"
    ? { key: "accuracy", color: "#7c3aed", unit: "%", label: "Accuracy" }
    : { key: "responseTime", color: "#10b981", unit: "ms", label: "Response Time" };

  return (
    <>
      <style>{CSS}</style>
      <div className="dashboard-root">
        <div className="dc-grid" />
        <div className="dc-orb dc-orb-1" />
        <div className="dc-orb dc-orb-2" />

        {/* Stars */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="star" style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              "--d": `${3 + Math.random() * 5}s`,
              "--delay": `${Math.random() * 5}s`,
              "--o": Math.random() * 0.4 + 0.1,
            }} />
          ))}
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "60px 24px" }}>

          {/* Header */}
          <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 50 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ 
                width: 50, height: 50, borderRadius: "50%", 
                background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)", 
                display: "flex", alignItems: "center", justifyContent: "center", 
                fontSize: 24, boxShadow: "0 0 30px rgba(124,58,237,0.4)" 
              }}>
                🪐
              </div>
              <div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
                  Mission Control
                </h1>
                <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Telemetric Analytics Dashboard
                </p>
              </div>
            </div>
            <button onClick={fetchData} className="chart-tab" style={{ padding: "10px 20px" }}>
              ↻ Refresh Telemetry
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <div style={{ width: 40, height: 40, border: "3px solid rgba(124,58,237,0.1)", borderTopColor: "#7c3aed", borderRadius: "50%", margin: "0 auto 20px", animation: "spin 1s linear infinite" }} />
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Retrieving mission logs...</p>
            </div>
          )}

          {error && !loading && (
            <div className="fade-up" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 16, padding: "20px", marginBottom: 30, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <p style={{ color: "#f87171", fontSize: 14, margin: 0 }}>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Risk Banner */}
              <div className="fade-up fade-up-1" style={{
                background: riskCfg.bg,
                border: `1px solid ${riskCfg.border}`,
                borderRadius: 24,
                padding: "24px 30px",
                marginBottom: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ 
                    width: 50, height: 50, borderRadius: "50%", background: riskCfg.color, 
                    display: "flex", alignItems: "center", justifyContent: "center", 
                    fontSize: 20, color: "#000", fontWeight: "bold" 
                  }}>
                    {riskCfg.icon}
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, margin: 0, color: riskCfg.color }}>
                      {riskCfg.label}
                    </p>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>{riskCfg.desc}</p>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Last Mission Status
                </div>
              </div>

              {/* Stat Cards */}
              <div className="fade-up fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 30 }}>
                <StatCard label="Average Accuracy" value={avgAccuracy} unit="%" sub="Performance stability" color="#7c3aed" />
                <StatCard label="Processing Speed" value={avgResponse} unit="ms" sub="Response latency" color="#10b981" />
                <StatCard label="Missions Logged" value={data.length} sub="Total flight time" color="#f59e0b" />
                <StatCard label="Pilot Status" value="Active" sub="ID: Mission-X" color="#0ea5e9" />
              </div>

              {/* Chart Card */}
              <div className="fade-up fade-up-3" style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 28,
                padding: "30px",
                marginBottom: 30,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                  <div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>
                      Performance Velocity
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, margin: 0 }}>
                      Telemetric data mapped over sequential missions
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className={`chart-tab ${activeChart === "accuracy" ? "active" : ""}`} onClick={() => setActiveChart("accuracy")}>
                      Accuracy
                    </button>
                    <button className={`chart-tab ${activeChart === "responseTime" ? "active" : ""}`} onClick={() => setActiveChart("responseTime")}>
                      Response
                    </button>
                  </div>
                </div>

                <div style={{ height: 260, width: "100%" }}>
                  <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartData.color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={chartData.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="session" tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip unit={chartData.unit} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                      <Area
                        type="monotone"
                        dataKey={chartData.key}
                        stroke={chartData.color}
                        strokeWidth={3}
                        fill="url(#chartGrad)"
                        dot={{ fill: chartData.color, r: 4, strokeWidth: 2, stroke: "#0a0614" }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights */}
              <div className="fade-up fade-up-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧠</div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: 0 }}>Pattern Insights</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {insights.length > 0 ? insights.map((item, i) => <InsightPill key={i} text={item} type="insight" />) : <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Pending mission analysis...</p>}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 28, padding: "28px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎯</div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, margin: 0 }}>Tactical Recommendations</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {recommendations.length > 0 ? recommendations.map((item, i) => <InsightPill key={i} text={item} type="rec" />) : <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Pending strategic data...</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;