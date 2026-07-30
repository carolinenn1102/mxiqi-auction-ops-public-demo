(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MxiqiWorkflow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function isReturnRecord(record = {}) {
    return record.unpaidReturn === true || record.finalOutcome === "拖回" || /^拖回\//.test(String(record.returnDisposition || ""));
  }

  function auctionPeriod(record = {}) {
    const override = String(record.auctionPeriodOverride || "").trim();
    if (override) {
      const overrideMatch = override.match(/(?:第\s*)?(\d{1,4})\s*期?/);
      return overrideMatch ? `第${Number(overrideMatch[1])}期` : override;
    }
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

  function relistRecord(record = {}, timestamp = new Date().toISOString()) {
    const priorReturnSettlement = record.priorReturnSettlement || {
      finalOutcome:record.finalOutcome || "",
      returnDisposition:record.returnDisposition || "",
      finalPrice:Number(record.finalPrice) || 0,
      settled:Boolean(record.settled),
      settledAt:record.settledAt || "",
      commissionAmount:Number(record.commissionAmount) || 0,
      settlementAmount:Number(record.settlementAmount) || 0,
      promotion:record.promotion || "",
      settlementNote:record.settlementNote || "",
      unpaidReturn:Boolean(record.unpaidReturn),
      unpaidReturnDetectedAt:record.unpaidReturnDetectedAt || "",
      buyerName:record.buyerName || "",
      buyerPhone:record.buyerPhone || "",
      recipientName:record.recipientName || "",
      recipientPhone:record.recipientPhone || "",
      recipientRaw:record.recipientRaw || "",
      mxiqiOrderId:record.mxiqiOrderId || "",
      outboundTrackingNumber:record.outboundTrackingNumber || "",
    };
    return {
      ...record,
      priorReturnSettlement,
      finalOutcome:"待拍",
      returnDisposition:"",
      finalPrice:0,
      paymentStatus:"",
      paymentDueAt:"",
      commissionAmount:0,
      settlementAmount:0,
      profit:0,
      promotion:"",
      settled:false,
      settledAt:"",
      settlementNote:"",
      unpaidReturn:false,
      unpaidReturnDetectedAt:"",
      buyerName:"",
      buyerPhone:"",
      recipientName:"",
      recipientPhone:"",
      recipientRaw:"",
      addressProvince:"",
      addressCity:"",
      addressDistrict:"",
      addressDetail:"",
      addressStatus:"",
      addressWarnings:[],
      addressReviewedAt:"",
      mxiqiOrderId:"",
      outboundTrackingNumber:"",
      shippingOrderedAt:"",
      mxiqiShippingStatus:"",
      pickupCode:"",
      carrier:"pending",
      logisticsStatus:"not_requested",
      logisticsNote:"",
      relisted:true,
      relistedAt:timestamp,
    };
  }

  function settlementGross(record = {}) {
    return isReturnRecord(record) ? 0 : Math.max(0, Number(record.finalPrice) || 0);
  }

  function isSettlementEligible(record = {}) {
    return isReturnRecord(record) || settlementGross(record) > 0;
  }

  function settlementBlocker(record = {}) {
    const disposition = normalizeReturnDisposition(record.returnDisposition);
    const returnLike = record.unpaidReturn === true
      || record.finalOutcome === "拖回"
      || /^拖回\//.test(String(record.returnDisposition || ""));
    if (returnLike) {
      if (["拖回/发回", "拖回/再拍", "寄存"].includes(disposition)) return "";
      return disposition === "拖回/等待" ? "拖回/等待" : "拖回待选择处理方式";
    }
    if (record.paymentStatus === "待付款" && Number(record.finalPrice) > 0) {
      return disposition === "拆单" ? "拆单待付款" : "待付款";
    }
    return "";
  }

  function settlementReadiness(records = [], period = "") {
    const normalizedPeriod = period ? auctionPeriod({auctionPeriodOverride:period}) : "";
    const validPeriod = normalizedPeriod && normalizedPeriod !== "期数待补";
    const scoped = validPeriod
      ? records.filter((record) => auctionPeriod(record) === normalizedPeriod)
      : [];
    const blockers = scoped.map((record) => ({
      id:record.id || "",
      lot:Number(record.lot) || 0,
      itemName:record.itemName || "",
      reason:settlementBlocker(record),
    })).filter((item) => item.reason);
    return {
      ready:Boolean(validPeriod) && blockers.length === 0,
      period:validPeriod ? normalizedPeriod : "",
      blockers,
      pendingPayment:blockers.filter((item) => ["待付款", "拆单待付款"].includes(item.reason)).length,
      pendingReturn:blockers.filter((item) => item.reason.startsWith("拖回")).length,
    };
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
    if (record.relisted && record.finalOutcome === "待拍") return "上拍";
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

  function sameAuctionLot(left = {}, right = {}) {
    const leftLot = Number(left.lot);
    const rightLot = Number(right.lot);
    return Number.isInteger(leftLot)
      && leftLot > 0
      && leftLot === rightLot
      && auctionPeriod(left) === auctionPeriod(right);
  }

  function settlementMatchKey(record = {}, period = "") {
    const lot = Number(record.lot);
    if (!Number.isInteger(lot) || lot <= 0) return "";
    const normalizedPeriod = period ? auctionPeriod({auctionPeriodOverride:period}) : auctionPeriod(record);
    return `${normalizedPeriod}:${lot}`;
  }

  function applyAuctionSettlementResults(records = [], deals = [], pendingOrders = [], period = "", timestamp = new Date().toISOString()) {
    const selectedPeriod = auctionPeriod({auctionPeriodOverride:period});
    if (!period || selectedPeriod === "期数待补") throw new Error("请先选择要结算的拍卖期数");
    const next = records.map((record) => ({...record}));
    let matched = 0;
    let added = 0;
    let unpaid = 0;

    function isPending(record = {}) {
      const orderId = String(record.mxiqiOrderId || "");
      const itemName = String(record.itemName || "").replace(/\s+/g, "").toLowerCase();
      return pendingOrders.some((pending) => {
          const pendingOrderId = String(pending.mxiqiOrderId || "");
          if (orderId && pendingOrderId && orderId === pendingOrderId) return true;
          if (Number(pending.lot) !== Number(record.lot)) return false;
          const pendingPeriod = auctionPeriod(pending);
          if (pendingPeriod === selectedPeriod) return true;
          const pendingName = String(pending.itemName || "").replace(/\s+/g, "").toLowerCase();
          return pendingPeriod === "期数待补" && itemName && pendingName === itemName;
        });
    }

    function applyResult(existing = {}, incoming = {}) {
      const pending = isPending({...existing,...incoming});
      const wasUnpaidReturn = existing.unpaidReturn === true;
      const finalPrice = Math.max(0, Number(incoming.finalPrice ?? existing.finalPrice) || 0);
      const platformOutcome = incoming.finalOutcome || (finalPrice > 0 ? "成交" : "流拍");
      const updated = {
        ...existing,
        ...incoming,
        auctionPeriodOverride:selectedPeriod,
        source:incoming.source || existing.source || "mxiqi_connector",
        sourceUpdatedAt:timestamp,
      };
      if (pending) {
        updated.finalOutcome = "拖回";
        updated.finalPrice = finalPrice;
        updated.paymentStatus = "待付款";
        updated.unpaidReturn = true;
        updated.unpaidReturnDetectedAt = existing.unpaidReturnDetectedAt || timestamp;
        updated.returnDisposition = /^拖回\//.test(String(existing.returnDisposition || "")) ? existing.returnDisposition : "拖回/等待";
        updated.settled = Boolean(existing.settled);
        unpaid += 1;
      } else if (platformOutcome === "成交" && finalPrice > 0) {
        updated.finalOutcome = "成交";
        updated.finalPrice = finalPrice;
        updated.paymentStatus = incoming.paymentStatus || "已付款";
        updated.unpaidReturn = false;
        if (wasUnpaidReturn && /^拖回\//.test(String(updated.returnDisposition || ""))) updated.returnDisposition = "";
      } else {
        updated.finalOutcome = "流拍";
        updated.finalPrice = 0;
        updated.paymentStatus = "";
        updated.unpaidReturn = false;
        if (wasUnpaidReturn && /^拖回\//.test(String(updated.returnDisposition || ""))) updated.returnDisposition = "";
      }
      return updated;
    }

    for (const incoming of deals) {
      const lot = Number(incoming.lot);
      if (!Number.isInteger(lot) || lot <= 0 || !incoming.itemName) continue;
      const incomingWithPeriod = {...incoming,auctionPeriodOverride:selectedPeriod};
      const index = next.findIndex((record) => sameAuctionLot(record, incomingWithPeriod));
      if (index >= 0) {
        next[index] = applyResult(next[index], incomingWithPeriod);
        matched += 1;
      } else {
        next.push(applyResult({}, incomingWithPeriod));
        added += 1;
      }
    }

    next.forEach((record, index) => {
      if (auctionPeriod(record) !== selectedPeriod || !isPending(record) || record.unpaidReturn) return;
      next[index] = applyResult(record, record);
      matched += 1;
    });

    return {records:next,matched,added,unpaid,period:selectedPeriod};
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

  return {isReturnRecord,auctionPeriod,normalizeReturnDisposition,trackerOutcome,relistRecord,settlementGross,isSettlementEligible,settlementBlocker,settlementReadiness,shippingBucket,isPaymentOverdue,recordStatus,platformRecordKey,sameAuctionLot,settlementMatchKey,applyAuctionSettlementResults,recordBelongsToScope,reconcileAuthoritativeScope};
});
