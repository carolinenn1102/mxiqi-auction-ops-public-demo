(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MxiqiWorkflow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function isReturnRecord(record = {}) {
    return record.finalOutcome === "拖回" || /^拖回\//.test(String(record.returnDisposition || ""));
  }

  function auctionPeriod(record = {}) {
    const source = String(record.projectName || record.auctionHouse || "").trim();
    const match = source.match(/第\s*(\d+)\s*期/);
    if (match) return `第${Number(match[1])}期`;
    return "期数待补";
  }

  function settlementGross(record = {}) {
    return isReturnRecord(record) ? 0 : Math.max(0, Number(record.finalPrice) || 0);
  }

  function isSettlementEligible(record = {}) {
    return isReturnRecord(record) || settlementGross(record) > 0;
  }

  function shippingBucket(record = {}) {
    return record.mxiqiShippingStatus === "filled" || Boolean(record.outboundTrackingNumber)
      ? "shipped"
      : "unshipped";
  }

  function isPaymentOverdue(record = {}, now = Date.now()) {
    if (record.paymentStatus !== "待付款" || !record.paymentDueAt || Number(record.finalPrice) <= 0) return false;
    const deadline = new Date(record.paymentDueAt).getTime();
    const current = now instanceof Date ? now.getTime() : Number(now);
    return Number.isFinite(deadline) && Number.isFinite(current) && deadline < current;
  }

  function recordStatus(record = {}, now = Date.now()) {
    if (record.returnDisposition === "拆单") return record.finalOutcome === "成交" ? "拆单/成交" : "拆单";
    if (["拖回/发回", "拖回/再拍", "拖回/等待"].includes(record.returnDisposition)) return record.returnDisposition;
    if (isPaymentOverdue(record, now)) return "超时未付款";
    if (record.paymentStatus === "待付款") return "待付款";
    return record.finalOutcome || "待确认";
  }

  return {isReturnRecord,auctionPeriod,settlementGross,isSettlementEligible,shippingBucket,isPaymentOverdue,recordStatus};
});
