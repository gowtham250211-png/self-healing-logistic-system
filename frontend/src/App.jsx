import React from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import CreateShipment from "./components/CreateShipment";
import ShipmentList from "./components/ShipmentList";
import FailureMonitor from "./components/FailureMonitor";
import "./styles/style.css";

function App() {
  return (
    <div style={{ minHeight: "100vh", width: "100%" }}>
      <Navbar />
      <div id="dashboard"><Dashboard /></div>
      <div id="create"><CreateShipment /></div>
      <div id="shipments"><ShipmentList /></div>
      <div id="monitor"><FailureMonitor /></div>
    </div>
  );
}

export default App;