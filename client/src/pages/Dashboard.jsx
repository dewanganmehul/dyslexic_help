import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { generateInsights } from "../utils/insights";

function Dashboard() {
  const [data, setData] = useState([]);
  const [risk, setRisk] = useState("");
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskLevel = (accuracy, time) => {
    if (accuracy > 80 && time < 2000) return "Low";
    if (accuracy > 50) return "Moderate";
    return "High";
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/sessions/demoUser"
      );

      const formatted = res.data.map((item, index) => ({
        session: index + 1,
        accuracy: item.accuracy,
        responseTime: item.avgResponseTime
      }));

      setData(formatted);

      if (res.data.length > 0) {
        const last = res.data[res.data.length - 1];

        setRisk(getRiskLevel(last.accuracy, last.avgResponseTime));

        const result = generateInsights(
          last.errorTypes || [],
          last.accuracy,
          last.avgResponseTime
        );

        setInsights(result.insights);
        setRecommendations(result.recommendations);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>📊 Mission Control Dashboard</h1>

      <h2>Risk Level: {risk}</h2>

      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="session" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="accuracy" />
      </LineChart>

      <br />

      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="session" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="responseTime" />
      </LineChart>

      <br />

      <h2>🧠 Insights</h2>
      {insights.map((item, index) => (
        <p key={index}>• {item}</p>
      ))}

      <h2>🎯 Recommendations</h2>
      {recommendations.map((item, index) => (
        <p key={index}>• {item}</p>
      ))}
    </div>
  );
}

export default Dashboard;