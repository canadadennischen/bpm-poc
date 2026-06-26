'use strict';
require('dotenv').config();
process.env.TZ = 'Asia/Taipei';

const express = require('express');
const session = require('express-session');
const path    = require('path');
const mysql   = require('mysql2/promise');
const fs      = require('fs');

const authRouter       = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');
const pool             = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_please_change',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/v1/auth', authRouter);
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'Login.html')));
app.use(errorHandler);

async function initDB() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute('SET NAMES utf8mb4');
    const [r] = await conn.execute("SELECT COUNT(*) AS c FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='bpmuser'");
    if (r[0].c > 0) { console.log('[DB-INIT] already ok'); return; }
    console.log('[DB-INIT] creating tables...');
    await conn.execute(`CREATE TABLE IF NOT EXISTS \`bpmusergroup\`(\`Groupid\` varchar(10) NOT NULL,\`Groupname\` varchar(50) NOT NULL,\`Grouptype\` varchar(1) DEFAULT NULL,PRIMARY KEY(\`Groupid\`))ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await conn.execute(`INSERT IGNORE INTO \`bpmusergroup\` VALUES('Admin','系統管理員','N'),('President','總經理','N'),('CEO','執行長','N'),('VP','副總','N'),('Manager','經理','N'),('Employee','員工','N'),('Member','會員','N'),('TOCaller','API Timeout Caller','S')`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS \`bpmuser\`(\`Userid\` varchar(64) NOT NULL,\`Password\` varchar(64) NOT NULL,\`Loginemail\` varchar(50) NOT NULL,\`Loginmobile\` varchar(24) NOT NULL,\`Lastname\` varchar(24) NOT NULL,\`Firstname\` varchar(24) NOT NULL,\`Groupid\` varchar(10) DEFAULT NULL,\`UserType\` varchar(1) DEFAULT NULL,PRIMARY KEY(\`Userid\`),CONSTRAINT \`u_fk1\` FOREIGN KEY(\`Groupid\`) REFERENCES \`bpmusergroup\`(\`Groupid\`))ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await conn.execute(`INSERT IGNORE INTO \`bpmuser\` VALUES('M00001','1','1@1.com','0955111111','王','小明','Admin','N'),('M00002','1','2@1.com','0955111112','李','大才','President','N'),('M00003','1','3@1.com','0955111113','陳','中庸','CEO','N'),('M00004','1','4@1.com','0955111114','趙','全包','VP','N'),('M00005','1','5@1.com','0955111115','錢','全沒','Manager','N'),('M00006','1','6@1.com','0955111116','孫','龜壽','Employee','N'),('M00007','1','7@1.com','0955111117','周','蠻邦','Member','N'),('M00008','1','8@1.com','0955111118','Chen','Dennis','Member','N'),('TOCaller','1','9@1.com','0955111118','API Timeout Caller','','TOCaller','S')`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS \`workflow\`(\`Sn\` bigint NOT NULL AUTO_INCREMENT,\`FromUsergroupId\` VARCHAR(10),\`ToUsergroupId\` VARCHAR(10),\`CurrentWorkflowStep\` bigint,\`MostUpdated\` VARCHAR(1),\`Field1\` VARCHAR(256),\`Field2\` VARCHAR(256),\`Field3\` VARCHAR(256),\`Timecreated\` datetime,\`Timemodified\` datetime,PRIMARY KEY(\`Sn\`))ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    await conn.execute(`INSERT IGNORE INTO \`workflow\`(FromUsergroupId,ToUsergroupId,CurrentWorkflowStep,MostUpdated,Field1,Field2,Field3)VALUES('Employee','Manager',1,'Y','','',NULL),('Manager','VP',2,'Y','','',NULL),('VP','CEO',3,'Y','','',NULL),('CEO','President',4,'Y','','',NULL)`);
    await conn.execute(`CREATE TABLE IF NOT EXISTS \`processrecord\`(\`Sn\` bigint NOT NULL AUTO_INCREMENT,\`Userid\` varchar(64) NOT NULL,\`FromUserid\` varchar(64) NOT NULL,\`FromUsergroupId\` varchar(10) NOT NULL,\`ToUserid\` varchar(64) NOT NULL,\`ToUsergroupId\` varchar(10) NOT NULL,\`WorkflowSn\` bigint,\`Result\` VARCHAR(1),\`Field1\` VARCHAR(256),\`Field2\` VARCHAR(256),\`Field3\` VARCHAR(256),\`Timecreated\` datetime,\`Timemodified\` datetime,PRIMARY KEY(\`Sn\`),CONSTRAINT \`pr_fk1\` FOREIGN KEY(\`Userid\`) REFERENCES \`bpmuser\`(\`Userid\`),CONSTRAINT \`pr_fk2\` FOREIGN KEY(\`FromUserid\`) REFERENCES \`bpmuser\`(\`Userid\`),CONSTRAINT \`pr_fk3\` FOREIGN KEY(\`ToUserid\`) REFERENCES \`bpmuser\`(\`Userid\`),INDEX \`Userid_INDEX\`(\`Userid\` ASC))ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
    console.log('[DB-INIT] done.');
  } catch(e) { console.error('[DB-INIT] error:', e.message); }
  finally { if(conn) conn.release(); }
}

if (require.main === module) {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log('[BPM] Server running on http://localhost:' + PORT);
      console.log('[BPM] TZ = ' + process.env.TZ);
    });
  });
}

module.exports = app;
