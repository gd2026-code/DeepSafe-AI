import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"];

const ModelResultsChart = ({ type, score, models, pieData }) => {

 if (type === "pie") {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          outerRadius={90}
          dataKey="value"
          label={false}
        >
          {pieData?.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

  const chartData = Object.keys(models || {}).map((key) => ({
    name: key,
    score: models[key],
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Bar dataKey="score" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ModelResultsChart;