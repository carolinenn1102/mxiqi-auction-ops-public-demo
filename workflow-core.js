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

  return {isReturnRecord,auctionPeriod,settlementGross,isSettlementEligible,shippingBucket};
});
