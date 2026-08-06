(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MxiqiPageParser = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const clean = (value) => String(value || "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
  const money = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;
  const phoneFrom = (value) => {
    const compact = String(value || "").replace(/[\s-]/g, "");
    return compact.match(/(?:\+?86)?1[3-9]\d{9}/)?.[0]?.replace(/^\+?86/, "") || "";
  };

  function orderDate(orderNo) {
    const match = String(orderNo || "").match(/^(\d{4})(\d{2})(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
  }

  function auctionDate(value) {
    const source = clean(value);
    const separated = source.match(/(20\d{2})[年\/.\-](\d{1,2})[月\/.\-](\d{1,2})日?/);
    if (separated) return `${separated[1]}-${separated[2].padStart(2, "0")}-${separated[3].padStart(2, "0")}`;
    const compact = source.match(/(?:^|\D)(20)?(\d{2})(\d{2})(\d{2})(?:\D|$)/);
    if (!compact) return "";
    const year = compact[1] ? `${compact[1]}${compact[2]}` : `20${compact[2]}`;
    return `${year}-${compact[3]}-${compact[4]}`;
  }

  function normalizeOrderStatus(status) {
    const value = clean(status);
    return {
      paymentStatus: value.includes("待付款") || value.includes("待收款") ? "待付款" : "已付款",
      finalOutcome: "成交",
      addressStatus: value.includes("待付款") || value.includes("待收款") ? "" : "pending_review",
      mxiqiShippingStatus: value.includes("已发货") || value.includes("已收货") ? "filled" : value.includes("待发货") ? "pending" : "",
    };
  }

  function parseOrderCard(card) {
    const directChildren = Array.from(card.children || []);
    const title = directChildren.find((element) => element.classList?.contains("tt") && element.querySelector('a[href^="/org.order.show/"]'));
    const buyer = directChildren.find((element) => element.classList?.contains("tt") && element.querySelector('a[href^="/org.member.info/"]'));
    const content = card.querySelector(".content");
    const orderLink = title?.querySelector('a[href^="/org.order.show/"]');
    const orderNo = clean(orderLink?.textContent);
    if (!orderNo || !content) return [];

    const statusText = clean(title.textContent).replace(/订单号[:：]?/g, "").replace(orderNo, "").trim();
    const buyerLink = buyer?.querySelector('a[href^="/org.member.info/"]');
    const phoneLink = buyer?.querySelector('a[href^="tel:"]');
    const buyerName = clean(buyerLink?.textContent);
    const buyerPhone = clean(phoneLink?.getAttribute("href")?.replace(/^tel:/, ""));
    const recipientNode = directChildren.find((element) => clean(element.textContent).includes("收件人："));
    const recipientRaw = clean(recipientNode?.textContent).replace(/^收件人：?\n?/, "").replace(/\s*复制\s*$/, "");
    const remark = clean(card.querySelector(".remark_seller_wrap")?.textContent).replace(/^备注：?/, "");
    const projectName = clean(content.querySelector(".deposit")?.textContent).replace(/^实时拍卖\s*/, "");
    const auctionAt = auctionDate(`${projectName}\n${clean(content.textContent)}`);
    const summaryNode = directChildren.find((element) => /佣金\s*¥/.test(clean(element.textContent)));
    const summary = clean(summaryNode?.textContent);
    const commissionAmount = money(summary.match(/佣金\s*(¥[\d,.]+)/)?.[1]);
    const incomeAmount = money(summary.match(/(?:微信|支付宝)?收入\s*(¥[\d,.]+)/)?.[1]);
    const trackingMatch = clean(card.textContent).match(/已发货\s*[（(]([^）)]+)[）)]/);
    const outboundTrackingNumber = clean(trackingMatch?.[1]);
    const statusFields = normalizeOrderStatus(statusText);
    const memberId = buyerLink?.getAttribute("href")?.match(/\/org\.member\.info\/(\d+)/)?.[1] || "";
    const orderUrl = orderLink?.getAttribute("href") || "";

    return Array.from(content.querySelectorAll(".order-item-row")).map((row, itemIndex) => {
      const detail = row.querySelector(".order-item-details");
      const itemName = clean(detail?.querySelector('a[href^="/org.order.show/"]')?.textContent);
      const lot = Number(clean(detail?.textContent).match(/Lot\.?\s*(\d+)/i)?.[1] || 0);
      const priceText = clean(row.querySelector(".order-item-price")?.textContent);
      const finalPrice = money(priceText.match(/¥[\d,.]+/)?.[0]);
      if (!lot || !itemName) return null;
      return {
        platformItemKey: `${orderNo}:${lot}:${itemIndex}`,
        mxiqiOrderId: orderNo,
        mxiqiOrderUrl: orderUrl,
        mxiqiMemberId: memberId,
        mxiqiOrderStatus: statusText,
        platformOrderDate: orderDate(orderNo),
        source: "mxiqi_connector",
        sourceUpdatedAt: new Date().toISOString(),
        lot,
        lotLabel: `麦稀奇 / Lot ${lot}`,
        itemName,
        finalPrice,
        buyerName,
        buyerPhone,
        recipientRaw,
        recipientPhone: phoneFrom(recipientRaw) || buyerPhone,
        projectName,
        auctionAt,
        platformAuctionAt: auctionAt,
        auctionHouse: "麦稀奇",
        commissionPlatformAmount: commissionAmount,
        incomePlatformAmount: incomeAmount,
        outboundTrackingNumber,
        shippingCarrier: /^SF/i.test(outboundTrackingNumber) ? "sf" : outboundTrackingNumber ? "cainiao" : "",
        remarkPlatform: remark,
        ...statusFields,
      };
    }).filter(Boolean);
  }

  function parseOrderDocument(doc) {
    const records = Array.from(doc.querySelectorAll(".order")).flatMap(parseOrderCard);
    const scriptText = Array.from(doc.scripts || []).map((script) => script.textContent || "").join("\n");
    const totalPages = Number(scriptText.match(/var\s+totalPage\s*=\s*(\d+)/)?.[1] || 1);
    const totalOrders = Number(scriptText.match(/var\s+totalSize\s*=\s*(\d+)/)?.[1] || records.length);
    return {records, totalPages, totalOrders};
  }

  function auctionPeriod(value) {
    const match = clean(value).match(/(?:第\s*)?(\d{1,4})\s*期/);
    return match ? `第${Number(match[1])}期` : "";
  }

  function auctionLifecycle(value) {
    const source = clean(value);
    if (/预展中|预展|尚未开始|待开拍|将于[\s\S]{0,40}开始/.test(source)) return "preview";
    if (/拍卖中|竞拍中|正在拍卖|进行中/.test(source)) return "live";
    if (/已结束|拍卖已结束|已经结束/.test(source)) return "ended";
    return "";
  }

  function parseAuctionResultRows(rows = [], {period = "", projectName = "", entryKey = ""} = {}) {
    const normalizedPeriod = auctionPeriod(period) || clean(period);
    const unique = new Map();
    rows.forEach((row) => {
      const text = clean(row?.text);
      const lot = Number(text.match(/Lot\.?\s*(\d+)/i)?.[1] || 0);
      if (!lot) return;
      const finalPrice = money(text.match(/成交价\s*[:：]?\s*[¥￥]?\s*[\d,.]+/)?.[0]);
      const explicitTitle = clean(row?.title).replace(/^Lot\.?\s*\d+\s*/i, "");
      const fallbackTitle = clean(text
        .replace(/^.*?Lot\.?\s*\d+\s*/i, "")
        .replace(/成交价\s*[:：]?[\s\S]*$/i, "")
        .split("\n")[0]);
      const itemName = explicitTitle || fallbackTitle || `Lot ${lot}`;
      const key = `${normalizedPeriod}:${lot}`;
      const current = unique.get(key);
      const record = {
        platformItemKey:`auction-result:${entryKey || normalizedPeriod}:${lot}`,
        source:"mxiqi_connector",
        sourceUpdatedAt:new Date().toISOString(),
        lot,
        lotLabel:`麦稀奇 / Lot ${lot}`,
        itemName,
        projectName:projectName || normalizedPeriod,
        auctionPeriodOverride:normalizedPeriod,
        auctionHouse:"麦稀奇",
        finalPrice,
        finalOutcome:finalPrice > 0 ? "成交" : "流拍",
        paymentStatus:finalPrice > 0 ? "已付款" : "",
        mxiqiAuctionItemUrl:clean(row?.href),
      };
      if (!current || record.finalPrice > current.finalPrice || record.itemName.length > current.itemName.length) unique.set(key, record);
    });
    return [...unique.values()];
  }

  function parseAuctionCatalogRows(rows = [], {period = "", projectName = "", entryKey = ""} = {}) {
    const normalizedPeriod = auctionPeriod(period) || clean(period);
    const unique = new Map();
    rows.forEach((row) => {
      const cells = Array.isArray(row?.cells) ? row.cells.map(clean) : [];
      if (cells.length < 8) return;
      const lot = Number(cells[0].match(/Lot\.?\s*(\d+)/i)?.[1] || cells[0].match(/^\s*(\d+)\s*$/)?.[1] || 0);
      if (!lot) return;
      const finalPrice = money(cells[5]);
      const itemName = clean(cells[1]).replace(/^Lot\.?\s*\d+\s*/i, "") || `Lot ${lot}`;
      const key = `${normalizedPeriod}:${lot}`;
      const record = {
        platformItemKey:`auction-result:${entryKey || normalizedPeriod}:${lot}`,
        source:"mxiqi_connector",
        sourceUpdatedAt:new Date().toISOString(),
        lot,
        lotLabel:`麦稀奇 / Lot ${lot}`,
        itemName,
        projectName:projectName || normalizedPeriod,
        auctionPeriodOverride:normalizedPeriod,
        auctionHouse:"麦稀奇",
        finalPrice,
        finalOutcome:finalPrice > 0 ? "成交" : "流拍",
        paymentStatus:finalPrice > 0 ? "已付款" : "",
        mxiqiAuctionItemUrl:clean(row?.href),
      };
      const current = unique.get(key);
      if (!current || record.finalPrice > current.finalPrice || record.itemName.length > current.itemName.length) unique.set(key, record);
    });
    return [...unique.values()];
  }

  function parseAuctionResultDocument(doc, options = {}) {
    const pageText = clean(doc.body?.textContent);
    const projectName = clean(doc.querySelector("h1, h2, .auction-title, [class*='auction'][class*='title']")?.textContent)
      || clean(doc.title).replace(/[-_|].*$/, "");
    const period = auctionPeriod(options.period) || auctionPeriod(`${projectName}\n${pageText}`) || clean(options.period);
    const lifecycle = options.lifecycle || auctionLifecycle(`${projectName}\n${pageText}`);
    if (["preview", "live"].includes(lifecycle)) return {records:[],period,projectName,lifecycle};
    const currentPath = typeof location === "object" ? location.pathname : "";
    const entryKey = String(options.entryKey || currentPath || "").match(/(\d{4,})/)?.[1] || "";
    const catalogRows = Array.from(doc.querySelectorAll("table tr"))
      .map((row) => ({cells:Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent),href:""}));
    const catalogRecords = parseAuctionCatalogRows(catalogRows,{period,projectName,entryKey});
    if (catalogRecords.length) return {records:catalogRecords,period,projectName,lifecycle};
    const elements = Array.from(doc.querySelectorAll('a[href*="auction.item.info"], a[href*="auction.item"], tr, li, article, [class*="auction-item"], [class*="lot-item"]'));
    const rows = [];
    const seen = new Set();
    elements.forEach((element) => {
      const container = element.matches("tr, li, article, [class*='auction-item'], [class*='lot-item']")
        ? element
        : element.closest("tr, li, article, [class*='auction-item'], [class*='lot-item']") || element.parentElement || element;
      const text = clean(container.textContent);
      if (!/Lot\.?\s*\d+/i.test(text) || !/成交价\s*[:：]?/i.test(text)) return;
      const lot = text.match(/Lot\.?\s*(\d+)/i)?.[1] || "";
      const hrefNode = container.querySelector?.('a[href*="auction.item"]') || (element.matches?.("a") ? element : null);
      const href = hrefNode?.href || hrefNode?.getAttribute?.("href") || "";
      const title = clean(container.querySelector?.("h2, h3, h4, .title, [class*='name']")?.textContent || hrefNode?.textContent);
      const key = `${lot}:${href}:${text.slice(0, 80)}`;
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({text,title,href});
    });
    return {records:parseAuctionResultRows(rows,{period,projectName,entryKey}),period,projectName,lifecycle};
  }

  return {clean, money, phoneFrom, orderDate, auctionDate, auctionPeriod, auctionLifecycle, normalizeOrderStatus, parseOrderCard, parseOrderDocument, parseAuctionResultRows, parseAuctionCatalogRows, parseAuctionResultDocument};
});
