import React from "react";

const VisualizationCard = ({ title, children }) => {
  return (
    <div style={{
      background: "#1e293b",
      padding: "20px",
      borderRadius: "10px",
      width: "300px"
    }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
};

export default VisualizationCard;