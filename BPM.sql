-- ======================================================
-- BPM Database Schema
-- Database: bpmdb
-- Charset:  utf8mb4
-- ======================================================

DROP SCHEMA IF EXISTS `bpmdb`;

CREATE SCHEMA IF NOT EXISTS `bpmdb` DEFAULT CHARACTER SET utf8mb4;
USE `bpmdb`;

-- ======================================================
-- Table: bpmusergroup
-- Purpose: Stores all user groups.
-- ======================================================

DROP TABLE IF EXISTS `bpmusergroup`;

CREATE TABLE `bpmusergroup` (
  `Groupid`   varchar(10) NOT NULL,
  `Groupname` varchar(50) NOT NULL,
  `Grouptype` varchar(1)  DEFAULT NULL,  -- N=normal, S=system
  PRIMARY KEY (`Groupid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `bpmusergroup` VALUES
('Admin',    '系統管理員',        'N'),
('President','總經理',            'N'),
('CEO',      '執行長',            'N'),
('VP',       '副總',              'N'),
('Manager',  '經理',              'N'),
('Employee', '員工',              'N'),
('Member',   '會員',              'N'),
('TOCaller', 'API Timeout Caller','S');


-- ======================================================
-- Table: bpmuser
-- Purpose: Stores all users.
-- ======================================================

DROP TABLE IF EXISTS `bpmuser`;

CREATE TABLE `bpmuser` (
  `Userid`      varchar(64) NOT NULL,
  `Password`    varchar(64) NOT NULL,
  `Loginemail`  varchar(50) NOT NULL,
  `Loginmobile` varchar(24) NOT NULL,
  `Lastname`    varchar(24) NOT NULL,
  `Firstname`   varchar(24) NOT NULL,
  `Groupid`     varchar(10) DEFAULT NULL,
  `UserType`    varchar(1)  DEFAULT NULL COMMENT 'N=normal user, S=system, D=disable',
  PRIMARY KEY (`Userid`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`Groupid`) REFERENCES `bpmusergroup` (`Groupid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `bpmuser` VALUES
('M00001', '1', '1@1.com', '0955111111', '王',              '小明',   'Admin',    'N'),
('M00002', '1', '2@1.com', '0955111112', '李',              '大才',   'President','N'),
('M00003', '1', '3@1.com', '0955111113', '陳',              '中庸',   'CEO',      'N'),
('M00004', '1', '4@1.com', '0955111114', '趙',              '全包',   'VP',       'N'),
('M00005', '1', '5@1.com', '0955111115', '錢',              '全沒',   'Manager',  'N'),
('M00006', '1', '6@1.com', '0955111116', '孫',              '龜壽',   'Employee', 'N'),
('M00007', '1', '7@1.com', '0955111117', '周',              '蠻邦',   'Member',   'N'),
('M00008', '1', '8@1.com', '0955111118', 'Chen',            'Dennis', 'Member',   'N'),
('TOCaller','1', '9@1.com', '0955111118', 'API Timeout Caller', '',   'TOCaller', 'S');


-- ======================================================
-- Table: workflow
-- Purpose: Stores all workflow definitions.
-- MostUpdated = 'Y' means this is the active workflow step.
-- ======================================================

DROP TABLE IF EXISTS `workflow`;

CREATE TABLE IF NOT EXISTS `workflow` (
  `Sn`                  bigint      NOT NULL AUTO_INCREMENT,
  `FromUsergroupId`     VARCHAR(10) NULL DEFAULT NULL,
  `ToUsergroupId`       VARCHAR(10) NULL DEFAULT NULL,
  `CurrentWorkflowStep` bigint      DEFAULT NULL,
  `MostUpdated`         VARCHAR(1)  NULL DEFAULT NULL COMMENT 'N=No, Y=Yes',
  `Field1`              VARCHAR(256) NULL DEFAULT NULL,
  `Field2`              VARCHAR(256) NULL DEFAULT NULL,
  `Field3`              VARCHAR(256) NULL DEFAULT NULL,
  `Timecreated`         datetime    NULL DEFAULT NULL,
  `Timemodified`        datetime    NULL DEFAULT NULL,
  PRIMARY KEY (`Sn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `workflow` VALUES
(NULL, 'Employee', 'Manager',  1, 'Y', '', '', '', NULL, NULL),
(NULL, 'Manager',  'VP',       2, 'Y', '', '', '', NULL, NULL),
(NULL, 'VP',       'CEO',      3, 'Y', '', '', '', NULL, NULL),
(NULL, 'CEO',      'President',4, 'Y', '', '', '', NULL, NULL);


-- ======================================================
-- Table: processrecord
-- Purpose: Stores all records after workflow processing.
-- Result: R=reject, A=approve
-- ======================================================

DROP TABLE IF EXISTS `processrecord`;

CREATE TABLE IF NOT EXISTS `processrecord` (
  `Sn`              bigint      NOT NULL AUTO_INCREMENT,
  `Userid`          varchar(64) NOT NULL,
  `FromUserid`      varchar(64) NOT NULL,
  `FromUsergroupId` varchar(10) NOT NULL,
  `ToUserid`        varchar(64) NOT NULL,
  `ToUsergroupId`   varchar(10) NOT NULL,
  `WorkflowSn`      bigint      DEFAULT NULL,
  `Result`          VARCHAR(1)  NULL DEFAULT NULL COMMENT 'R=reject, A=approve',
  `Field1`          VARCHAR(256) NULL DEFAULT NULL,
  `Field2`          VARCHAR(256) NULL DEFAULT NULL,
  `Field3`          VARCHAR(256) NULL DEFAULT NULL,
  `Timecreated`     datetime    NULL DEFAULT NULL,
  `Timemodified`    datetime    NULL DEFAULT NULL,
  PRIMARY KEY (`Sn`),
  CONSTRAINT `processrecord_ibfk_1` FOREIGN KEY (`Userid`)     REFERENCES `bpmuser` (`Userid`),
  CONSTRAINT `processrecord_ibfk_2` FOREIGN KEY (`FromUserid`) REFERENCES `bpmuser` (`Userid`),
  CONSTRAINT `processrecord_ibfk_3` FOREIGN KEY (`ToUserid`)   REFERENCES `bpmuser` (`Userid`),
  INDEX `Userid_INDEX` (`Userid` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
