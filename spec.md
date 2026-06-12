# BPM 互動式網站專案規格 (spec.md)

> **使用說明（給 Claude）**：
> 請先讀取同一資料夾中的 `BPM.sql`，以了解完整的資料庫 schema 與測試資料，
> 再依照本規格書進行開發。所有產出請存放至 `output/` 子資料夾。

---

## 專案角色設定

請擔任「高階全端架構師兼系統分析師 (SA/SD)」，幫我規劃並產出這個專案的完整文件、原始碼與部署設定。

---

## 專案目標

建立一個**互動式 BPM 網站**，使用 MySQL 資料庫，並提供完整可執行的程式碼、本地執行環境與雲端部署方案。

---

## 技術棧與架構要求

| 層級 | 技術選擇 |
|------|----------|
| 前端 (Frontend) | HTML5 + CSS + Bootstrap 5 + JavaScript（不使用複雜前端框架，確保輕量好讀） |
| 後端 (Backend) | Node.js + Express |
| 資料庫 (Database) | MySQL 8.0 |
| 容器化 | Docker + docker-compose 本地一鍵啟動 |

---

## 一、通用操作與全域規則 (General Rules)

**(A) 全域錯誤處理**
不論是前端、後端 API 或資料庫查詢，只要發生任何操作錯誤，一律攔截並直接導向或回傳一個統一、美觀的「Error 錯誤畫面/錯誤訊息」，不要繼續往下處理。

**(B) 新增資料時戳**
當資料要被 INSERT 到任何 Table 時，自動取得當前系統日期時間，寫入該 Table 的 `Timecreated` 欄位。

**(C) 更新資料時戳**
當資料要被 UPDATE 到任何 Table 時，自動取得當前系統日期時間，寫入該 Table 的 `Timemodified` 欄位。

**(D) 狀態與安全傳遞**
- 除了第一個「登入頁面」之外，每一個網頁之間（包含前端跳轉與後端 API 傳遞），都必須傳遞已登入使用者的一般資料，但「嚴格排除密碼資料 (Password)」。
- 使用 `express-session` + Session Cookie。Session secret 請從環境變數 `SESSION_SECRET` 讀取，並列入 `.env.example`。
- 登入成功後的所有後續網頁，介面的「網頁右上角」必須清晰且整齊地顯示當前登入的使用者帳號 (Userid) 以及 Session ID。
- 除了第一個「登入頁面」之外，每一個網頁：後端 API 若偵測到 Session 不存在，回傳 `HTTP 401`；前端收到 `401` 時自動導回 `Login.html`。

**(E) 實務防坑與安全性**
- **時區處理**：請確保 (B) 與 (C) 的系統時間在程式碼中強制設定為「台灣/台北時區 (GMT+8)」，避免未來部署至雲端伺服器時因預設 UTC 而產生時差。
- **安全防護**：實作防止 SQL Injection 的安全查詢（如 Prepared Statements）。所有的資料庫連線資訊必須完全設計為讀取環境變數 (.env) 的形式。密碼安全性可先用明文比對，並在註解中說明正式環境的改進方式。

---

## 二、網頁功能與商業邏輯流程

本專案包含 2 個主要網頁：

### 1. 第一個網頁【Login.html - 登入畫面】

**UI 需求**：提供 2 個文字框：
- 第一個對應 `bpmuser.Userid`
- 第二個對應 `bpmuser.Password`
- 一個 Login 按鈕

**驗證邏輯**：按下 Login 後呼叫後端 API，驗證 `bpmuser` 表中的帳密是否正確。驗證時需加上條件 `UserType = 'N'`（排除系統帳號與停用帳號）。

- **若驗證失敗**：觸發全域錯誤機制，回覆登入失敗/錯誤畫面。
- **若驗證成功**：若多筆資料符合就只取第一筆，在後端依序執行以下 6 個步驟的資料查詢與物件暫存（請確保傳遞時剔除密碼欄位）：

  1. 搜尋 `bpmuser` 表，取得該筆 user 資料，暫存在 `FromUser` 物件中。
  2. 搜尋 `bpmusergroup` 表，條件為 `FromUser.Groupid = bpmusergroup.Groupid`，取得資料並暫存在 `FromBpmusergroup` 物件中。若多筆資料符合就只取第一筆。
  3. 搜尋 `workflow` 表，條件為 `FromUser.Groupid = workflow.FromUsergroupId` 且 `workflow.MostUpdated = 'Y'`，取得資料並暫存在 `CurrentWorkflow` 物件中。若多筆資料符合就只取第一筆。若查無對應 workflow 資料，導向一個**提示頁面（非錯誤頁）**顯示「目前無待處理流程」的訊息。此「查無 workflow」的分支路徑亦需反映在 Sequence Diagram 中。
  4. 搜尋 `bpmuser` 表，條件為 `CurrentWorkflow.ToUsergroupId = bpmuser.Groupid`，取得接收端使用者資料，暫存在 `ToUser` 物件中。若多筆資料符合就只取第一筆。
  5. 搜尋 `bpmusergroup` 表，條件為 `ToUser.Groupid = bpmusergroup.Groupid`，取得資料並暫存在 `ToBpmusergroup` 物件中。若多筆資料符合就只取第一筆。
  6. 將上述所有暫存的資料物件（`FromUser`, `FromBpmusergroup`, `CurrentWorkflow`, `ToUser`, `ToBpmusergroup`）整齊打包，傳遞並導向至第二個網頁。

