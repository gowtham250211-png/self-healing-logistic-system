import React, { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeDeliveries: 0,
    failuresDetected: 0,
    recovered: 0,
  });

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 8000);
    return () => clearInterval(interval);
  }, []);

  function fetchStats() {
    API.get("/shipments/stats").then((res) => setStats(res.data));
  }

  const cards = [
    {
      icon: "◫",
      label: "Total Shipments",
      value: stats.totalShipments,
      trend: "All registered shipments",
      accent: "#f59e0b",
    },
    {
      icon: "⟳",
      label: "Active Deliveries",
      value: stats.activeDeliveries,
      trend: "Currently in motion",
      accent: "#06b6d4",
    },
    {
      icon: "⚠",
      label: "Failures Detected",
      value: stats.failuresDetected,
      trend: "Delayed or failed",
      accent: "#ef4444",
    },
    {
      icon: "✦",
      label: "Recovered",
      value: stats.recovered,
      trend: "Auto-healed by system",
      accent: "#10b981",
    },
  ];

  return (
    <div className="page-section">
      <div className="inner">
        <div className="section-label">System Overview</div>
        <h1 className="dashboard-title">Logistics Dashboard</h1>
        <p className="dashboard-sub">
          REAL-TIME · TAMIL NADU OPERATIONS · SELF-HEALING NETWORK
        </p>
        <div className="cards">
          {cards.map((s, i) => (
            <div
              className="card"
              key={i}
              style={{ "--card-accent": s.accent }}
            >
              <div className="card-icon" style={{ color: s.accent }}>
                {s.icon}
              </div>
              <h3>{s.label}</h3>
              <p style={{ color: s.accent }}>{s.value}</p>
              <div className="card-trend">{s.trend}</div>
            </div>
          ))}
        </div>

        {/* Status legend */}
        <div className="status-legend">
          {[
            { label: "ACTIVE",      color: "#10b981" },
            { label: "IN TRANSIT",  color: "#06b6d4" },
            { label: "DELAYED",     color: "#f59e0b" },
            { label: "FAILED",      color: "#ef4444" },
            { label: "RECOVERED",   color: "#06b6d4" },
            { label: "DELIVERED",   color: "#10b981" },
          ].map((s) => (
            <div key={s.label} className="legend-item">
              <span
                className="legend-dot"
                style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
              />
              <span className="legend-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;