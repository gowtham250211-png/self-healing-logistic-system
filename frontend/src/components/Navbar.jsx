import React from "react";
import "../styles/style.css";

function Navbar() {
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <h2>Self-Healing Logistics</h2>
        <div className="menu">
          <button className="nav-btn" onClick={() => scrollTo("dashboard")}>Dashboard</button>
          <button className="nav-btn" onClick={() => scrollTo("create")}>Create Shipment</button>
          <button className="nav-btn" onClick={() => scrollTo("shipments")}>Shipments</button>
          <button className="nav-btn" onClick={() => scrollTo("monitor")}>Failure Monitor</button>
        </div>
      </div>
    </div>
  );
}

export default Navbar;