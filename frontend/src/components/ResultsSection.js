import React from "react";
import VisualizationCard from "./VisualizationCard";
import ModelResultsChart from "./ModelResultsChart";

const ResultsSection = ({ result }) => {
  if (!result || !result.verdict) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "40px",
        textAlign: "center",
        color: "white",
      }}
    >
      <h2>Analysis Verdict</h2>

      <h1
        style={{
          color: result.verdict === "real" ? "#22c55e" : "#ef4444",
          fontSize: "48px",
          marginBottom: "10px",
        }}
      >
        {result.verdict.toUpperCase()}
      </h1>

      <p
        style={{
          fontSize: "24px",
          marginBottom: "30px",
        }}
      >
        Confidence: {result.confidence.toFixed(2)}%
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "30px",
        }}
      >
        {/* PIE CHART */}
        <VisualizationCard title="Prediction Breakdown">
          <ModelResultsChart
            type="pie"
            pieData={result.pieData}
          />
        </VisualizationCard>

        {/* BAR CHART */}
        <VisualizationCard title="Model Scores">
          <ModelResultsChart
            type="bar"
            models={result.models}
          />
        </VisualizationCard>
      </div>
    </div>
  );
};

export default ResultsSection;