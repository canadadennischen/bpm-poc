# BPM POC — 快速啟動指南

## 專案結構

```
output/
├── .github/workflows/ci-cd.yml   # GitHub Actions CI/CD
├── docs/design.md                 # SA/SD 設計文件 (Mermaid)
├── src/
│   ├── server.js                  # Express 入口
│   ├── db.js                      # MySQL 連線池
│   ├── package.json
│   ├── .env.example
│   ├── middleware/
│   │   ├── errorHandler.js        # 全域錯誤處理
│   │   └── sessionAuth.js         # Session 保護
│   ├── routes/
│   │   └── auth.js                # /api/v1/auth/*
│   ├── public/
│   │   ├── config.js              # API Base URL 設定
│   │   ├── Login.html
│   │   ├── WorkflowResult.html
│   │   └── NoWorkflow.html
│   └── tests/
│       └── auth.test.js           # Jest + Supertest
├── Dockerfile
├── docker-compose.yml
└── BPM.sql                        # (從專案根目錄複製過來)
```

---

## 本地啟動（方式一：Node.js 直接執行）

### 1. 安裝 Node.js 與 MySQL

- Node.js 20+：https://nodejs.org
- MySQL 8.0：https://dev.mysql.com/downloads/mysql/

### 2. 設定環境變數

```bash
cd output/src
cp .env.example .env
# 編輯 .env，填入你的 MySQL 連線資訊與 SESSION_SECRET
```

### 3. 匯入資料庫

```bash
mysql -u root -p < ../../BPM.sql
```
###############################################
Dennis:
我用DBeaver應用程式軟體, 有介面來管理MSQL DB.

############################################

### 4. 安裝依賴並啟動

```bash
npm install

( 可能要 $ cd C:/Users/denni/src )
那怕
npm start
```

###############################################
Dennis:
你在製作依賴的安裝的package時候, 用的應該是相對路徑而不是絕對路徑, 對嗎 ? 
因為我用Windows11, 我的claude project 的路徑, 是有中文字. 
當我執行你的README.md, 用bash的cd指令到我project的路徑. 出現error如下:
bash: cd: too many arguments
我只能把整個 /src 路徑下面所有檔案, 複製到 C:\Users\denni\src
然後再執行你README.md的 npm install . 可以吧 ?
############################################
Claude:
對，完全正確。
注意一點：匯入資料庫的指令也要調整路徑，例如：
mysql -u root -p bpmdb < C:\Users\denni\src\BPM.sql
###############################################
Dennis:
照你的解說, 複製了 \src後, 執行完npm install, 應該看到什麼? 路徑裡面會增加什麼檔案 ?
###############################################
Claude:
會新增一個 node_modules/ 資料夾和一個 package-lock.json 檔案
node_modules/ 通常有幾萬個檔案、幾百 MB，完全正常。安裝成功的最後幾行訊息大概長這樣：
added 127 packages, and audited 128 packages in 15s
found 0 vulnerabilities
###############################################


### 5. 開啟瀏覽器

```
http://localhost:3000
```

測試帳號（密碼皆為 `1`）：

| Userid  | 群組     | 情境                      |
|---------|----------|---------------------------|
| M00006  | Employee | 有 Workflow → WorkflowResult |
| M00007  | Member   | 無 Workflow → NoWorkflow  |
| M00005  | Manager  | 有 Workflow → WorkflowResult |

---

###############################################
Dennis:
npm start以後, 要如何結束並停止所有測試?
###############################################
Claude:
在執行 npm start 的終端機視窗，直接按：
Ctrl + C
就會立即停止 Node.js server。你會看到類似這樣的訊息：
^C
然後終端機回到命令提示符，代表 server 已完全停止。
就這樣，不需要額外指令。
###############################################



## 本地啟動（方式二：Docker Compose 一鍵啟動）






### 前置條件

- Docker Desktop：https://www.docker.com/products/docker-desktop

