/**
 * 方珮玲地政士事務所 LINE Bot
 * =============================
 * 功能：
 * 1. 圖文選單自動回覆
 * 2. 關鍵字智慧回覆 (FAQ)
 * 3. 預約諮詢流程
 * 4. 稅務快速試算
 * 5. 營業時間查詢
 * 6. 所需文件查詢
 */

require('dotenv').config();
const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
});

const app = express();

// ==================== Webhook 端點 ====================
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error('Error:', err);
      res.status(500).end();
    });
});

// 健康檢查
app.get('/', (req, res) => {
  res.send('方珮玲地政士事務所 LINE Bot is running!');
});

// ==================== 事件處理 ====================
async function handleEvent(event) {
  // 只處理文字訊息與 postback
  if (event.type === 'follow') {
    return handleFollow(event);
  }
  if (event.type === 'message' && event.message.type === 'text') {
    return handleTextMessage(event);
  }
  if (event.type === 'postback') {
    return handlePostback(event);
  }
  return null;
}

// ==================== 新好友加入歡迎訊息 ====================
async function handleFollow(event) {
  const welcomeMessages = [
    {
      type: 'text',
      text: '歡迎加入「方珮玲地政士事務所」官方帳號！\n\n我們提供專業的不動產登記、稅務規劃、繼承贈與等服務。\n\n您可以直接輸入問題，或使用以下功能：',
    },
    getMainMenu(),
  ];

  return client.replyMessage({
    replyToken: event.replyToken,
    messages: welcomeMessages,
  });
}

// ==================== 文字訊息處理 ====================
async function handleTextMessage(event) {
  const text = event.message.text.trim();
  const lowerText = text.toLowerCase();

  // 主選單
  if (['選單', '功能', '你好', 'hi', 'hello', '嗨', '開始', 'menu'].includes(lowerText)) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getMainMenu()],
    });
  }

  // 服務項目
  if (matchKeywords(lowerText, ['服務', '業務', '項目', '做什麼', '辦什麼', '幫忙'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getServicesMessage()],
    });
  }

  // 常見問題
  if (matchKeywords(lowerText, ['常見問題', 'faq', '問題', '疑問', 'q&a'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getFaqMenu()],
    });
  }

  // 收費
  if (matchKeywords(lowerText, ['收費', '費用', '多少錢', '價格', '報價', '代書費'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getPricingMessage()],
    });
  }

  // 預約
  if (matchKeywords(lowerText, ['預約', '諮詢', '約時間', '找你們'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getBookingMessage()],
    });
  }

  // 營業時間
  if (matchKeywords(lowerText, ['營業', '上班', '時間', '幾點', '開門', '休息'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getOfficeHoursMessage()],
    });
  }

  // 地址
  if (matchKeywords(lowerText, ['地址', '在哪', '怎麼去', '位置', '地點'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getLocationMessage()],
    });
  }

  // ===== FAQ 關鍵字回覆 =====

  // 買賣過戶
  if (matchKeywords(lowerText, ['買賣', '過戶', '買房', '賣房'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getFaqBuySell()],
    });
  }

  // 繼承
  if (matchKeywords(lowerText, ['繼承', '遺產', '過世', '往生'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getFaqInheritance()],
    });
  }

  // 贈與
  if (matchKeywords(lowerText, ['贈與', '送', '給小孩', '給兒子', '給女兒', '夫妻'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getFaqGift()],
    });
  }

  // 稅務
  if (matchKeywords(lowerText, ['稅', '增值稅', '契稅', '房地合一', '節稅', '試算'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getTaxCalcMessage()],
    });
  }

  // 文件
  if (matchKeywords(lowerText, ['文件', '資料', '要帶', '準備', '證件'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getDocumentsMenu()],
    });
  }

  // 貸款
  if (matchKeywords(lowerText, ['貸款', '房貸', '銀行', '抵押', '設定'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getFaqLoan()],
    });
  }

  // 日本
  if (matchKeywords(lowerText, ['日本', '移民', '海外', '簽證', '投資'])) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [getFaqJapan()],
    });
  }

  // 預設回覆
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [getDefaultReply()],
  });
}

