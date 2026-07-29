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
    const source = [record.projectName, record.auctionHouse, record.auctionAt, record.lotLabel, record.itemName]
      .filter(Boolean)
      .join(" · ");
    const match = source.match(/(?:第\s*)?(\d{1,4})\s*期/);
    if (match) return `第${Number(match[1])}期`;
    return "期数待补";
  }

  function normalizeReturnDisposition(value = "") {
    const source = String(value).replace(/\s+/g, "");
    if (source.includes("拖回/发回")) return "拖回/发回";
    if (source.includes("拖回/再拍")) return "拖回/再拍";
    if (source.includes("拖回/等待")) return "拖回/等待";
    if (source.includes("拆单")) return "拆单";
    if (source.includes("寄存")) return "寄存";
    return "";
  }

  function trackerOutcome(value = "", finalPrice = 0) {
    const source = String(value).trim();
    const returnDisposition = normalizeReturnDisposition(source);
    if (returnDisposition === "寄存") return {finalOutcome:"待拍", returnDisposition};
    if (returnDisposition === "拆单") return {finalOutcome:Number(finalPrice) > 0 ? "成交" : "待拍", returnDisposition};
    if (returnDisposition) return {finalOutcome:"拖回", returnDisposition};
    if (source.includes("拖回")) return {finalOutcome:"拖回", returnDisposition:""};
    if (source.includes("流拍")) return {finalOutcome:"流拍", returnDisposition:""};
    if (source.includes("待拍")) return {finalOutcome:"待拍", returnDisposition:""};
    return {finalOutcome:Number(finalPrice) > 0 || source.includes("成交") ? "成交" : "待拍", returnDisposition:""};
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
    if (["拖回/发回", "拖回/再拍", "拖回/等待", "寄存"].includes(record.returnDisposition)) return record.returnDisposition;
    if (isPaymentOverdue(record, now)) return "超时未付款";
    if (record.paymentStatus === "待付款") return "待付款";
    if (record.finalOutcome) return record.finalOutcome;
    return Number(record.finalPrice) > 0 ? "成交" : "待拍";
  }

  function platformRecordKey(record = {}) {
    if (record.platformItemKey) return String(record.platformItemKey);
    if (record.mxiqiOrderId && record.lot) return `${record.mxiqiOrderId}:${record.lot}`;
    return "";
  }

  function recordBelongsToScope(record = {}, scope = "") {
    if (record.source !== "mxiqi_connector") return false;
    if (scope === "waitpay") return record.paymentStatus === "待付款";
    if (scope === "waitexpress") {
      return record.finalOutcome === "成交"
        && record.paymentStatus === "已付款"
        && !isReturnRecord(record)
        && shippingBucket(record) === "unshipped";
    }
    return false;
  }

  function reconcileAuthoritativeScope(records = [], incoming = [], scope = "", complete = false, timestamp = new Date().toISOString()) {
    if (!complete || !["waitpay", "waitexpress"].includes(scope)) return {records,departed:0};
    const incomingKeys = new Set(incoming.map(platformRecordKey).filter(Boolean));
    let departed = 0;
    const next = records.map((record) => {
      const key = platformRecordKey(record);
      if (!key || incomingKeys.has(key) || !recordBelongsToScope(record, scope)) return record;
      departed += 1;
      if (scope === "waitpay") {
        return {...record,paymentStatus:"已付款",paymentResolvedAt:timestamp,mxiqiOrderStatus:"已离开待付款",sourceUpdatedAt:timestamp};
      }
      return {...record,mxiqiShippingStatus:"filled",mxiqiFilledAt:record.mxiqiFilledAt || timestamp,mxiqiOrderStatus:"已离开待发货",sourceUpdatedAt:timestamp};
    });
    return {records:next,departed};
  }

  return {isReturnRecord,auctionPeriod,normalizeReturnDisposition,trackerOutcome,settlementGross,isSettlementEligible,shippingBucket,isPaymentOverdue,recordStatus,platformRecordKey,recordBelongsToScope,reconcileAuthoritativeScope};
});