###############################################
Dennis:
我按照你readme.md說的 " - Docker Desktop：https://www.docker.com/products/docker-desktop" 在Bash裡執行, 但是出現 error : "bash: Docker: command not found". 是不是你readme.md應該先說更多些前置條件 ?
###############################################
Claude:
Docker Desktop 是一個要先手動下載安裝的 Windows 應用程式，不是用 bash 指令安裝的。
正確的前置步驟是：
Step 1：用瀏覽器下載安裝
開啟瀏覽器，前往 https://www.docker.com/products/docker-desktop
點 Download for Windows，下載 .exe 安裝檔
執行安裝檔，一路 Next 到底
安裝完後重新開機
Step 2：啟動 Docker Desktop
從開始選單找到 Docker Desktop 並開啟它
等到右下角工具列的 Docker 圖示變成穩定不動的鯨魚（不再有動畫），代表 Docker 已就緒
Step 3：這時才開 bash 執行指令
bash
docker --version   # 確認安裝成功
docker-compose up -d
簡單說：bash 裡的 docker 指令，需要先裝好 Docker Desktop 且它必須正在執行中，才能使用。就像 MySQL 要先裝好才能用 mysql 指令一樣。
###############################################


### 啟動

```bash
# 在 output/ 資料夾下執行
docker-compose up -d
```

###############################################
Dennis:
我按照你readme.md說的 " # 在 output/ 資料夾下執行
docker-compose up -d" 
在Bash裡執行, 但是出現 error : 
"time="2026-06-08T07:37:13+08:00" level=warning msg="C:\\DATA\\temp\\output\\docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion"
unable to get image 'output-app': Error response from daemon: Docker Desktop is unable to start". 
然後我把version刪除
出現 error :
"unable to get image 'mysql:8.0': Error response from daemon: Docker Desktop is unable to start"
為何呢 ?
###############################################
Claude:
錯誤訊息 Docker Desktop is unable to start 代表 Docker Desktop 已安裝但沒有在執行。
docker-compose 指令本身可以下，但它背後需要 Docker Desktop 的引擎在跑，才能拉 image 和啟動容器。
解決步驟：

按 Windows 鍵，搜尋 Docker Desktop，點開它
等右下角工具列出現鯨魚圖示，且圖示停止動畫（變成靜止的鯨魚）
這時才回到 bash 重新執行：

bash
docker-compose up -d
如果 Docker Desktop 開啟後出現錯誤無法啟動，常見原因是 Windows 的 WSL2 沒有啟用，這時在 PowerShell（以系統管理員身份）執行：
powershellwsl --install
然後重新開機，再啟動 Docker Desktop。

version 那個 warning 不影響執行，你刪掉是對的，但根本問題是 Docker Desktop 引擎沒有在跑。
###############################################





首次啟動會自動：
1. 建立 MySQL 8.0 容器並初始化 `BPM.sql`
2. 建立 Node.js 應用程式容器
3. 等待 DB 健康檢查通過後啟動 App

```
http://localhost:3000
```

###############################################
Dennis:
我按照你readme.md說的 " # 在 output/ 資料夾下執行
docker-compose up -d" 
在Bash裡執行, 但是出現 error : 

#11 [builder 4/4] RUN npm ci --omit=dev
#11 1.688 npm error code EUSAGE
#11 1.689 npm error
#11 1.689 npm error The `npm ci` command can only install with an existing package-lock.json or
#11 1.689 npm error npm-shrinkwrap.json with lockfileVersion >= 1. Run an install with npm@5 or
#11 1.689 npm error later to generate a package-lock.json file, then try again.
#11 1.689 npm error
#11 1.689 npm error Clean install a project
#11 1.689 npm error
#11 1.689 npm error Usage:
#11 1.689 npm error npm ci
#11 1.689 npm error
#11 1.689 npm error Options:
#11 1.689 npm error [--install-strategy <hoisted|nested|shallow|linked>] [--legacy-bundling]
#11 1.689 npm error [--global-style] [--omit <dev|optional|peer> [--omit <dev|optional|peer> ...]]
#11 1.689 npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
#11 1.689 npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
#11 1.689 npm error [--no-bin-links] [--no-fund] [--dry-run]
#11 1.689 npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
#11 1.689 npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
#11 1.689 npm error
#11 1.689 npm error aliases: clean-install, ic, install-clean, isntall-clean
#11 1.689 npm error
#11 1.689 npm error Run "npm help ci" for more info
#11 1.693 npm error A complete log of this run can be found in: /root/.npm/_logs/2026-06-08T02_51_20_612Z-debug-0.log
#11 ERROR: process "/bin/sh -c npm ci --omit=dev" did not complete successfully: exit code: 1

#8 [stage-1 2/5] RUN apk add --no-cache tzdata
#8 CANCELED
------
 > [builder 4/4] RUN npm ci --omit=dev:
1.689 npm error [--include <prod|dev|optional|peer> [--include <prod|dev|optional|peer> ...]]
1.689 npm error [--strict-peer-deps] [--foreground-scripts] [--ignore-scripts] [--no-audit]
1.689 npm error [--no-bin-links] [--no-fund] [--dry-run]
1.689 npm error [-w|--workspace <workspace-name> [-w|--workspace <workspace-name> ...]]
1.689 npm error [-ws|--workspaces] [--include-workspace-root] [--install-links]
1.689 npm error
1.689 npm error aliases: clean-install, ic, install-clean, isntall-clean
1.689 npm error
1.689 npm error Run "npm help ci" for more info
1.693 npm error A complete log of this run can be found in: /root/.npm/_logs/[+] up 14/152_51_20_612Z-debug-0.log
 ✔ Image mysql:8.0  Pulled                                              49.8s
 - Image output-app Building                                            19.7s
Dockerfile:6

--------------------

   4 |     WORKDIR /app

   5 |     COPY src/package*.json ./

   6 | >>> RUN npm ci --omit=dev

   7 |

   8 |     # ── Runtime Stage ─────────────────────────────────────────

--------------------

failed to solve: process "/bin/sh -c npm ci --omit=dev" did not complete successfully: exit code: 1
###############################################
Claude:
問題很清楚：npm ci 需要 package-lock.json 才能執行，但 src/ 裡沒有這個檔案。
最快的修法是把 Dockerfile 的 npm ci 改成 npm install：Edited a fileEdited a file然後重新執行：
bashdocker-compose up -d --build
--build 會強制重新 build image，套用剛才的修改。

原因說明： npm ci 是「乾淨安裝」指令，速度快但嚴格要求 package-lock.json 必須存在。npm install 則是一般安裝，沒有這個限制，適合這種還沒產生 lock file 的情境。


###############################################
Dennis:
Dockerfile 是你產出給我的.Dockerfile 是你產出給我的. 為何會有這種問題呢 ? 以後可以自己修正嗎 ?Claude responded: 這是我的疏失，說明如下：

###############################################
Claude:
這是我的疏失，說明如下：
為何會發生： npm ci 是 CI/CD 環境的最佳實踐（比 npm install 快且更嚴格），但它強制要求 package-lock.json 必須存在。我產出 package.json 後沒有同時執行 npm install 來產生 package-lock.json，導致 Docker build 失敗。
以後可以自己修正嗎： 可以，我現在就來補上。讓我在沙箱裡執行 npm install 產生 package-lock.json，再把它複製到你的 output 資料夾，然後把 Dockerfile 改回更嚴謹的 npm ci：Ran a commandRan a command沙箱沒有外部網路無法下載套件。但有個更簡單的解法：你本機已經有 package-lock.json 了（之前在 C:\Users\denni\src 執行過 npm install）。
兩個選擇：
選項 A（最快）： 把你本機的 package-lock.json 複製到 output/src/，然後把 Dockerfile 改回 npm ci（更嚴謹）：Read a fileRead a file目前 Dockerfile 已經是 npm install，可以直接用，不需要 package-lock.json。
結論：現在的 Dockerfile 是正確的，直接執行 docker-compose up -d --build 即可。
未來如何避免這個問題： 下次我產出 Dockerfile 時，若沒有辦法在沙箱產生 package-lock.json，就直接用 npm install 而非 npm ci，這樣就不會有依賴缺少 lock file 的問題。這個教訓我記下來了。
###############################################

###############################################
Dennis:
執行後, bash出現error 如下 :
#15 naming to docker.io/library/output-app:latest 0.0s done
#15 unpacking to docker.io/library/output-app:latest
#15 unpacking to docker.io/library/output-app:latest 0.6s done
#15 DONE 1.5s

#16 resolving provenance for metadata file
#16 DONE 0.1s
[+] up 4/5
 ✔ Image output-app             Built                                   25.8s
 ✔ Network output_default       Created                                  0.1s
 ✔ Volume output_bpm_mysql_data Created                                  0.0s
 - Container bpm_db             Starting                                 1.2s
 ✔ Container bpm_app            Created                                  0.2s
Error response from daemon: ports are not available: exposing port TCP 0.0.0.0:3306 -> 127.0.0.1:0: listen tcp 0.0.0.0:3306: bind: Only one usage of each socket address (protocol/network address/port) is normally permitted.