// ==================== Postback 處理 ====================
async function handlePostback(event) {
  const data = event.postback.data;

  const handlers = {
    'action=services': getServicesMessage,
    'action=pricing': getPricingMessage,
    'action=booking': getBookingMessage,
    'action=faq': getFaqMenu,
    'action=hours': getOfficeHoursMessage,
    'action=location': getLocationMessage,
    'action=tax_calc': getTaxCalcMessage,
    'action=documents': getDocumentsMenu,
    'action=doc_buy': getDocBuySell,
    'action=doc_inherit': getDocInherit,
    'action=doc_gift': getDocGift,
  };

  // Parse postback data
  const handler = handlers[data];
  if (handler) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [handler()],
    });
  }

  return null;
}

// ==================== 訊息模板 ====================

function getMainMenu() {
  return {
    type: 'template',
    altText: '方珮玲地政士事務所 - 主選單',
    template: {
      type: 'buttons',
      title: '方珮玲地政士事務所',
      text: '請選擇您需要的服務：',
      actions: [
        { type: 'postback', label: '服務項目', data: 'action=services' },
        { type: 'postback', label: '收費標準', data: 'action=pricing' },
        { type: 'postback', label: '預約諮詢', data: 'action=booking' },
        { type: 'postback', label: '常見問題', data: 'action=faq' },
      ],
    },
  };
}

function getServicesMessage() {
  return {
    type: 'flex',
    altText: '服務項目一覽',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: '專業服務項目', weight: 'bold', size: 'lg', color: '#c5a059' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          serviceItem('1. 不動產登記', '買賣、贈與、繼承、信託等所有權移轉，抵押權設定/塗銷'),
          serviceItem('2. 稅務申報規劃', '房地合一稅、遺贈稅、土地增值稅試算與節稅'),
          serviceItem('3. 合約簽證', '買賣/租賃/分割契約撰擬、公證認證代辦'),
          serviceItem('4. 產權調查', '謄本調閱、產權瑕疵確認、存證信函'),
          serviceItem('5. 律師團隊', '不動產糾紛、共有物分割、遺產爭訟'),
          serviceItem('6. 日本不動產', '東京/大阪投資、經營管理簽證、移民諮詢'),
        ],
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'button', action: { type: 'postback', label: '預約諮詢', data: 'action=booking' }, style: 'primary', color: '#c5a059' },
        ],
      },
    },
  };
}

function serviceItem(title, desc) {
  return {
    type: 'box', layout: 'vertical', spacing: 'xs',
    contents: [
      { type: 'text', text: title, weight: 'bold', size: 'sm', color: '#1f2937' },
      { type: 'text', text: desc, size: 'xs', color: '#6b7280', wrap: true },
      { type: 'separator', margin: 'md' },
    ],
  };
}

function getPricingMessage() {
  // ===== TODO: 請確認實際收費金額 =====
  return {
    type: 'flex',
    altText: '收費標準參考',
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: '收費標準參考', weight: 'bold', size: 'lg', color: '#c5a059' },
          { type: 'text', text: '以下為代書服務費，不含政府規費及稅金', size: 'xxs', color: '#9ca3af', margin: 'sm' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          pricingItem('稅務試算規劃', 'NT$1,000 起'),
          pricingItem('抵押權設定/塗銷', 'NT$2,000 起'),
          pricingItem('合約撰擬/簽證', 'NT$6,000 起'),
          pricingItem('買賣過戶登記', 'NT$8,000 起'),
          pricingItem('贈與登記', 'NT$20,000 起'),
          pricingItem('繼承登記', 'NT$30,000 起'),
        ],
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [
          { type: 'text', text: '*實際報價以案件評估為準', size: 'xxs', color: '#9ca3af', align: 'center' },
          { type: 'button', action: { type: 'postback', label: '諮詢報價', data: 'action=booking' }, style: 'primary', color: '#c5a059', margin: 'md' },
        ],
      },
    },
  };
}