### 2. 第二個網頁【WorkflowResult.html - 資料顯示頁面】

**UI 需求**：遵循全域規則 (D)。加上，主畫面需將步驟 6 傳過來的所有物件資料（`FromUser`, `FromBpmusergroup`, `CurrentWorkflow`, `ToUser`, `ToBpmusergroup`），使用 Bootstrap 5 的 Card（卡片式佈局）或響應式表格，將所有欄位內容整齊、美觀、可讀地排列列出。

---

## 三、請完整產出以下內容（請善用 Artifacts 功能呈現）

### 1. SA/SD 系統分析與設計文件（請使用 Mermaid 語法繪製）

- Use Case Diagram（案例圖）
- Class Diagram（類別圖）
- Sequence Diagram（時序圖，需清晰呈現登入驗證、6 步驟查詢打包流程，以及「查無 workflow」分支）

### 2. 完整的專案目錄結構與原始碼

- `package.json`（包含所需相依套件如 express, mysql2, dotenv, bcrypt 等）
- 後端 API 程式碼（包含 Server 建立、路由、SQL 查詢、錯誤處理 Middleware）
- 前端 2 個網頁的 HTML / CSS / JavaScript 程式碼
- 所有 MySQL 查詢邏輯
- `.env.example`（環境變數範例檔，包含 `SESSION_SECRET`）
- `README.md`（說明文件）

README 中需提供：
- 本地及雲端的安裝 Node.js 與 MySQL
- 複製 `.env.example` 為 `.env` 並修改
- 匯入 `BPM.sql`
- `npm install`
- `npm start`
- 瀏覽器開啟 `http://localhost:3000`

### 3. Docker 容器化配置檔案

- `Dockerfile`
- `docker-compose.yml`（配置 MySQL 服務與 Backend 服務，透過 `docker-compose up -d` 一鍵啟動，並包含初始化 DB 的 SQL 腳本載入設定）
- 前端直接由 Express 的 `express.static('public')` serve，不需額外 Frontend container
- 前端 JS 的 API base URL 請設計為可透過 `config.js` 設定，方便本地與雲端切換

### 4. 雲端託管與部署指南 (Cloud Deployment Guide)

針對「最省錢/高免費額度」的極簡雲端方案，提供 Step-by-Step 部署步驟：

| 服務 | 平台選擇 |
|------|----------|
| 前端 (Frontend) | Netlify / Render |
| 後端 API (Backend) | Render / Railway |
| 資料庫 (MySQL Cloud) | Aiven for MySQL / Railway |

請詳細說明如何將代碼上傳 GitHub、如何在雲端建立並初始化資料庫、以及如何在各平台配置環境變數（包含 `SESSION_SECRET`），以達成網頁、API 與雲端資料庫的完美串接。

---

## 四、請完整產出測試程式

**使用框架**：Jest + Supertest

**測試案例**：

| 編號 | 測試項目 |
|------|----------|
| 1.1.1 | 登入成功 |
| 1.1.2 | 登入失敗（帳密錯誤） |
| 1.1.3 | 登入成功但無對應流程（使用 `M00007`，Member 群組，workflow 表中無對應流程） |

---

## 五、請完整產出 CI/CD

**GitHub Actions**，依照第三節的雲端部署指南對應平台設定，包含：

- **Build**：安裝依賴、編譯檢查
- **Test**：執行 Jest + Supertest 測試
- **Deploy**：自動部署至對應雲端平台

---

## 六、注意事項

1. 請用**統一結構輸出**：每個檔案放在獨立的 Artifact，並標示檔案路徑，避免程式碼混在同一個回應區塊。
2. 請依下面的**順序**逐步產出：`文件 → 後端 → 前端 → Docker → 測試 → CI/CD`
3. 請遵循 **RESTful 命名規範**，路由前綴為 `/api/v1/`，讓前後端介面更一致。
4. **本次範圍**：只開發及測試登入相關網頁、邏輯及 API，不需要登出相關功能。
