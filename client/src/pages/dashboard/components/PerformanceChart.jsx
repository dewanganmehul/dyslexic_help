import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import CustomTooltip from "./CustomTooltip";

export default function PerformanceChart({ data, activeChart }) {
  const chartData =
    activeChart === "accuracy"
      ? { key: "accuracy", color: "#7c3aed", unit: "%" }
      : { key: "responseTime", color: "#10b981", unit: "ms" };

  return (
    <ResponsiveContainer height={260}>
      <AreaChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis dataKey="session" />
        <YAxis />
        <Tooltip content={<CustomTooltip unit={chartData.unit} />} />

        <Area
          type="monotone"
          dataKey={chartData.key}
          stroke={chartData.color}
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}