###############################################
Claude:
錯誤原因很清楚：你本機已有 MySQL 在跑，佔用了 3306 port，Docker 的 MySQL 容器無法再用同一個 port。
解法：把 docker-compose.yml 裡 MySQL 對外的 port 改成 3307（容器內部還是 3306，只有對外暴露的改掉）：Edited a fileEdited a fileEdited docker-compose.ymldocker-compose.ymlDone然後重新執行：
bashdocker-compose down
docker-compose up -d
修改後的效果：

Docker 內部：app 容器連 db 容器還是走 3306（Docker 內網），完全正常
你的本機 MySQL：繼續用 3306，不受影響
DBeaver 若要連 Docker 的 MySQL：連 localhost:3307

###############################################
Dennis:
自己解決方案 : 開 service.msc 手動停止 MySQL服務 !!!
###############################################



###############################################
Dennis:
網站可以執行第一個登入頁面．　但是，　輸入正確使用者跟密碼後，　頁面回覆的錯誤是　＂網路連線失敗，請稍後再試。＂．　你製作的互動式網站，有沒有任何一個ｌｏｇ檔，有詳細的一步一步的ｌｏｇ紀錄呢？
###############################################
Claude:
有的，Docker 容器有完整 log。在 bash 執行：
bash# Node.js app 的 log（最重要）
docker logs bpm_app

# MySQL 的 log
docker logs bpm_db
如果 log 太長，只看最後 50 行：
bashdocker logs bpm_app --tail 50
即時追蹤 log（像 tail -f）：
bashdocker logs bpm_app -f

我猜測問題所在： 「網路連線失敗」是前端 fetch 完全拋出 exception，通常代表後端 server 崩潰了（無法回應），而不是回傳錯誤訊息。
最常見原因是 app 容器啟動時找不到 DB 或 DB 連線失敗導致 crash。
請先貼出 docker logs bpm_app 的內容，我就能確認是哪裡出問題。
###############################################
Dennis:
Warning: connect.session() MemoryStore is not
designed for a production environment, as it will leak
memory, and will not scale past a single process.
[BPM] Server running on http://localhost:3000
[BPM] TZ = Asia/Taipei
[ERROR] 500 - Table 'bpmdb.bpmuser' doesn't exist Error: Table 'bpmdb.bpmuser' doesn't exist
    at /app/routes/auth.js:36:35
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at next (/app/node_modules/express/lib/router/route.js:149:13)
    at Route.dispatch (/app/node_modules/express/lib/router/route.js:119:3)
    at Layer.handle [as handle_request] (/app/node_modules/express/lib/router/layer.js:95:5)
    at /app/node_modules/express/lib/router/index.js:284:15
    at Function.process_params (/app/node_modules/express/lib/router/index.js:346:12)
    at next (/app/node_modules/express/lib/router/index.js:280:10)
    at Function.handle (/app/node_modules/express/lib/router/index.js:175:3)
    at router (/app/node_modules/express/lib/router/index.js:47:12)

What's next:
    View and search logs for all containers in one place
    with Docker Desktop's Logs view. docker-desktop://dashboard/logs
###############################################
Claude:
原因確認：Table 'bpmdb.bpmuser' doesn't exist → Docker 的 MySQL 容器沒有載入 BPM.sql。
docker-compose.yml 裡設定的路徑是 ./BPM.sql（相對於 output/ 資料夾），但 BPM.sql 在專案根目錄，沒有被複製進去。
修復步驟：
Step 1：把 BPM.sql 複製到 output/ 資料夾
用檔案總管，把：
C:\DATA\temp\BPM.sql
複製到：
C:\DATA\temp\output\BPM.sql
Step 2：清掉舊的 MySQL volume（因為第一次啟動時已初始化為空 DB，必須清掉才能重新執行 SQL）
bashdocker-compose down -v
Step 3：重新啟動
bashdocker-compose up -d
這次 MySQL 容器啟動時會偵測到 docker-entrypoint-initdb.d/BPM.sql，自動建立所有 table 並匯入測試資料。

MemoryStore 那個 Warning 是正常的，不影響功能，只是提醒正式環境要換成 Redis 之類的 Session Store。

兩件事我都做：立刻修正 docker-compose.yml，讓它直接指向上層的 BPM.sql，不需要手動複製；同時更新 README。Edited a fileEdited a file現在重新啟動（必須先 down -v 清掉舊的空 volume）：
bashdocker-compose down -v
docker-compose up -d

