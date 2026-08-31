# 🚚 Autonomous Self-Healing Logistics & Supply Chain Platform

An intelligent, event-driven logistics orchestration platform engineered with automated failure detection, dynamic route re-optimization, and self-healing mitigation workflows to prevent supply chain bottlenecks and cargo delivery disruptions in real time.

---

## 🏗️ System Architecture & Self-Healing Pipeline

┌─────────────────────────────────────────────────────────────┐
│             Shipment & IoT Telemetry Ingestion              │
│      (GPS Coordinates, Temperature, Velocity, Milestones)   │
└──────────────────────────────┬──────────────────────────────┘
│
┌──────────────────────────────▼──────────────────────────────┐
│                  Failure Detection Engine                   │
│  (Delay Projections, Cold Chain Breaches, Route Stoppages)  │
└──────────────┬───────────────────────────────┬──────────────┘
│ [Anomaly Detected]            │ [Normal Flow]
┌──────────────▼──────────────┐                │
│    Self-Healing Engine      │                │
│ • Dynamic Rerouting         │                │
│ • Alternative Hub Balancing │                │
│ • Carrier Auto-Failover     │                │
└──────────────┬──────────────┘                │
│                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│               Notification & Operational Hub                │
│      (Live Dashboard, Driver Alerts, Incident Logging)      │
└─────────────────────────────────────────────────────────────┘


---

## ✨ Core Platform Capabilities

### 🔍 Failure Detection Engine
* **Predictive Delay Calculation**: Compares real-time GPS telemetry and traffic data against target delivery SLAs to flag potential delays before they escalate.
* **Cold-Chain & Integrity Monitoring**: Continuous verification of environmental sensors (temperature, humidity, shock) with immediate threshold trip-triggers.
* **Transit Anomaly Identification**: Automatically detects prolonged unscheduled stops, route deviations, and checkpoint bypasses.

### ⚡ Autonomous Self-Healing Workflows
* **Dynamic Route Remediation**: Re-computes optimal detour paths around road closures, congestion points, and regional weather bottlenecks.
* **Smart Carrier & Vehicle Reassignment**: Re-allocates stalled shipments to available standby fleet units within nearest logistics hubs.
* **Automated Escalation Triggers**: Instantly provisions replacement dispatches if a critical failure cannot be safely mitigated en route.

### 📊 Real-Time Operations & Monitoring
* **Live Fleet Tracking Dashboard**: Interactive visualizer showing live fleet status, shipment health, and route progress.
* **Incident Ledger & Root Cause Analytics**: Structured audit log tracking every detected anomaly, auto-remediation attempt, and final resolution.
* **Operator Override Controls**: Allows dispatch managers to inspect, approve, or adjust automated remediation proposals.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend** | Spring Boot 3, Java 21 | High-throughput REST API & failure detection engine |
| **Security & Data** | Spring Data JPA, Hibernate | Object-relational mapping & transaction management |
| **Database** | PostgreSQL | Relational storage for shipments, telemetry, and audit logs |
| **Frontend** | React, Tailwind CSS | Real-time fleet command center & incident interface |
| **Build Tools** | Maven / Gradle, Vite | Dependency management and frontend bundling |

---

## 🚀 Local Setup & Run Guide

### Prerequisites
* **Java Development Kit (JDK)**: Version 17 or 21 installed
* **Node.js**: Version 18+ and `npm` installed
* **PostgreSQL**: Installed and running locally on port `5432`

---

### Step 1: Database Setup
1. Start your local PostgreSQL server.
2. Create a database for the application (e.g., in `pgAdmin` or `psql`):
   ```sql
   CREATE DATABASE logistics_db;
Update your database username and password in backend/src/main/resources/application.properties (or application.yml):

Properties
spring.datasource.url=jdbc:postgresql://localhost:5432/logistics_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
Step 2: Start the Spring Boot Backend
Open a terminal in the project root:

Bash
cd backend
mvn spring-boot:run
(Or use ./mvnw spring-boot:run on Linux/macOS or mvnw.cmd spring-boot:run on Windows)

The backend server will launch at http://localhost:8080.

Step 3: Start the React Frontend
Open a new terminal window:

Bash
cd frontend
npm install
npm run dev
The frontend application will be live at http://localhost:5173 (or http://localhost:3000).

📡 Core API Reference
Plaintext
POST   /api/shipments                 - Register new cargo shipment and define baseline route
GET    /api/shipments/{id}/status     - Fetch live shipment metrics, route coordinates, and ETA
POST   /api/telemetry/ingest          - Push real-time IoT vehicle/sensor telemetry packets
GET    /api/incidents                 - Retrieve all active anomalies and triggered failure states
POST   /api/incidents/{id}/remediate  - Trigger automated self-healing mitigation action
GET    /api/audit/logs                - Retrieve complete ledger of system anomalies and actions
