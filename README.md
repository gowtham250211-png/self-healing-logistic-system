# 🚚 Self-Healing Logistics System

A smart logistics platform designed to automatically detect shipment disruptions and perform recovery actions with minimal human intervention. The system improves logistics reliability by monitoring shipments in real time, identifying failures, assigning backup vehicles, and selecting alternate routes.

## 📌 Features

* 📦 Real-time shipment tracking
* 🚨 Automated failure detection
* 🔄 Self-healing recovery mechanism
* 🚛 Backup vehicle assignment
* 🗺️ Alternate route optimization
* 🔔 Notification system
* 👥 Role-Based Access Control (Admin/User)
* 📊 Logistics dashboard and analytics
* 🔗 REST API integration
* 🏗️ Microservices-based architecture

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3
* Bootstrap
* Axios

### Backend

* Java 17
* Spring Boot
* Spring Data JPA
* Spring Security
* REST APIs

### Database

* MySQL

### Tools & Platforms

* Git & GitHub
* Postman
* IntelliJ IDEA
* VS Code
* Apache Tomcat
* Docker

## 🏗️ System Architecture

```
Frontend (React.js)
        ↓
REST APIs (Axios)
        ↓
Spring Boot Backend
        ↓
Microservices Layer
 ├── User Service
 ├── Shipment Service
 ├── Failure Detection Service
 ├── Recovery Service
 ├── Notification Service
        ↓
MySQL Database
```

## 🔄 Self-Healing Workflow

1. Shipment is created and assigned to a vehicle.
2. System continuously monitors shipment status.
3. Delays or disruptions are automatically detected.
4. Shipment status changes:

   ```
   NORMAL → DELAYED → FAILED → RECOVERED
   ```
5. Recovery service selects:

   * Backup vehicle
   * Alternate route
6. Shipment is reassigned automatically.
7. Notifications are sent to users/admins.

## 📂 Project Modules

* User Management
* Shipment Management
* Vehicle Management
* Failure Detection
* Recovery Management
* Route Optimization
* Notification System
* Admin Dashboard

## 💾 Database Entities

* Users
* Shipments
* Vehicles
* Routes
* Failures
* Recoveries
* Notifications

## 🚀 Installation

### Backend

```bash
git clone https://github.com/your-username/self-healing-logistics-system.git
cd backend
```

Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/logistics_db
spring.datasource.username=root
spring.datasource.password=your_password
```

Run:

```bash
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📸 Screenshots

Add screenshots here:

* Login Page
* Dashboard
* Shipment Tracking
* Failure Detection Screen
* Recovery Dashboard

## 🎯 Future Enhancements

* AI-based demand prediction
* Real-time GPS integration
* IoT-enabled vehicle monitoring
* Cloud deployment (AWS)
* Advanced analytics dashboard

## 👨‍💻 Author

**Gowtham G**
B.Tech – Artificial Intelligence and Data Science
Full Stack Java Developer

* GitHub: https://github.com/gowtham250211
* LinkedIn: https://linkedin.com/in/gowtham-g299132308
