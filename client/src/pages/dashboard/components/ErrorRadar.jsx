import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { ERROR_LABELS } from "../constants";

export default function ErrorRadar({ data }) {
  const errorCounts = {};

  data.forEach((s) => {
    s.errorTypes?.forEach((e) => {
      errorCounts[e] = (errorCounts[e] || 0) + 1;
    });
  });

  const radarData = Object.keys(errorCounts).map((key) => ({
    subject: ERROR_LABELS[key] || key,
    A: errorCounts[key],
  }));

  if (!radarData.length) return <p>No errors yet</p>;

  return (
    <ResponsiveContainer height={260}>
      <RadarChart data={radarData}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis />
        <Radar dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
      </RadarChart>
    </ResponsiveContainer>
  );
}