function pricingItem(name, price) {
  return {
    type: 'box', layout: 'horizontal',
    contents: [
      { type: 'text', text: name, size: 'sm', color: '#1f2937', flex: 3 },
      { type: 'text', text: price, size: 'sm', color: '#c5a059', weight: 'bold', flex: 2, align: 'end' },
    ],
  };
}

function getBookingMessage() {
  // ===== TODO: 請填入實際電話與地址 =====
  return {
    type: 'text',
    text: '預約諮詢方式\n' +
      '────────────\n\n' +
      '1. 直接在此 LINE 留言\n' +
      '   請告知：姓名、聯絡電話、諮詢項目\n\n' +
      '2. 電話預約\n' +
      '   03-4161262\n\n' +  // TODO: 填入實際電話
      '3. 電話預約後親臨事務所\n' +
      '   桃園市中壢區華勛街5巷15號\n\n' + // TODO: 填入實際地址
      '營業時間：週一至週五 09:00-18:00\n' +
      '週六可預約\n\n' +
      '我們將於 1 個工作天內回覆您！',
  };
}

function getOfficeHoursMessage() {
  return {
    type: 'text',
    text: '營業時間\n' +
      '────────────\n\n' +
      '週一至週五  09:00 - 18:00\n' +
      '週六        預約制\n' +
      '週日/國定假日 休息\n\n' +
      '如需假日諮詢，歡迎先 LINE 留言預約！',
  };
}

function getLocationMessage() {
  // ===== TODO: 請填入實際地址與座標 =====
  return {
    type: 'location',
    title: '方珮玲地政士事務所',
    address: '桃園市中壢區華勛街5巷15號', // TODO: 填入實際地址
    latitude: 24.9537,  // TODO: 填入實際緯度
    longitude: 121.2257, // TODO: 填入實際經度
  };
}

function getFaqMenu() {
  return {
    type: 'template',
    altText: '常見問題分類',
    template: {
      type: 'buttons',
      title: '常見問題',
      text: '請選擇想了解的類別：',
      actions: [
        { type: 'message', label: '買賣過戶', text: '買賣過戶' },
        { type: 'message', label: '繼承登記', text: '繼承' },
        { type: 'message', label: '贈與/節稅', text: '贈與' },
        { type: 'message', label: '稅務試算', text: '稅務試算' },
      ],
    },
  };
}

function getFaqBuySell() {
  return {
    type: 'text',
    text: '買賣過戶常見問題\n' +
      '────────────\n\n' +
      'Q: 過戶需要多久？\n' +
      'A: 備齊文件後約 7-14 個工作天完成。\n\n' +
      'Q: 需要準備什麼？\n' +
      'A: 雙方身分證、印鑑證明（賣方）、權狀正本、戶籍謄本、買賣契約書。\n\n' +
      'Q: 買方要繳什麼稅？\n' +
      'A: 契稅（房屋評定現值6%）、印花稅、地政規費。\n\n' +
      'Q: 賣方要繳什麼稅？\n' +
      'A: 土地增值稅、房地合一稅（如適用）。\n\n' +
      '想了解更多？直接留言或輸入「預約」安排諮詢！',
  };
}