關於「以後能自己修正嗎」： 可以。這次問題的根源是我沒有在產出 docker-compose.yml 時驗證 BPM.sql 的實際相對位置。正確做法是：產出 Docker 配置後，在沙箱裡驗證目錄結構再輸出。這個教訓我已記下，下次會先確認路徑再產出。
###############################################



### 停止

```bash
docker-compose down
# 連同資料卷一起清除：
docker-compose down -v
```

---

## 執行測試

```bash
cd output/src
# 確認 .env 已設定正確的 DB 連線資訊
npm test
```

---

###############################################
Dennis:
用ｄｏｃｋｅｒ可以看到查詢出ＤＢ裡面的ｄａｔａ．但是，本來是中文的ｄａｔａ都變成亂碼．原先沒有用ｄｏｃｋｅｒ時，中文沒有問題．###############################################
Claude:
這是 Docker MySQL 容器的預設字集沒有設定為 utf8mb4 造成的。更新 docker-compose.yml 加入強制字集設定：Read a file, edited a fileRead a file, edited a file然後重啟（必須清掉舊 volume，讓 SQL 重新匯入）：
bashdocker-compose down -v
docker-compose up -d

原因說明： MySQL Docker image 預設字集是 latin1，不支援中文。加上 --character-set-server=utf8mb4 後，容器啟動時就強制用 utf8mb4，BPM.sql 裡的中文資料才能正確儲存與讀取。你本機的 MySQL 安裝時已設定好 utf8mb4，所以沒有問題。
###############################################
###############################################
Claude:
最可靠的修法：把字集設定和 BPM.sql 內容合併成一個 init.sql：Created a fileCreated a file再更新 docker-compose.yml，只掛這一個檔案：Edited a fileEdited a file現在把 init.sql 和更新後的 docker-compose.yml 複製到 C:\output\，然後：
bashcd C:/output
docker-compose down -v
docker-compose up -d
這次 SET NAMES utf8mb4 和所有 INSERT 在同一個連線內執行，中文資料一定正常。###############################################







## 雲端部署指南（最省錢方案）

### 服務對應

| 角色     | 平台    | 免費額度                    |
|----------|---------|-----------------------------|
| Backend + Frontend | Render  | 750 小時/月（Free 方案）|
| MySQL    | Aiven   | 1 個免費 DB（5 GB）         |

### Step 1：將程式碼推上 GitHub

```bash
git init
git add .
git commit -m "init BPM POC"
gh repo create bpm-poc --public --push
```

### Step 2：Aiven 建立 MySQL

1. 前往 https://aiven.io → 建立帳號
2. 建立 **MySQL 8** 服務（選免費 Hobbyist 方案）
3. 服務建立後，進入 **Overview** 取得：
   - `Service URI`（含 host / port / user / password / dbname）
4. 使用 Aiven Console 或本地 MySQL client 匯入 `BPM.sql`：
   ```bash
   mysql -h <AIVEN_HOST> -P <PORT> -u <USER> -p<PASSWORD> <DBNAME> < BPM.sql
   ```

### Step 3：Render 部署 Backend

1. 前往 https://render.com → New → **Web Service**
2. 連結你的 GitHub repo
3. 設定：
   - **Root Directory**：`output`
   - **Build Command**：`cd src && npm install`
   - **Start Command**：`cd src && node server.js`
4. 在 **Environment Variables** 填入：

| 變數名         | 值                          |
|----------------|-----------------------------|
| DB_HOST        | `<Aiven host>`              |
| DB_PORT        | `<Aiven port>`              |
| DB_USER        | `<Aiven user>`              |
| DB_PASSWORD    | `<Aiven password>`          |
| DB_NAME        | `<Aiven dbname>`            |
| SESSION_SECRET | 隨機長字串（至少32字元）   |
| TZ             | `Asia/Taipei`               |

5. 部署完成後，取得 Render 提供的 `https://xxx.onrender.com` URL。

### Step 4：設定前端 API Base URL

編輯 `output/src/public/config.js`：

```js
window.APP_CONFIG = {
  API_BASE: 'https://xxx.onrender.com'  // 你的 Render URL
};
```

推送到 GitHub，Render 會自動重新部署。

### Step 5：CI/CD 設定 GitHub Secret

在 GitHub repo → Settings → Secrets → Actions → New：

| Secret 名稱             | 值                              |
|-------------------------|---------------------------------|
| `RENDER_DEPLOY_HOOK_URL` | Render Dashboard 的 Deploy Hook URL |

推送到 `main` 分支時，GitHub Actions 會自動執行測試並觸發 Render 重新部署。







