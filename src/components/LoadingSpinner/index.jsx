// components/LoadingSpinner.js
import React from "react";

const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <p>Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
