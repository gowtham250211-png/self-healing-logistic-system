import React, { useState, useEffect } from "react";
import API from "../services/api";

function statusColor(status) {
  switch (status) {
    case "ACTIVE":     return "var(--green)";
    case "IN_TRANSIT": return "var(--cyan)";
    case "DELAYED":    return "var(--amber)";
    case "FAILED":     return "var(--red)";
    case "RECOVERED":  return "var(--cyan)";
    case "DELIVERED":  return "var(--green)";
    default:           return "var(--text-muted)";
  }
}

function statusIcon(status) {
  switch (status) {
    case "ACTIVE":     return "◉";
    case "IN_TRANSIT": return "→";
    case "DELAYED":    return "⚠";
    case "FAILED":     return "✕";
    case "RECOVERED":  return "✓";
    case "DELIVERED":  return "★";
    default:           return "·";
  }
}

function FailureMonitor() {
  const [allShipments, setAllShipments]         = useState([]);
  const [failureEvents, setFailureEvents]       = useState([]);
  const [selectedId, setSelectedId]             = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [shipmentEvents, setShipmentEvents]     = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [simDone, setSimDone]                   = useState(false);
  const [lastUpdated, setLastUpdated]           = useState(null);
  const [failureType, setFailureType]           = useState("VEHICLE_FAILURE");

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchShipmentEvents(selectedId);
      const sel = allShipments.find((s) => s.id === parseInt(selectedId));
      if (sel) setSelectedShipment(sel);
    }
  }, [selectedId, allShipments]);

  function fetchAll() {
    API.get("/shipments").then((res) => {
      setAllShipments(res.data);
      setLastUpdated(new Date().toLocaleTimeString());
      if (!selectedId) {
        const pick = res.data.find(
          (s) => s.status === "ACTIVE" || s.status === "IN_TRANSIT"
        );
        if (pick) setSelectedId(String(pick.id));
      }
      if (selectedId) {
        const sel = res.data.find((s) => s.id === parseInt(selectedId));
        if (sel) setSelectedShipment(sel);
      }
    });
    API.get("/monitor/failures").then((res) => setFailureEvents(res.data));
  }

  function fetchShipmentEvents(id) {
    API.get(`/monitor/failures/shipment/${id}`)
      .then((res) => setShipmentEvents(res.data))
      .catch(() => setShipmentEvents([]));
  }

  function getReason() {
    switch (failureType) {
      case "VEHICLE_FAILURE":    return "Vehicle breakdown on highway — backup vehicle required";
      case "DELAY":              return "Route blocked — alternate path required";
      case "ROUTE_UNAVAILABLE":  return "Critical failure — reroute and vehicle replacement required";
      default:                   return "Manual simulation triggered";
    }
  }

  function getFailureLabel() {
    switch (failureType) {
      case "VEHICLE_FAILURE":    return "🚛 Vehicle Breakdown";
      case "DELAY":              return "↗ Route Blocked";
      case "ROUTE_UNAVAILABLE":  return "⚡ Critical — Both";
      default:                   return "Manual";
    }
  }

  function simulateFailure() {
    if (!selectedId) return alert("No shipment selected.");
    const sel = allShipments.find((s) => s.id === parseInt(selectedId));
    if (!sel) return;
    if (sel.status !== "ACTIVE" && sel.status !== "IN_TRANSIT") {
      alert(`Cannot simulate on ${sel.status} shipment.\nSelect ACTIVE or IN_TRANSIT.`);
      return;
    }
    setLoading(true);
    setSimDone(false);
    API.post("/monitor/simulate", {
      shipmentId: parseInt(selectedId),
      type: failureType,
      reason: getReason(),
    })
      .then(() => {
        setSimDone(true);
        fetchAll();
        fetchShipmentEvents(selectedId);
      })
      .catch((err) => alert("Error: " + (err.response?.data?.message || "Simulation failed")))
      .finally(() => setLoading(false));
  }

  function reset() {
    setSimDone(false);
    setShipmentEvents([]);
    setSelectedShipment(null);
    setSelectedId("");
    fetchAll();
  }

  const simulatable = allShipments.filter(
    (s) => s.status === "ACTIVE" || s.status === "IN_TRANSIT"
  );

  const activeIssues = allShipments.filter(
    (s) => s.status === "DELAYED" || s.status === "FAILED"
  ).length;

  function buildJourney() {
    const logs = [];
    if (!selectedShipment) return logs;

    logs.push({
      status: "ACTIVE",
      text: `Shipment created — ${selectedShipment.productName}`,
      sub: `${selectedShipment.source} → ${selectedShipment.destination}`,
      time: selectedShipment.createdAt
        ? new Date(selectedShipment.createdAt).toLocaleTimeString() : "—",
      done: true,
    });

    const hasTransit = selectedShipment.status !== "ACTIVE";
    logs.push({
      status: "IN_TRANSIT",
      text: "Picked up — shipment in transit",
      sub: `En route to ${selectedShipment.destination}`,
      time: hasTransit
        ? new Date(selectedShipment.updatedAt).toLocaleTimeString() : "—",
      done: hasTransit,
    });

    const hasDelayed = ["DELAYED","FAILED","RECOVERED","DELIVERED"]
      .includes(selectedShipment.status);
    logs.push({
      status: "DELAYED",
      text: "Failure detected by monitor",
      sub: selectedShipment.failureReason || "Exceeded transit time threshold",
      time: shipmentEvents.length > 0
        ? new Date(shipmentEvents[0].detectedAt).toLocaleTimeString() : "—",
      done: hasDelayed,
    });

    const hasFailed = ["FAILED","RECOVERED","DELIVERED"]
      .includes(selectedShipment.status);
    logs.push({
      status: "FAILED",
      text: "Failure confirmed — recovery initiated",
      sub: selectedShipment.recoveryAttempts > 0
        ? `Recovery attempt #${selectedShipment.recoveryAttempts}`
        : "Recovery protocol activated",
      time: hasFailed ? "~20s after delay" : "—",
      done: hasFailed,
    });

    const hasRecovered = ["RECOVERED","DELIVERED"]
      .includes(selectedShipment.status);

    // Build recovery sub text showing both vehicle and route if present
    let recoverySubText = "Auto-recovery completed";
    if (shipmentEvents.length > 0 && shipmentEvents[0].recoveryAction) {
      recoverySubText = shipmentEvents[0].recoveryAction;
    } else {
      const parts = [];
      if (selectedShipment.reroutedVia)   parts.push(`↗ ${selectedShipment.reroutedVia}`);
      if (selectedShipment.backupVehicle) parts.push(`🚛 ${selectedShipment.backupVehicle}`);
      if (parts.length > 0) recoverySubText = parts.join(" | ");
    }

    logs.push({
      status: "RECOVERED",
      text: "Recovery successful",
      sub: recoverySubText,
      time: shipmentEvents.length > 0 && shipmentEvents[0].resolvedAt
        ? new Date(shipmentEvents[0].resolvedAt).toLocaleTimeString() : "—",
      done: hasRecovered,
    });

    const hasDelivered = selectedShipment.status === "DELIVERED";
    logs.push({
      status: "DELIVERED",
      text: "Delivered successfully",
      sub: `Completed at ${selectedShipment.destination}`,
      time: hasDelivered
        ? new Date(selectedShipment.updatedAt).toLocaleTimeString() : "—",
      done: hasDelivered,
    });

    return logs;
  }

  const journey = buildJourney();

  const typeOptions = [
    {
      key:   "VEHICLE_FAILURE",
      icon:  "🚛",
      label: "Vehicle Breakdown",
      desc:  "Backup vehicle assigned",
      color: "var(--red)",
      bg:    "rgba(239,68,68,0.08)",
    },
    {
      key:   "DELAY",
      icon:  "↗",
      label: "Route Blocked",
      desc:  "Reroute to alternate path",
      color: "var(--amber)",
      bg:    "rgba(245,158,11,0.08)",
    },
    {
      key:   "ROUTE_UNAVAILABLE",
      icon:  "⚡",
      label: "Critical Failure",
      desc:  "Reroute + New vehicle both",
      color: "var(--cyan)",
      bg:    "rgba(6,182,212,0.08)",
    },
  ];

  return (
    <div className="page-section" style={{ paddingBottom: "80px" }}>
      <div className="divider" />
      <div className="inner">
        <div className="section-label">System Health</div>

        <div className="monitor-grid">

          {/* ── LEFT PANEL ── */}
          <div>
            <h2 className="section-heading">Failure Monitor</h2>
            <p className="section-desc">
              Autonomous recovery · Real-time anomaly detection
            </p>

            {/* System status bar */}
            <div className="sys-status-bar" style={{
              borderColor: activeIssues > 0
                ? "rgba(239,68,68,0.4)"
                : "rgba(16,185,129,0.3)",
            }}>
              <div className={`status-dot ${activeIssues > 0 ? "danger" : ""}`} />
              <div>
                <div className="sys-status-text">
                  {activeIssues > 0
                    ? `${activeIssues} Active Issue${activeIssues > 1 ? "s" : ""} — Recovery Running`
                    : "All Systems Nominal"}
                </div>
                <div className="sys-status-sub">
                  {allShipments.filter((s) => s.status === "RECOVERED").length} recovered ·{" "}
                  {allShipments.filter((s) => s.status === "DELIVERED").length} delivered
                </div>
              </div>
            </div>

            {/* Simulate panel */}
            <div className={`monitor-panel ${simDone ? "alert" : ""}`}>

              {/* Shipment dropdown */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Select Shipment to Monitor:</label>
                {simulatable.length === 0 ? (
                  <div className="no-shipment-msg">
                    No ACTIVE or IN_TRANSIT shipments — create one first
                  </div>
                ) : (
                  <select
                    value={selectedId}
                    onChange={(e) => {
                      setSelectedId(e.target.value);
                      setSimDone(false);
                      fetchShipmentEvents(e.target.value);
                    }}
                    className="select-input"
                  >
                    {simulatable.map((s) => (
                      <option key={s.id} value={s.id} style={{ background: "#0a0e1a" }}>
                        #{String(s.id).padStart(5,"0")} — {s.productName} [{s.status}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Failure type selector — 3 options */}
              <div style={{ marginBottom: "16px" }}>
                <label className="form-label">Select Failure Type:</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {typeOptions.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setFailureType(opt.key)}
                      style={{
                        padding: "12px 14px",
                        fontSize: "10px",
                        textAlign: "left",
                        borderColor: failureType === opt.key ? opt.color : "var(--border-dim)",
                        color:       failureType === opt.key ? opt.color : "var(--text-muted)",
                        background:  failureType === opt.key ? opt.bg    : "transparent",
                        display: "flex", gap: "10px", alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>{opt.icon}</span>
                      <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontWeight: "bold", letterSpacing: "1px" }}>
                          {opt.label}
                        </span>
                        <span style={{ fontSize: "9px", opacity: 0.7, letterSpacing: "0.5px" }}>
                          {opt.desc}
                        </span>
                      </span>
                      {failureType === opt.key && (
                        <span style={{ marginLeft: "auto", fontSize: "12px" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                <button
                  className="btn-danger"
                  onClick={simulateFailure}
                  disabled={loading || simulatable.length === 0}
                  style={{ opacity: (loading || simulatable.length === 0) ? 0.5 : 1 }}
                >
                  <span>{loading ? "⟳ Processing..." : `⚡ Simulate — ${getFailureLabel()}`}</span>
                </button>
                <button onClick={reset}>
                  <span>↺ Reset</span>
                </button>
              </div>

              {/* Selected shipment info */}
              {selectedShipment && (
                <div style={{
                  padding: "14px 16px",
                  background: "var(--bg-deep)",
                  border: "1px solid var(--border-dim)",
                  borderRadius: "6px",
                }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-dim)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "10px" }}>
                    Selected Shipment Info
                  </div>
                  {[
                    { label: "ID",       value: "#" + String(selectedShipment.id).padStart(5,"0") },
                    { label: "Product",  value: selectedShipment.productName },
                    { label: "Route",    value: `${selectedShipment.source} → ${selectedShipment.destination}` },
                    { label: "Status",   value: selectedShipment.status.replace("_"," ") },
                    { label: "Attempts", value: selectedShipment.recoveryAttempts || 0 },
                    ...(selectedShipment.reroutedVia
                      ? [{ label: "Rerouted", value: selectedShipment.reroutedVia }] : []),
                    ...(selectedShipment.backupVehicle
                      ? [{ label: "Vehicle",  value: selectedShipment.backupVehicle }] : []),
                    ...(selectedShipment.failureReason
                      ? [{ label: "Reason",   value: selectedShipment.failureReason }] : []),
                  ].map((item) => (
                    <div key={item.label} style={{ display: "flex", gap: "12px", marginBottom: "6px", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px" }}>
                      <span style={{ color: "var(--text-muted)", minWidth: "70px", flexShrink: 0 }}>
                        {item.label}:
                      </span>
                      <span style={{
                        color: item.label === "Status"
                          ? statusColor(selectedShipment.status)
                          : item.label === "Rerouted" ? "var(--amber)"
                          : item.label === "Vehicle"  ? "var(--cyan)"
                          : "var(--text-bright)",
                        fontWeight: item.label === "Status" ? "bold" : "normal",
                      }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent failure events */}
            {failureEvents.length > 0 && (
              <div className="event-log-panel" style={{ marginTop: "16px" }}>
                <div className="event-log-title">Recent Failure Events</div>
                {failureEvents.slice(0, 4).map((fe) => (
                  <div key={fe.id} className="event-log-item">
                    <div className="event-log-header">
                      <span style={{ color: "var(--amber)" }}>
                        #{String(fe.shipmentId).padStart(5,"0")} {fe.productName}
                      </span>
                      <span style={{
                        color: fe.recoveryStatus === "RECOVERED"
                          ? "var(--green)" : "var(--amber)",
                        fontSize: "9px", fontWeight: "bold",
                      }}>
                        {fe.recoveryStatus}
                      </span>
                    </div>
                    <div className="event-log-body">
                      <span style={{ color: "var(--text-muted)" }}>
                        {fe.type === "VEHICLE_FAILURE" ? "🚛 Vehicle Breakdown"
                          : fe.type === "DELAY"        ? "↗ Route Blocked"
                          : fe.type === "ROUTE_UNAVAILABLE" ? "⚡ Critical Failure"
                          : fe.type}
                      </span>
                      {fe.recoveryAction && (
                        <span style={{ color: "var(--cyan)" }}> · {fe.recoveryAction}</span>
                      )}
                    </div>
                    <div className="event-log-time">
                      Detected: {new Date(fe.detectedAt).toLocaleTimeString()}
                      {fe.resolvedAt && ` · Resolved: ${new Date(fe.resolvedAt).toLocaleTimeString()}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT PANEL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Journey Timeline */}
            {selectedShipment && (
              <div className="log-panel">
                <div className="log-header">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Shipment Journey — #{String(selectedShipment.id).padStart(5,"0")}
                  </span>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px var(--green)", animation: "blink 1.5s infinite", marginLeft: "auto" }} />
                </div>
                <div style={{ padding: "20px" }}>
                  {journey.map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: "16px" }}>
                      {/* Circle + connector line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "28px", flexShrink: 0 }}>
                        <div style={{
                          width: "28px", height: "28px", borderRadius: "50%",
                          background: step.done ? statusColor(step.status) : "var(--bg-deep)",
                          border: `2px solid ${step.done ? statusColor(step.status) : "var(--border-dim)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px",
                          color: step.done ? "var(--bg-void)" : "var(--text-dim)",
                          fontWeight: "bold", flexShrink: 0,
                          boxShadow: step.done ? `0 0 12px ${statusColor(step.status)}50` : "none",
                          transition: "all 0.4s",
                        }}>
                          {statusIcon(step.status)}
                        </div>
                        {i < journey.length - 1 && (
                          <div style={{
                            width: "2px", flex: 1, minHeight: "28px",
                            background: step.done
                              ? `linear-gradient(${statusColor(step.status)}, ${statusColor(journey[i+1].status)})`
                              : "var(--border-dim)",
                            margin: "4px 0",
                            transition: "all 0.4s",
                          }} />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ paddingBottom: i < journey.length - 1 ? "16px" : "0", flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: "11px", fontWeight: "bold", letterSpacing: "1px",
                            color: step.done ? statusColor(step.status) : "var(--text-dim)",
                          }}>
                            {step.status.replace("_"," ")}
                          </span>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-dim)" }}>
                            {step.done ? step.time : "pending"}
                          </span>
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: step.done ? "var(--text-primary)" : "var(--text-dim)", marginBottom: "3px" }}>
                          {step.text}
                        </div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: step.done ? "var(--text-muted)" : "var(--text-dim)" }}>
                          {step.sub}
                        </div>

                        {/* Extra detail for RECOVERED — show both route and vehicle if available */}
                        {step.status === "RECOVERED" && step.done && selectedShipment && (
                          <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
                            {selectedShipment.reroutedVia && (
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--amber)", background: "rgba(245,158,11,0.08)", padding: "3px 8px", borderRadius: "3px", display: "inline-block" }}>
                                ↗ Route: {selectedShipment.reroutedVia}
                              </div>
                            )}
                            {selectedShipment.backupVehicle && (
                              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--cyan)", background: "rgba(6,182,212,0.08)", padding: "3px 8px", borderRadius: "3px", display: "inline-block" }}>
                                🚛 Vehicle: {selectedShipment.backupVehicle}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All shipments live */}
            <div className="log-panel">
              <div className="log-header">
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "2px", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  All Shipments — Live Status
                </span>
                <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", color: "var(--text-dim)" }}>
                  {lastUpdated}
                </span>
              </div>
              <div className="log-body">
                {allShipments.map((s) => (
                  <div
                    key={s.id}
                    className="shipment-live-row"
                    style={{
                      borderColor: s.id === parseInt(selectedId)
                        ? statusColor(s.status)
                        : s.status === "DELAYED" ? "rgba(245,158,11,0.3)"
                        : s.status === "FAILED"  ? "rgba(239,68,68,0.3)"
                        : "var(--border-dim)",
                      background: s.id === parseInt(selectedId)
                        ? `${statusColor(s.status)}08`
                        : s.status === "DELAYED" ? "rgba(245,158,11,0.03)"
                        : s.status === "FAILED"  ? "rgba(239,68,68,0.03)"
                        : "var(--bg-deep)",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedId(String(s.id));
                      fetchShipmentEvents(s.id);
                    }}
                  >
                    <div className="slr-header">
                      <span style={{ color: "var(--amber)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                        #{String(s.id).padStart(5,"0")}
                      </span>
                      <span style={{ color: "var(--text-bright)", fontFamily: "'JetBrains Mono', monospace", fontSize: "10px" }}>
                        {s.productName}
                      </span>
                      <span style={{ color: statusColor(s.status), fontFamily: "'JetBrains Mono', monospace", fontSize: "9px", fontWeight: "bold", letterSpacing: "1px", marginLeft: "auto" }}>
                        {statusIcon(s.status)} {s.status.replace("_"," ")}
                      </span>
                    </div>
                    <div className="slr-route">{s.source} → {s.destination}</div>
                    {s.status === "IN_TRANSIT" && <div className="slr-event cyan">→ En route to {s.destination}</div>}
                    {s.status === "DELAYED"    && <div className="slr-event amber">⚠ {s.failureReason || "Delay detected"}</div>}
                    {s.status === "FAILED"     && <div className="slr-event red">✕ Recovery protocol active...</div>}
                    {s.status === "RECOVERED"  && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        {s.reroutedVia   && <div className="slr-event amber">↗ {s.reroutedVia}</div>}
                        {s.backupVehicle && <div className="slr-event cyan">🚛 {s.backupVehicle}</div>}
                        {!s.reroutedVia && !s.backupVehicle && <div className="slr-event cyan">✓ Recovered</div>}
                      </div>
                    )}
                    {s.status === "DELIVERED"  && <div className="slr-event green">★ Delivered to {s.destination}</div>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default FailureMonitor;