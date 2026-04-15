import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config/config";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { generateInsights } from "../utils/insights";

const RISK_CONFIG = {
  Low: {
    color: "#1D9E75",
    bg: "rgba(29,158,117,0.12)",
    border: "rgba(29,158,117,0.35)",
    label: "Low Risk",
    icon: "✦",
    desc: "Excellent performance",
  },
  Moderate: {
    color: "#EF9F27",
    bg: "rgba(239,159,39,0.12)",
    border: "rgba(239,159,39,0.35)",
    label: "Moderate Risk",
    icon: "◈",
    desc: "Some areas to improve",
  },
  High: {
    color: "#E24B4A",
    bg: "rgba(226,75,74,0.12)",
    border: "rgba(226,75,74,0.35)",
    label: "High Risk",
    icon: "▲",
    desc: "Needs focused attention",
  },
};

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "rgba(10,10,20,0.92)",
        border: "0.5px solid rgba(255,255,255,0.12)",
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "'DM Sans', sans-serif",
        backdropFilter: "blur(8px)",
      }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: "0 0 4px" }}>
          Session {label}
        </p>
        <p style={{ color: "#fff", fontSize: 15, fontWeight: 500, margin: 0 }}>
          {payload[0].value}{unit}
        </p>
      </div>
    );
  }
  return null;
};

function StatCard({ label, value, unit, sub, color = "#7F77DD" }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
    >
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        borderRadius: "50%", background: color, opacity: 0.08, filter: "blur(20px)",
      }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px", fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </p>
      <p style={{ color: "#fff", fontSize: 28, fontWeight: 600, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
        {value}<span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: 3 }}>{unit}</span>
      </p>
      {sub && <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{sub}</p>}
    </div>
  );
}

function InsightPill({ text, type = "insight" }) {
  const colors = {
    insight: { bg: "rgba(127,119,221,0.12)", border: "rgba(127,119,221,0.3)", dot: "#7F77DD" },
    rec: { bg: "rgba(29,158,117,0.1)", border: "rgba(29,158,117,0.28)", dot: "#1D9E75" },
  };
  const c = colors[type];
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      background: c.bg, border: `0.5px solid ${c.border}`,
      borderRadius: 10, padding: "12px 14px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, marginTop: 5, flexShrink: 0 }} />
      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>{text}</p>
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

  // Properly retrieve user _id from stored JSON
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
      setError("Please log in to view your mission data.");
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
      setError("Unable to load mission data. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const avgAccuracy = data.length ? Math.round(data.reduce((a, b) => a + b.accuracy, 0) / data.length) : 0;
  const avgResponse = data.length ? Math.round(data.reduce((a, b) => a + b.responseTime, 0) / data.length) : 0;
  const riskCfg = RISK_CONFIG[risk] || RISK_CONFIG["Low"];

  const chartData = activeChart === "accuracy"
    ? { key: "accuracy", color: "#7F77DD", unit: "%", label: "Accuracy" }
    : { key: "responseTime", color: "#1D9E75", unit: "ms", label: "Response Time" };

  return (
    <>
      <div className="dashboard-root">
        {/* Starfield */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {Array.from({ length: 60 }).map((_, i) => (
            <div key={i} className="star" style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              "--d": `${2 + Math.random() * 4}s`,
              "--delay": `${Math.random() * 4}s`,
              "--o": Math.random() * 0.5 + 0.2,
            }} />
          ))}
          {/* Nebula glow */}
          <div style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(83,74,183,0.07) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,110,86,0.07) 0%, transparent 70%)" }} />
        </div>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px" }}>

          {/* Header */}
          <div className="fade-up" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Planet icon */}
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #7F77DD 0%, #534AB7 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 0 24px rgba(127,119,221,0.4)" }}>
                🪐
              </div>
              <div>
                <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: "-0.02em" }}>
                  Mission Control
                </h1>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, margin: 0 }}>
                  Learning Analytics Dashboard
                </p>
              </div>
            </div>
            <button
              onClick={fetchData}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                padding: "8px 16px",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              ↻ Refresh
            </button>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 40, height: 40, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#7F77DD", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading mission data...</p>
            </div>
          )}

          {error && !loading && (
            <div style={{ background: "rgba(226,75,74,0.1)", border: "0.5px solid rgba(226,75,74,0.3)", borderRadius: 12, padding: "18px 20px", marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#E24B4A", fontSize: 16 }}>⚠</span>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: 0 }}>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Risk Banner */}
              <div className="fade-up fade-up-1" style={{
                background: riskCfg.bg,
                border: `0.5px solid ${riskCfg.border}`,
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: riskCfg.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, opacity: 0.9 }}>
                    {riskCfg.icon}
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 600, margin: 0, color: riskCfg.color }}>
                      {riskCfg.label}
                    </p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>{riskCfg.desc}</p>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
                  Based on last session
                </div>
              </div>

              {/* Stat Cards */}
              <div className="fade-up fade-up-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 28 }}>
                <StatCard label="Avg Accuracy" value={avgAccuracy} unit="%" sub={`${data.length} sessions tracked`} color="#7F77DD" />
                <StatCard label="Avg Response" value={avgResponse} unit="ms" sub="Reaction speed" color="#1D9E75" />
                <StatCard label="Sessions" value={data.length} sub="Total completed" color="#EF9F27" />
                <StatCard label="Streak" value="—" sub="Coming soon" color="#534AB7" />
              </div>

              {/* Chart Card */}
              <div className="fade-up fade-up-3" style={{
                background: "rgba(255,255,255,0.025)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "24px",
                marginBottom: 28,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 500, margin: 0 }}>
                      Performance Over Time
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0 }}>
                      Track your progress across sessions
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button className={`chart-tab ${activeChart === "accuracy" ? "active" : ""}`} onClick={() => setActiveChart("accuracy")}>
                      Accuracy
                    </button>
                    <button className={`chart-tab ${activeChart === "responseTime" ? "active" : ""}`} onClick={() => setActiveChart("responseTime")}>
                      Response Time
                    </button>
                  </div>
                </div>

                {data.length === 0 ? (
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>No session data yet. Complete a game to see your chart.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartData.color} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={chartData.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="session" tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: "Session", position: "insideBottom", offset: -2, fill: "rgba(255,255,255,0.2)", fontSize: 11 }} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip unit={chartData.unit} />} />
                      <Area
                        type="monotone"
                        dataKey={chartData.key}
                        stroke={chartData.color}
                        strokeWidth={2}
                        fill="url(#areaGrad)"
                        dot={{ fill: chartData.color, r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: chartData.color, stroke: "rgba(255,255,255,0.3)", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Insights + Recommendations */}
              <div className="fade-up fade-up-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
                {/* Insights */}
                <div style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "0.5px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: "22px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(127,119,221,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🧠</div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 14, margin: 0 }}>Insights</p>
                  </div>
                  {insights.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No insights yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {insights.map((item, i) => <InsightPill key={i} text={item} type="insight" />)}
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div style={{
                  background: "rgba(255,255,255,0.025)",
                  border: "0.5px solid rgba(255,255,255,0.07)",
                  borderRadius: 20,
                  padding: "22px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(29,158,117,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎯</div>
                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: 14, margin: 0 }}>Recommendations</p>
                  </div>
                  {recommendations.length === 0 ? (
                    <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>No recommendations yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {recommendations.map((item, i) => <InsightPill key={i} text={item} type="rec" />)}
                    </div>
                  )}
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