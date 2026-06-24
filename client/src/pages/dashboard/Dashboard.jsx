import { useMemo, useState } from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import { RISK_CONFIG } from "./constants";
import PerformanceChart from "./components/PerformanceChart";
import ErrorRadar from "./components/ErrorRadar";
import { CSS } from "./styles";

function Dashboard() {
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?._id;

  const {
    data,
    risk,
    insights,
    recommendations,
    loading,
    error,
    refetch,
  } = useDashboardData(userId);

  const [activeChart, setActiveChart] = useState("accuracy");

  const avgAccuracy = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(
      data.reduce((a, b) => a + b.accuracy, 0) / data.length
    );
  }, [data]);

  const avgResponse = useMemo(() => {
    if (!data.length) return 0;
    return Math.round(
      data.reduce((a, b) => a + b.responseTime, 0) / data.length
    );
  }, [data]);

  const riskCfg = RISK_CONFIG[risk];

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="dashboard-root">
          <div className="loader" />
          <p style={{ textAlign: "center", opacity: 0.5 }}>
            Loading mission data...
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{CSS}</style>
        <div className="dashboard-root">
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS}</style>

      <div className="dashboard-root">
        {/* Background */}
        <div className="dc-grid" />
        <div className="dc-orb dc-orb-1" />
        <div className="dc-orb dc-orb-2" />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 40 }}>
          
          {/* Header */}
          <div className="fade-up" style={{ marginBottom: 30 }}>
            <h1 style={{ fontFamily: "Syne" }}>Mission Control</h1>
            <button className="chart-tab" onClick={refetch}>
              ↻ Refresh
            </button>
          </div>

          {/* Risk Banner */}
          <div
            className="dc-card fade-up fade-up-1"
            style={{
              borderColor: riskCfg.border,
              background: riskCfg.bg,
              marginBottom: 20,
            }}
          >
            <h2 style={{ color: riskCfg.color }}>{riskCfg.label}</h2>
            <p style={{ opacity: 0.6 }}>{riskCfg.desc}</p>
          </div>

          {/* Stats */}
          <div
            className="fade-up fade-up-2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div className="dc-stat-card">
              <p className="dc-stat-label">Accuracy</p>
              <p className="dc-stat-value">{avgAccuracy}%</p>
            </div>

            <div className="dc-stat-card">
              <p className="dc-stat-label">Response</p>
              <p className="dc-stat-value">{avgResponse} ms</p>
            </div>

            <div className="dc-stat-card">
              <p className="dc-stat-label">Sessions</p>
              <p className="dc-stat-value">{data.length}</p>
            </div>
          </div>

          {/* Chart Controls */}
          <div style={{ marginBottom: 10 }}>
            <button
              className={`chart-tab ${
                activeChart === "accuracy" ? "active" : ""
              }`}
              onClick={() => setActiveChart("accuracy")}
            >
              Accuracy
            </button>

            <button
              className={`chart-tab ${
                activeChart === "responseTime" ? "active" : ""
              }`}
              onClick={() => setActiveChart("responseTime")}
            >
              Response
            </button>
          </div>

          {/* Chart */}
          <div className="dc-card fade-up fade-up-3">
            <PerformanceChart data={data} activeChart={activeChart} />
          </div>

          {/* Radar */}
          <div className="dc-card fade-up fade-up-4" style={{ marginTop: 20 }}>
            <ErrorRadar data={data} />
          </div>

          {/* Insights */}
          <div className="dc-card" style={{ marginTop: 20 }}>
            <h3>Insights</h3>
            {insights.length ? (
              insights.map((i, idx) => (
                <div key={idx} className="dc-pill insight">
                  {i}
                </div>
              ))
            ) : (
              <p style={{ opacity: 0.4 }}>No insights yet</p>
            )}
          </div>

          {/* Recommendations */}
          <div className="dc-card" style={{ marginTop: 20 }}>
            <h3>Recommendations</h3>
            {recommendations.length ? (
              recommendations.map((r, idx) => (
                <div key={idx} className="dc-pill rec">
                  {r}
                </div>
              ))
            ) : (
              <p style={{ opacity: 0.4 }}>No recommendations yet</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;