function getFaqInheritance() {
  return {
    type: 'text',
    text: '繼承登記常見問題\n' +
      '────────────\n\n' +
      'Q: 繼承有期限嗎？\n' +
      'A: 被繼承人死亡後 6 個月內應辦理。逾期每月加罰登記費1倍，最高20倍。\n\n' +
      'Q: 繼承人有誰？\n' +
      'A: 依民法順序：配偶+直系血親卑親屬 > 父母 > 兄弟姊妹 > 祖父母。\n\n' +
      'Q: 遺產稅免稅額多少？\n' +
      'A: 2024年起免稅額為 1,333 萬元，另有各項扣除額。\n\n' +
      'Q: 沒有遺囑怎麼辦？\n' +
      'A: 依法定應繼分分配，或全體繼承人可協議分割。\n\n' +
      '繼承案件較複雜，建議預約詳細諮詢。輸入「預約」立即安排！',
  };
}

function getFaqGift() {
  return {
    type: 'text',
    text: '贈與/節稅常見問題\n' +
      '────────────\n\n' +
      'Q: 每年贈與免稅額多少？\n' +
      'A: 每人每年有 244 萬元贈與免稅額。\n\n' +
      'Q: 夫妻贈與要繳稅嗎？\n' +
      'A: 配偶間贈與免繳贈與稅，但仍需繳土地增值稅及契稅。\n\n' +
      'Q: 贈與好還是繼承好？\n' +
      'A: 需評估土增稅、贈與稅、未來房地合一稅等，每個家庭狀況不同，建議諮詢規劃。\n\n' +
      'Q: 父母贈與房產給小孩怎麼省稅？\n' +
      'A: 可規劃分年贈與、善用免稅額、考慮信託等方式。\n\n' +
      '節稅規劃需要專業評估，輸入「預約」安排諮詢！',
  };
}

function getTaxCalcMessage() {
  const websiteUrl = process.env.WEBSITE_URL || 'https://www.fangpeiling.com.tw';
  return {
    type: 'flex',
    altText: '稅務試算服務',
    contents: {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical',
        contents: [
          { type: 'text', text: '稅務快速試算', weight: 'bold', size: 'lg', color: '#c5a059' },
        ],
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          { type: 'text', text: '我們提供以下稅務試算服務：', size: 'sm', color: '#6b7280' },
          { type: 'text', text: '  土地增值稅', size: 'sm', color: '#1f2937' },
          { type: 'text', text: '  契稅', size: 'sm', color: '#1f2937' },
          { type: 'text', text: '  房地合一稅', size: 'sm', color: '#1f2937' },
          { type: 'text', text: '  遺產稅 / 贈與稅', size: 'sm', color: '#1f2937' },
          { type: 'separator', margin: 'lg' },
          { type: 'text', text: '您可以使用網站的線上試算工具，或直接預約專業規劃服務 (NT$1,000起)', size: 'xs', color: '#9ca3af', wrap: true, margin: 'md' },
        ],
      },
      footer: {
        type: 'box', layout: 'vertical', spacing: 'sm',
        contents: [
          {
            type: 'button',
            action: { type: 'uri', label: '線上試算工具', uri: websiteUrl + '#calculator' },
            style: 'primary', color: '#c5a059',
          },
          {
            type: 'button',
            action: { type: 'postback', label: '預約專業規劃', data: 'action=booking' },
            style: 'secondary',
          },
        ],
      },
    },
  };
}

function getDocumentsMenu() {
  return {
    type: 'template',
    altText: '查詢所需文件',
    template: {
      type: 'buttons',
      title: '需備文件查詢',
      text: '請選擇案件類型：',
      actions: [
        { type: 'postback', label: '買賣過戶', data: 'action=doc_buy' },
        { type: 'postback', label: '繼承登記', data: 'action=doc_inherit' },
        { type: 'postback', label: '贈與登記', data: 'action=doc_gift' },
      ],
    },
  };
}

function getDocBuySell() {
  return {
    type: 'text',
    text: '買賣過戶所需文件\n' +
      '────────────\n\n' +
      '【賣方】\n' +
      '  身分證正本及影本\n' +
      '  印鑑證明（1份）\n' +
      '  土地/建物所有權狀正本\n' +
      '  戶籍謄本\n\n' +
      '【買方】\n' +
      '  身分證正本及影本\n' +
      '  戶籍謄本\n\n' +
      '【其他】\n' +
      '  買賣契約書\n' +
      '  最新登記謄本\n\n' +
      '備齊文件有疑問？直接拍照傳給我們確認！',
  };
}

