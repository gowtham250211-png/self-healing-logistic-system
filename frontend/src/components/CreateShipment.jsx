import React, { useState } from "react";
import API from "../services/api";

const TN_DISTRICTS = [
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
  "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Dindigul",
  "Thanjavur", "Cuddalore", "Kanchipuram", "Tirupur", "Namakkal",
  "Krishnagiri", "Dharmapuri", "Virudhunagar", "Ramanathapuram",
  "Theni", "Tiruvannamalai", "Villupuram", "Karur", "Perambalur",
];

function CreateShipment() {
  const [shipment, setShipment] = useState({
    productName: "",
    source: "",
    destination: "",
    status: "ACTIVE",
  });
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setShipment({ ...shipment, [e.target.name]: e.target.value });
  }

  function submitShipment(e) {
    e.preventDefault();
    if (!shipment.productName || !shipment.source || !shipment.destination) {
      alert("Please fill all fields.");
      return;
    }
    setLoading(true);
    API.post("/shipments", shipment)
      .then(() => {
        setSuccess(true);
        setShipment({ productName: "", source: "", destination: "", status: "ACTIVE" });
        setTimeout(() => setSuccess(false), 4000);
      })
      .catch(() => alert("Failed to create shipment."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="page-section">
      <div className="divider" />
      <div className="inner">
        <div className="section-label">New Entry</div>

        <div className="create-section">
          {/* Form */}
          <div>
            <h2 className="section-heading">Create Shipment</h2>
            <p className="section-desc">
              Register a new logistics entry into the Tamil Nadu network
            </p>

            {success && (
              <div className="success-banner">
                ✓ Shipment dispatched successfully! Tracking has begun.
              </div>
            )}

            <div className="form-panel">
              <form onSubmit={submitShipment}>
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    name="productName"
                    value={shipment.productName}
                    placeholder="e.g. Rice Bags 50kg, Cotton Bales..."
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Source District</label>
                  <select
                    name="source"
                    value={shipment.source}
                    onChange={handleChange}
                    className="select-input"
                    required
                  >
                    <option value="">Select origin district...</option>
                    {TN_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "28px" }}>
                  <label>Destination District</label>
                  <select
                    name="destination"
                    value={shipment.destination}
                    onChange={handleChange}
                    className="select-input"
                    required
                  >
                    <option value="">Select destination district...</option>
                    {TN_DISTRICTS.filter((d) => d !== shipment.source).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" disabled={loading}>
                  <span>{loading ? "⟳ Dispatching..." : "⟶  Dispatch Shipment"}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Steps */}
          <div className="steps-panel">
            <div className="steps-title">Shipment Lifecycle</div>
            {[
              { step: "01", label: "ACTIVE",      color: "#10b981", desc: "Shipment created and registered in system" },
              { step: "02", label: "IN TRANSIT",  color: "#06b6d4", desc: "Picked up — click IN TRANSIT to begin" },
              { step: "03", label: "DELAYED",     color: "#f59e0b", desc: "Failure detected — system notified" },
              { step: "04", label: "FAILED",      color: "#ef4444", desc: "Recovery protocol activated" },
              { step: "05", label: "RECOVERED",   color: "#06b6d4", desc: "Rerouted via backup route or vehicle" },
              { step: "06", label: "DELIVERED",   color: "#10b981", desc: "Click DELIVER to confirm completion" },
            ].map((item) => (
              <div key={item.step} className="step-item">
                <div className="step-line" style={{ background: item.color }} />
                <div className="step-num" style={{ color: item.color }}>{item.step}</div>
                <div>
                  <div className="step-label" style={{ color: item.color }}>{item.label}</div>
                  <div className="step-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateShipment;