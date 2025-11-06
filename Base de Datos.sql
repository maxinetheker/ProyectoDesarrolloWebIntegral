CREATE DATABASE  IF NOT EXISTS `biblioteca_escolar` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `biblioteca_escolar`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: biblioteca_escolar
-- ------------------------------------------------------
-- Server version	8.4.6

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
-- Table structure for table `chatbot`
--

DROP TABLE IF EXISTS `chatbot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `chatbot` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `mensaje_recibido` text NOT NULL,
  `mensaje_respuesta` text NOT NULL,
  `fecha_consulta` datetime DEFAULT CURRENT_TIMESTAMP,
  `ip_origen` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_id_usuario` (`id_usuario`),
  KEY `idx_fecha_consulta` (`fecha_consulta`),
  KEY `idx_ip_origen` (`ip_origen`),
  CONSTRAINT `chatbot_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chatbot`
--

LOCK TABLES `chatbot` WRITE;
/*!40000 ALTER TABLE `chatbot` DISABLE KEYS */;
/*!40000 ALTER TABLE `chatbot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `codigos_barras`
--

DROP TABLE IF EXISTS `codigos_barras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `codigos_barras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `codigo` varchar(100) NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_caducidad` datetime NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `tipo` enum('temporal','permanente') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `idx_codigo` (`codigo`),
  KEY `idx_id_usuario` (`id_usuario`),
  KEY `idx_activo` (`activo`),
  KEY `idx_fecha_caducidad` (`fecha_caducidad`),
  CONSTRAINT `codigos_barras_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `codigos_barras`
--

LOCK TABLES `codigos_barras` WRITE;
/*!40000 ALTER TABLE `codigos_barras` DISABLE KEYS */;
INSERT INTO `codigos_barras` VALUES (1,1,'LIB-2025-00001','2025-11-04 15:48:22','2026-11-04 15:48:22',0,'permanente'),(3,2,'LIB-2025-00002-420778','2025-11-04 15:50:20','2026-11-04 15:50:21',0,'permanente'),(4,2,'LIB-2025-00002-423745','2025-11-04 15:50:23','2026-11-04 15:50:24',0,'permanente'),(5,2,'LIB-2025-00002-426766','2025-11-04 15:50:26','2026-11-04 15:50:27',0,'permanente'),(6,2,'LIB-2025-00002-430497','2025-11-04 15:50:30','2026-11-04 15:50:30',0,'permanente'),(7,2,'LIB-2025-00002-434719','2025-11-04 15:50:34','2026-11-04 15:50:35',1,'permanente'),(8,1,'LIB-2025-00001-547349','2025-11-04 15:52:27','2026-11-04 15:52:27',0,'permanente'),(9,1,'LIB-2025-00001-343762','2025-11-04 17:45:43','9999-12-31 23:59:59',0,'permanente'),(10,1,'LIB-2025-00001-350082','2025-11-04 17:45:50','2026-11-04 17:45:50',0,'temporal'),(11,1,'LIB-2025-00001-850172','2025-11-04 17:54:10','9999-12-31 23:59:59',0,'permanente'),(12,1,'LIB-2025-00001-854574','2025-11-04 17:54:14','2026-11-04 17:54:15',1,'temporal'),(13,13,'LIB-2025-00013-475113','2025-11-04 18:37:55','2026-11-04 18:37:55',1,'temporal');
/*!40000 ALTER TABLE `codigos_barras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entregas`
--

DROP TABLE IF EXISTS `entregas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `entregas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_libro` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_entrega` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion_programada` date DEFAULT NULL,
  `fecha_devolucion_real` datetime DEFAULT NULL,
  `estado` enum('prestado','devuelto','vencido','perdido') NOT NULL DEFAULT 'prestado',
  `observaciones_entrega` text,
  `observaciones_devolucion` text,
  `multa` decimal(10,2) DEFAULT '0.00',
  `pagado` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_id_libro` (`id_libro`),
  KEY `idx_id_usuario` (`id_usuario`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_devolucion_programada` (`fecha_devolucion_programada`),
  KEY `idx_fecha_entrega` (`fecha_entrega`),
  CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`id_libro`) REFERENCES `libro` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `entregas_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas`
--

LOCK TABLES `entregas` WRITE;
/*!40000 ALTER TABLE `entregas` DISABLE KEYS */;
INSERT INTO `entregas` VALUES (5,1,1,'2025-11-05 12:44:07','2025-11-19','2025-11-05 16:36:39','perdido',NULL,'111',1000.00,1),(14,3,1,'2025-11-05 21:31:42','2025-11-12','2025-11-05 21:32:14','devuelto',NULL,'sdfsdf',200.00,0),(15,3,1,'2025-11-05 23:09:02','2025-11-12',NULL,'prestado',NULL,NULL,0.00,0),(16,2,1,'2025-11-05 23:26:04','2025-11-12',NULL,'prestado',NULL,NULL,0.00,0);
/*!40000 ALTER TABLE `entregas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `libro`
--

DROP TABLE IF EXISTS `libro`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `libro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `autor` varchar(255) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `editorial` varchar(100) DEFAULT NULL,
  `año_publicacion` year DEFAULT NULL,
  `genero` varchar(50) DEFAULT NULL,
  `descripcion` text,
  `stock` int NOT NULL DEFAULT '0',
  `stock_disponible` int NOT NULL DEFAULT '0',
  `ubicacion` varchar(50) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `url_portada` text,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`),
  KEY `idx_nombre` (`nombre`),
  KEY `idx_autor` (`autor`),
  KEY `idx_isbn` (`isbn`),
  KEY `idx_genero` (`genero`),
  KEY `idx_activo` (`activo`),
  KEY `idx_stock_disponible` (`stock_disponible`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `libro`
--

LOCK TABLES `libro` WRITE;
/*!40000 ALTER TABLE `libro` DISABLE KEYS */;
INSERT INTO `libro` VALUES (1,'Cien años de soledad','Gabriel García Márquez','9787181743582','Sudamericana',1925,'Realismo mágico','asfsfas',34,33,'Pasillo 3, Estante B','2025-11-05 11:05:21','2025-11-06 09:52:46','assets/images/portadas/portada_1762440766397_e0088a97.jpg',1),(2,'El Señor de los Anillos: La Comunidad del Anillo','J.R.R. Tolkien','9788320261790','Minotauro',1954,'Fantasía Épica','El inicio de la épica aventura del hobbit Frodo Bolsón para destruir el Anillo Único y derrotar al Señor Oscuro, Sauron.',15,14,'Sección Fantasía, Estante 1A','2025-11-05 11:29:16','2025-11-06 11:25:43','assets/images/portadas/portada_1762446343887_ba000d5c.webp',1),(3,'The Rust Programming Language','Steve Klabnik y Carol Nichols','9781718500','No Starch Press',2018,'Programación / Tecnología','',1,0,'Sección Informática, Estante R-1','2025-11-05 15:08:35','2025-11-06 11:19:19','assets/images/portadas/portada_1762445959680_7ee845af.jpg',1),(4,'La Revista','Gabriel García Márquez','9780326115633','Minotauro',1950,'Fantasía Épica','',10,10,'Lima','2025-11-05 22:59:57','2025-11-06 11:27:56','assets/images/portadas/portada_1762446459562_6f4a061a.webp',1),(5,'Juan y los firjoles','J.R.R. Tolkien','9784445038194','No Starch Press',1920,'Fantasía Épica','Descripco´pomn',1,1,'Sección Fantasía, Estante 1A','2025-11-05 23:00:44','2025-11-06 11:26:48','assets/images/portadas/portada_1762446408535_f0570656.webp',1),(6,'1984','George Orwell','978849989094','Debolsillo',1949,'Distopía / Ciencia Ficción','Novela distópica que presenta un futuro totalitario donde el Partido y su líder, el \"Gran Hermano\", vigilan y controlan cada aspecto de la vida. Sigue a Winston Smith, un trabajador que comienza a cuestionar el régimen y a buscar la verdad.',15,15,'Sección Clásicos, Estante G','2025-11-06 11:14:20','2025-11-06 11:14:20','assets/images/portadas/portada_1762445660569_10cfeeb2.webp',1);
/*!40000 ALTER TABLE `libro` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rol` varchar(50) NOT NULL,
  `descripcion` text,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `rol` (`rol`),
  KEY `idx_rol` (`rol`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol`
--

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` VALUES (1,'Administrador','Acceso completo al sistema','2025-10-13 20:28:43',1),(2,'Bibliotecario','Gestiona la entrega de libros','2025-10-13 20:28:43',1),(3,'Usuario','Consulta y préstamo de libros','2025-10-13 20:28:43',1);
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `contrasena` varchar(255) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `direccion` text,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_rol` int DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuario` (`usuario`),
  KEY `idx_email` (`email`),
  KEY `idx_id_rol` (`id_rol`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
INSERT INTO `usuario` VALUES (1,'admin','Kervi','Falcón','admin@biblioteca.com','240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9','555-0001','Oficina Central','2025-10-13 21:40:36','2025-11-04 17:59:51',1,1),(2,'usuario','Usuario','Prueba','usuario@biblioteca.com','dfa7a2273567dcd1efffb9a46308e91c20fa13c44c3441bc69cd6a7869b3f7fd','555-0002','Sede Principal','2025-10-13 21:40:36','2025-11-04 17:45:25',3,1),(3,'mgarcia','María','García','mgarcia@biblioteca.com','9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08','555-0003','Sede Principal B','2025-10-13 21:40:36','2025-11-04 15:00:00',2,1),(4,'jlopez','Juan','Lopez','jlopez@biblioteca.com','2c26b46b68ffc68ff99b453c1d30413413422a5b1f93b7f3f8de0c0f8a7e7b0a','555-0004','Sede Sur','2025-10-13 21:40:36','2025-11-04 15:00:00',2,1),(5,'arodriguez','Ana','Rodríguez','arodriguez@biblioteca.com','ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f','555-0005','Sede Norte','2025-10-13 21:40:36','2025-11-05 23:59:39',3,1),(6,'lcastillo','Luis','Castillo','lcastillo@biblioteca.com','7c222fb2927d828af22f592134e8932480637c0d0d7d0b6a9d5b3c2a1f0e9d8c','555-0006','Sede Este','2025-10-13 21:40:36','2025-11-04 15:00:00',2,1),(7,'jmartinez','José','Martínez','jmartinez@biblioteca.com','b94d27b9934d3e08a52e52d7da7dabfade16b6a9e9f1f8a6cabd4a8b9e6c3d2f','555-0007','Urbanización A','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(8,'cfernandez','Carla','Fernández','cfernandez@biblioteca.com','1f3870be274f6c49b3e31a0c6728957f5f1a3b2c3d4e5f6a7b8c9d0e1f2a3b4c','555-0008','Urbanización B','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(9,'rsanchez','Raúl','Sánchez','rsanchez@biblioteca.com','6b86b273ff34fce19d6b804eff5a3f5745a2c3d4e6f7b8a9c0d1e2f3a4b5c6d7','555-0009','Av. Central 123','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(10,'perez_l','Lucía','Pérez','lperez@biblioteca.com','8d969eef6ecad3c29a3a629280e686cf9f1f3e7a6b5c4d3e2f1a0b9c8d7e6f5','555-0010','Jr. Los Álamos 45','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(11,'gomez_p','Pedro','Gómez','pgomez@biblioteca.com','4b227777d4dd1fc61c6f884f48641d02b7fb8f3a9b1c2d3e4f5a6b7c8d9e0f1','555-0011','Jr. Primavera 9','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(12,'mruiz','Marcos','Ruiz','mruiz@biblioteca.com','ef797c8118f02dfb6498c2a3b1f35c4b6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f2','555-0012','Jr. Sol 77','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(13,'avargas','Alfredo','Vargas','avargas@biblioteca.com','ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f','555-0013','Centro 5','2025-10-13 21:40:36','2025-11-06 00:01:13',2,1),(14,'nrodriguez','Natalia','Rodríguez','nrodriguez@biblioteca.com','900150983cd24fb0d6963f7d28e17f72a7c8d9e6f5a4b3c2d1e0f123456789ab','555-0014','Barrio Litoral','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(15,'tcastro','Tomás','Castro','tcastro@biblioteca.com','f96b697d7cb7938d525a2f31aaf161d0f3e2d1c4b5a6f7e8d9c0b1a2c3d4e5f6','555-0015','Parque Norte 2','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(16,'evargas','Estela','Vargas','evargas@biblioteca.com','c1dfd96eea8cc2b62785275bca38ac261256e278b5c1f2d3e4f5a6b7c8d9e0f1','555-0016','Calle Falsa 123','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(17,'lima_d','Diego','Lima','dlima@biblioteca.com','45c48cce2e2d7fbdea1afc51c7c6ad26a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6','555-0017','Av. Libertad 10','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(18,'quintana','Sofía','Quintana','squintana@biblioteca.com','d3d9446802a44259755d38e6d163e820f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6','555-0018','Zona Cultural','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(19,'pablo_r','Pablo','Ramírez','pramirez@biblioteca.com','6512bd43d9caa6e02c990b0a82652dca1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d','555-0019','Av. Cultura 22','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1),(20,'isabel_m','Isabel','Mendoza','imendoza@biblioteca.com','aab3238922bcc25a6f606eb525ffdc56c1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6','555-0020','Jr. Las Flores 8','2025-10-13 21:40:36','2025-11-04 15:00:00',3,1);
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-06 11:32:55