function getDocInherit() {
  return {
    type: 'text',
    text: '繼承登記所需文件\n' +
      '────────────\n\n' +
      '  被繼承人死亡證明書\n' +
      '  被繼承人除戶謄本\n' +
      '  全體繼承人戶籍謄本\n' +
      '  繼承系統表\n' +
      '  土地/建物所有權狀正本\n' +
      '  遺產稅完（免）稅證明\n' +
      '  遺產分割協議書（如有）\n' +
      '  遺囑（如有）\n' +
      '  全體繼承人印鑑證明\n\n' +
      '繼承案件文件較多，建議預約面談逐一確認。',
  };
}

function getDocGift() {
  return {
    type: 'text',
    text: '贈與登記所需文件\n' +
      '────────────\n\n' +
      '【贈與人】\n' +
      '  身分證正本及影本\n' +
      '  印鑑證明\n' +
      '  土地/建物所有權狀正本\n\n' +
      '【受贈人】\n' +
      '  身分證正本及影本\n\n' +
      '【其他】\n' +
      '  贈與契約書\n' +
      '  贈與稅完（免）稅證明\n' +
      '  最新登記謄本\n\n' +
      '贈與前建議先做節稅規劃，輸入「預約」安排諮詢！',
  };
}

function getFaqLoan() {
  return {
    type: 'text',
    text: '貸款/抵押權常見問題\n' +
      '────────────\n\n' +
      'Q: 抵押權設定是什麼？\n' +
      'A: 向銀行貸款時，以不動產做擔保的登記手續。\n\n' +
      'Q: 還清貸款後需要做什麼？\n' +
      'A: 需辦理抵押權塗銷登記，將擔保從權狀上移除。\n\n' +
      'Q: 可以協助申請房貸嗎？\n' +
      'A: 我們可協助銀行房貸估價及送件，爭取較佳條件。\n\n' +
      '想了解目前房貸利率？到我們網站使用「房貸試算」工具！',
  };
}

function getFaqJapan() {
  return {
    type: 'text',
    text: '日本不動產/移民服務\n' +
      '────────────\n\n' +
      '我們提供日本不動產投資及移民一條龍服務：\n\n' +
      '  東京/大阪房產投資諮詢\n' +
      '  經營管理簽證申請\n' +
      '  跨國購屋流程協助\n' +
      '  日本融資貸款\n' +
      '  稅務規劃（台日雙邊）\n\n' +
      '日本房產投資需要專業評估，歡迎預約詳細說明會。輸入「預約」安排諮詢！',
  };
}

function getDefaultReply() {
  return {
    type: 'text',
    text: '感謝您的訊息！\n\n' +
      '如果您有不動產相關問題，可以試試以下關鍵字：\n\n' +
      '「服務」- 查看服務項目\n' +
      '「收費」- 收費標準\n' +
      '「預約」- 預約諮詢\n' +
      '「買賣」- 買賣過戶 Q&A\n' +
      '「繼承」- 繼承登記 Q&A\n' +
      '「贈與」- 贈與/節稅 Q&A\n' +
      '「稅」  - 稅務試算\n' +
      '「文件」- 所需文件查詢\n' +
      '「時間」- 營業時間\n' +
      '「地址」- 事務所位置\n\n' +
      '或直接描述您的問題，我們上班時間會盡快回覆您！',
  };
}

// ==================== 工具函式 ====================
function matchKeywords(text, keywords) {
  return keywords.some(kw => text.includes(kw));
}

// ==================== 啟動伺服器 ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`LINE Bot server is running on port ${PORT}`);
});
