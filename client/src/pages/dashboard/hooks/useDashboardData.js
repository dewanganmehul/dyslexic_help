import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../../config/config";

export const useDashboardData = (userId) => {
  const [data, setData] = useState([]);
  const [risk, setRisk] = useState("Low");
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRiskLevel = (accuracy, time) => {
    const score = accuracy - time / 50;
    if (score > 60) return "Low";
    if (score > 30) return "Moderate";
    return "High";
  };

  const fetchData = async () => {
    if (!userId) {
      setError("Pilot authentication required.");
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
        errorTypes: item.errorTypes || [], // ✅ FIXED
      }));

      setData(formatted);

      if (res.data.length > 0) {
        const last = res.data[res.data.length - 1];
        setRisk(getRiskLevel(last.accuracy, last.avgResponseTime));

        // AI insights
        try {
          setInsightLoading(true);

          const aiRes = await axios.post(
            `${BASE_URL}/api/companion/dashboard-insights`,
            { telemetryData: res.data }
          );

          if (aiRes.data.success) {
            setInsights(aiRes.data.insights || []);
            setRecommendations(aiRes.data.recommendations || []);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setInsightLoading(false);
        }
      }
    } catch (err) {
      setError("Telemetry sync failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  return {
    data,
    risk,
    insights,
    recommendations,
    loading,
    insightLoading,
    error,
    refetch: fetchData,
  };
};