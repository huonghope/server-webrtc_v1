-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: webrtc
-- ------------------------------------------------------
-- Server version	8.0.19

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
-- Table structure for table `plass_lecture`
--

DROP TABLE IF EXISTS `plass_lecture`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plass_lecture` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lec_idx` int DEFAULT NULL,
  `class_tp` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `grade` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `class_nm` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lec_tp` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `stu_cnt` int DEFAULT NULL COMMENT '학생인원수',
  `subject_nm` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lecture_nm` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lecture_cnt` int DEFAULT NULL COMMENT '회차',
  `lecture_date` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `stime` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `etime` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lec_status` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `test_tp` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `test_gap` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `app_key` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plass_lecture`
--

LOCK TABLES `plass_lecture` WRITE;
/*!40000 ALTER TABLE `plass_lecture` DISABLE KEYS */;
INSERT INTO `plass_lecture` VALUES (22,26,'9','1','5','G',30,'테스트 211','테스트 12',12,'2020-12-20','16:35','17:00','E','01','01','BNrDBCr81Om9akb3TBq9wSmFLILaA8XGueQXhAiM');
/*!40000 ALTER TABLE `plass_lecture` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plass_redirect_key`
--

DROP TABLE IF EXISTS `plass_redirect_key`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plass_redirect_key` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lec_idx` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `user_idx` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `redirect_key` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plass_redirect_key`
--

LOCK TABLES `plass_redirect_key` WRITE;
/*!40000 ALTER TABLE `plass_redirect_key` DISABLE KEYS */;
INSERT INTO `plass_redirect_key` VALUES (17,'26','6','f73d96ce-e71f-463b-90d1-8844ea2cd4cd','2020-12-21 08:38:13');
/*!40000 ALTER TABLE `plass_redirect_key` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plass_refreshtokens`
--

DROP TABLE IF EXISTS `plass_refreshtokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plass_refreshtokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `refresh_token` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `expires` timestamp NULL DEFAULT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=221 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plass_refreshtokens`
--

LOCK TABLES `plass_refreshtokens` WRITE;
/*!40000 ALTER TABLE `plass_refreshtokens` DISABLE KEYS */;
INSERT INTO `plass_refreshtokens` VALUES (218,'6.b0886254325285c0d70d6dc463839970b4bc171df1a1c6646e989e629c5478c304f0eee1fa81b459',6,'2021-01-20 08:38:43','2020-12-21 08:38:42'),(219,'9.0ba7f6e4f71601f972d8b26280d84f6e81ee3c41ca22b6a7abc5134e59eafddb40ebc565819ed9e2',9,'2021-01-20 08:42:21','2020-12-21 08:42:21'),(220,'8.a274c222c0563f025d84bece7a55d4f13e9701abdffecc398ac62381207e8f77e0a0054a1c85491f',8,'2021-01-20 08:43:09','2020-12-21 08:43:09');
/*!40000 ALTER TABLE `plass_refreshtokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plass_room`
--

DROP TABLE IF EXISTS `plass_room`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plass_room` (
  `id` int NOT NULL AUTO_INCREMENT,
  `room_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lec_idx` int DEFAULT NULL,
  `user_idx` int DEFAULT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `redirect_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=512 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plass_room`
--

LOCK TABLES `plass_room` WRITE;
/*!40000 ALTER TABLE `plass_room` DISABLE KEYS */;
INSERT INTO `plass_room` VALUES (511,'테스트 12',26,6,'2020-12-21 08:38:43',17);
/*!40000 ALTER TABLE `plass_room` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plass_user`
--

DROP TABLE IF EXISTS `plass_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plass_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_idx` int DEFAULT NULL,
  `user_name` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '유저의 이름\\n',
  `user_status` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '회원상태(R:가입 X:탈퇴 S:중지 A:승인)',
  `user_tp` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '구분(S:학생 T:선생님 I:강사 G:일반)',
  `schul_nm` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '학교명',
  `grade` int DEFAULT NULL COMMENT '학년\n',
  `class_nm` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '반명',
  `class_no` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '번호\\n',
  `sc_code` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '시도교육청코드',
  `schul_code` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL COMMENT '표준학교코드',
  `app_key` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plass_user`
--

LOCK TABLES `plass_user` WRITE;
/*!40000 ALTER TABLE `plass_user` DISABLE KEYS */;
INSERT INTO `plass_user` VALUES (121,6,'홍길동','R','T','옥정초등학교',1,'1','7','J10','7602136','BNrDBCr81Om9akb3TBq9wSmFLILaA8XGueQXhAiM','2020-12-21 08:38:13'),(122,9,'학생3','R','S','옥정초등학교',1,'1','3','J10','7602136','BNrDBCr81Om9akb3TBq9wSmFLILaA8XGueQXhAiM','2020-12-21 08:42:21'),(123,8,'학생2','R','S','옥정초등학교',1,'1','1','J10','7602136','BNrDBCr81Om9akb3TBq9wSmFLILaA8XGueQXhAiM','2020-12-21 08:43:09');
/*!40000 ALTER TABLE `plass_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plass_user_req_lecout`
--

DROP TABLE IF EXISTS `plass_user_req_lecout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plass_user_req_lecout` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lecname` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(45) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plass_user_req_lecout`
--

LOCK TABLES `plass_user_req_lecout` WRITE;
/*!40000 ALTER TABLE `plass_user_req_lecout` DISABLE KEYS */;
/*!40000 ALTER TABLE `plass_user_req_lecout` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plass_user_req_question`
--

DROP TABLE IF EXISTS `plass_user_req_question`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plass_user_req_question` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `lecname` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `status` int DEFAULT NULL COMMENT '1는 수락, 0는 거절',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plass_user_req_question`
--

LOCK TABLES `plass_user_req_question` WRITE;
/*!40000 ALTER TABLE `plass_user_req_question` DISABLE KEYS */;
/*!40000 ALTER TABLE `plass_user_req_question` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plass_userroom`
--

DROP TABLE IF EXISTS `plass_userroom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plass_userroom` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_idx` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `room_id` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `host_user` int DEFAULT '0',
  `socket_id` varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=829 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plass_userroom`
--

LOCK TABLES `plass_userroom` WRITE;
/*!40000 ALTER TABLE `plass_userroom` DISABLE KEYS */;
INSERT INTO `plass_userroom` VALUES (826,'6','511',1,'lw2W3V7npi7Vb-5LAAAA','2020-12-21 08:38:43'),(827,'9','511',0,'1YFSHXxUjShWWJ4_AAAE','2020-12-21 08:42:22'),(828,'8','511',0,'83F5awEMlc78FOMfAAAF','2020-12-21 08:43:10');
/*!40000 ALTER TABLE `plass_userroom` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2020-12-21 17:53:55
