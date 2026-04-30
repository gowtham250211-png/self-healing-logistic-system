import React, { useEffect, useState } from "react";
import API from "../services/api";

function getStatusClass(status) {
  switch (status?.toUpperCase()) {
    case "ACTIVE":     return "status-active";
    case "IN_TRANSIT": return "status-transit";
    case "DELAYED":    return "status-delayed";
    case "FAILED":     return "status-failed";
    case "RECOVERED":  return "status-recovered";
    case "DELIVERED":  return "status-delivered";
    default:           return "status-active";
  }
}

function getRowHighlight(status) {
  switch (status) {
    case "DELAYED":  return "rgba(245,158,11,0.05)";
    case "FAILED":   return "rgba(239,68,68,0.05)";
    case "RECOVERED":return "rgba(6,182,212,0.05)";
    default:         return "transparent";
  }
}

function ShipmentList() {
  const [shipments, setShipments] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchShipments();
    // Refresh every 5 seconds
    const interval = setInterval(fetchShipments, 5000);
    return () => clearInterval(interval);
  }, []);

  function fetchShipments() {
    API.get("/shipments").then((res) => {
      setShipments(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
    });
  }

  function markInTransit(id) {
    API.patch(`/shipments/${id}/status?status=IN_TRANSIT`)
      .then(() => fetchShipments());
  }

  function markDelivered(id) {
    API.patch(`/shipments/${id}/status?status=DELIVERED`)
      .then(() => fetchShipments());
  }

  return (
    <div className="page-section">
      <div className="divider" />
      <div className="inner">
        <div className="section-label">Live Tracking</div>

        <div className="table-wrapper">
          <div className="table-header">
            <span className="table-title">Shipment Registry</span>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  width: "6px", height: "6px", borderRadius: "50%",
                  background: "var(--green)", boxShadow: "0 0 6px var(--green)",
                  display: "inline-block", animation: "blink 2s infinite",
                }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--green)", letterSpacing: "1px" }}>
                  LIVE · 5s
                </span>
              </div>
              {lastUpdated && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-dim)" }}>
                  Updated {lastUpdated}
                </span>
              )}
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: "var(--text-muted)" }}>
                {shipments.length} records
              </span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Product</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Info</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", letterSpacing: "2px" }}>
                    NO SHIPMENTS IN REGISTRY
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} style={{ background: getRowHighlight(s.status) }}>
                    <td style={{ color: "var(--amber)", fontWeight: 500 }}>
                      #{String(s.id).padStart(5, "0")}
                    </td>
                    <td style={{ color: "var(--text-bright)" }}>{s.productName}</td>
                    <td>{s.source}</td>
                    <td>{s.destination}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(s.status)}`}>
                        {s.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ maxWidth: "180px" }}>
                      {s.status === "DELAYED" && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--amber)" }}>
                          ⚠ {s.failureReason || "Delay detected"}
                        </span>
                      )}
                      {s.status === "FAILED" && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--red)" }}>
                          ⟳ Recovery in progress...
                        </span>
                      )}
                      {s.status === "RECOVERED" && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--cyan)" }}>
                          {s.reroutedVia ? `↗ ${s.reroutedVia}` : s.backupVehicle ? `🚛 ${s.backupVehicle}` : "✓ Recovered"}
                        </span>
                      )}
                      {s.status === "IN_TRANSIT" && (
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--cyan)" }}>
                          → En route to {s.destination}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {s.status === "ACTIVE" && (
                          <button
                            onClick={() => markInTransit(s.id)}
                            className="action-btn btn-transit"
                          >
                            <span>▶ PICKUP</span>
                          </button>
                        )}
                        {s.status === "RECOVERED" && (
                          <button
                            onClick={() => markDelivered(s.id)}
                            className="action-btn btn-deliver"
                          >
                            <span>✓ DELIVER</span>
                          </button>
                        )}
                        {s.status === "DELAYED" && (
                          <span className="status-hint hint-warn">⚠ Detecting...</span>
                        )}
                        {s.status === "FAILED" && (
                          <span className="status-hint hint-red">⟳ Recovering...</span>
                        )}
                        {s.status === "IN_TRANSIT" && (
                          <span className="status-hint hint-cyan">→ Moving</span>
                        )}
                        {s.status === "DELIVERED" && (
                          <span className="status-hint hint-green">✓ Complete</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ShipmentList;