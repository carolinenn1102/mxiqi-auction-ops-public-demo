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

  return {clean, money, phoneFrom, orderDate, auctionDate, normalizeOrderStatus, parseOrderCard, parseOrderDocument};
});
