-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: logistics_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `failure_events`
--

DROP TABLE IF EXISTS `failure_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failure_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `detected_at` datetime(6) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `recovery_action` varchar(255) DEFAULT NULL,
  `recovery_status` enum('FAILED','IN_PROGRESS','PENDING','RECOVERED') NOT NULL,
  `resolved_at` datetime(6) DEFAULT NULL,
  `type` enum('BREAKDOWN','DELAY','MANUAL','ROUTE_UNAVAILABLE','VEHICLE_FAILURE') NOT NULL,
  `shipment_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK3wt0pfngcogs3fken0r6gpwxo` (`shipment_id`),
  CONSTRAINT `FK3wt0pfngcogs3fken0r6gpwxo` FOREIGN KEY (`shipment_id`) REFERENCES `shipments` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failure_events`
--

LOCK TABLES `failure_events` WRITE;
/*!40000 ALTER TABLE `failure_events` DISABLE KEYS */;
INSERT INTO `failure_events` VALUES (68,'2026-04-30 01:24:27.887705','Shipment exceeded expected transit time of 3 minutes','Rerouted via Route NH-48 via Vellore','RECOVERED','2026-04-30 01:25:17.980291','DELAY',56),(69,'2026-04-30 01:24:27.903586','Shipment exceeded expected transit time of 3 minutes','Rerouted via Route NH-48 via Vellore','RECOVERED','2026-04-30 01:25:17.980291','DELAY',57),(70,'2026-04-30 01:24:27.919494','Shipment exceeded expected transit time of 3 minutes','Rerouted via Route NH-38 via Dindigul','RECOVERED','2026-04-30 01:25:17.980291','DELAY',58),(71,'2026-04-30 01:24:27.935495','Shipment exceeded expected transit time of 3 minutes','Rerouted via Route NH-48 via Vellore','RECOVERED','2026-04-30 01:25:17.992374','DELAY',59),(72,'2026-04-30 01:24:27.935495','Shipment exceeded expected transit time of 3 minutes','Rerouted via Route NH-38 via Dindigul','RECOVERED','2026-04-30 01:25:18.005580','DELAY',60);
/*!40000 ALTER TABLE `failure_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `shipments`
--

DROP TABLE IF EXISTS `shipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `shipments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `backup_vehicle` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `destination` varchar(255) NOT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `recovery_attempts` int DEFAULT NULL,
  `rerouted_via` varchar(255) DEFAULT NULL,
  `source` varchar(255) NOT NULL,
  `status` enum('ACTIVE','DELAYED','DELIVERED','FAILED','IN_TRANSIT','RECOVERED') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `shipments`
--

LOCK TABLES `shipments` WRITE;
/*!40000 ALTER TABLE `shipments` DISABLE KEYS */;
INSERT INTO `shipments` VALUES (56,NULL,'2026-04-30 01:21:27.649210','Chennai','Shipment exceeded expected transit time of 3 minutes','Rice Bags 50kg',1,'Route NH-48 via Vellore','Thanjavur','RECOVERED','2026-04-30 01:25:17.964525'),(57,NULL,'2026-04-30 01:21:27.704682','Tirupur','Shipment exceeded expected transit time of 3 minutes','Cotton Bales',1,'Route NH-48 via Vellore','Coimbatore','RECOVERED','2026-04-30 01:25:17.964525'),(58,NULL,'2026-04-30 01:21:27.712892','Dindigul','Shipment exceeded expected transit time of 3 minutes','Cement Bags',1,'Route NH-38 via Dindigul','Madurai','RECOVERED','2026-04-30 01:25:17.966533'),(59,NULL,'2026-04-30 01:21:27.716360','Vellore','Shipment exceeded expected transit time of 3 minutes','Electronic Parts',1,'Route NH-48 via Vellore','Chennai','RECOVERED','2026-04-30 01:25:17.974266'),(60,NULL,'2026-04-30 01:21:27.716360','Salem','Shipment exceeded expected transit time of 3 minutes','Textile Goods',1,'Route NH-38 via Dindigul','Erode','RECOVERED','2026-04-30 01:25:17.980291');
/*!40000 ALTER TABLE `shipments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-30  7:07:54
