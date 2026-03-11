# 方珮玲地政士事務所 LINE Bot

## 功能介紹

本 LINE Bot 為地政士事務所打造的客戶服務機器人，提供以下功能：

### 核心功能
1. **歡迎訊息** - 新好友加入自動發送歡迎訊息與功能選單
2. **服務項目查詢** - 展示六大服務項目（Flex Message 卡片式）
3. **收費標準查詢** - 清楚列出各項服務收費參考
4. **預約諮詢** - 引導客戶留言預約或電話預約
5. **常見問題 FAQ** - 智慧關鍵字回覆，涵蓋：
   - 買賣過戶 Q&A
   - 繼承登記 Q&A
   - 贈與/節稅 Q&A
   - 貸款/抵押權 Q&A
   - 日本不動產/移民
6. **稅務試算** - 導引至網站線上試算工具或預約專業規劃
7. **所需文件查詢** - 依案件類型列出需備齊的文件清單
8. **營業時間/地址** - 快速查詢事務所資訊

### 關鍵字觸發表
| 輸入關鍵字 | 回覆內容 |
|-----------|---------|
| 選單/功能/你好 | 主功能選單 |
| 服務/業務/項目 | 服務項目卡片 |
| 收費/費用/多少錢 | 收費標準 |
| 預約/諮詢 | 預約方式說明 |
| 買賣/過戶/買房 | 買賣過戶 FAQ |
| 繼承/遺產 | 繼承登記 FAQ |
| 贈與/節稅 | 贈與節稅 FAQ |
| 稅/增值稅/試算 | 稅務試算導引 |
| 文件/資料/準備 | 文件清單選單 |
| 貸款/房貸/銀行 | 貸款相關 FAQ |
| 日本/移民 | 日本不動產服務 |
| 營業/時間/幾點 | 營業時間 |
| 地址/在哪/位置 | 事務所地址（含地圖） |

---

## 安裝與設定

### 前置需求
- Node.js 18+
- LINE Developers 帳號

### 步驟

#### 1. 建立 LINE 官方帳號與 Messaging API
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 建立 Provider（如已有可跳過）
3. 建立新 Channel → 選擇 **Messaging API**
4. 填入 Channel 名稱：`方珮玲地政士事務所`
5. 記下 **Channel Secret**
6. 在 Messaging API 頁籤產生 **Channel Access Token**

#### 2. 設定專案
```bash
cd linebot
cp .env.example .env
```

編輯 `.env` 填入：
```
LINE_CHANNEL_ACCESS_TOKEN=（貼上你的 Channel Access Token）
LINE_CHANNEL_SECRET=（貼上你的 Channel Secret）
WEBSITE_URL=https://www.fangpeiling.com.tw
```

#### 3. 安裝與啟動
```bash
npm install
npm start
```

#### 4. 設定 Webhook
Bot 啟動後需要一個公開的 HTTPS URL。建議使用：

**方法 A：ngrok（測試用）**
```bash
ngrok http 3000
```
複製產生的 HTTPS URL，到 LINE Developers Console 設定 Webhook URL：
`https://xxxxxx.ngrok.io/webhook`

**方法 B：部署到雲端（正式環境）**
推薦平台：
- **Render**（免費方案可用）
- **Railway**
- **Heroku**
- **AWS / GCP**

#### 5. 關閉自動回應
在 [LINE Official Account Manager](https://manager.line.biz/) 中：
- 設定 → 回應設定 → 關閉「自動回應訊息」
- 開啟「Webhook」

---

## 自訂與擴充

### 修改收費金額
在 `server.js` 中搜尋 `getPricingMessage` 函式，修改金額。

### 新增 FAQ
在 `handleTextMessage` 中新增關鍵字匹配規則，並建立對應的回覆函式。

### 串接 Google Sheets 記錄諮詢
可使用 `googleapis` 套件，將客戶諮詢自動記錄到 Google Sheets 追蹤。

### 串接 ChatGPT
可使用 OpenAI API，讓 Bot 能回答更靈活的問題（需額外費用）。

---

## 費用說明

LINE Messaging API 免費方案：
- 每月 200 則免費推播訊息
- 回覆訊息（Reply）不計費
- 適合中小型事務所使用

如需更多推播訊息，可升級 LINE 付費方案。

---

## 檔案結構
```
linebot/
├── .env.example    # 環境變數範例
├── package.json    # 專案設定
├── server.js       # Bot 主程式
└── README.md       # 本說明文件
```
