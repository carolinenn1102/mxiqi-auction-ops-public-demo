(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MxiqiWorkflow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function isStorageRecord(record = {}) {
    return normalizeReturnDisposition(record.returnDisposition) === "寄存";
  }

  function isReturnRecord(record = {}) {
    if (isStorageRecord(record)) return false;
    return record.unpaidReturn === true || record.finalOutcome === "拖回" || /^拖回\//.test(String(record.returnDisposition || ""));
  }

  function auctionDateKey(value = "") {
    const source = String(value || "").trim();
    const full = source.match(/(?:^|\D)(20\d{2})[-\/]?(\d{2})[-\/]?(\d{2})(?:\D|$)/);
    const compact = full ? null : source.match(/(?:^|\D)(\d{2})(\d{2})(\d{2})(?:\D|$)/);
    const year = Number(full?.[1] || (compact ? `20${compact[1]}` : 0));
    const month = Number(full?.[2] || compact?.[2] || 0);
    const day = Number(full?.[3] || compact?.[3] || 0);
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) return "";
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return "";
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function trackerAuctionPeriod(value = "") {
    const match = String(value || "").match(/(?:第\s*)?(\d{1,4})\s*期/);
    if (!match) return "";
    const period = Number(match[1]);
    // The supplied 0806 tracker accidentally labelled the 2026-08-06 auction as period 77.
    if (period === 77 && auctionDateKey(value) === "2026-08-06") return "第78期";
    return `第${period}期`;
  }

  function correctKnown0806AuctionText(value = "") {
    const source = String(value || "");
    if (auctionDateKey(source) !== "2026-08-06") return source;
    return source.replace(/((?:第\s*)?)77(\s*期)/g, (_match, prefix, suffix) => `${prefix}78${suffix}`);
  }

  function auctionDateEnd(value = "") {
    const key = auctionDateKey(value);
    if (!key) return NaN;
    const [year, month, day] = key.split("-").map(Number);
    const nextDay = new Date(year, month - 1, day + 1);
    return nextDay.getTime();
  }

  function isAuctionResultPending(record = {}, now = Date.now()) {
    if (normalizeReturnDisposition(record.returnDisposition)) return false;
    if (["成交", "流拍", "拖回"].includes(record.finalOutcome)) return false;
    if (Number(record.finalPrice) > 0 || record.paymentStatus === "待付款" || record.paymentStatus === "已付款") return false;
    const end = auctionDateEnd(record.auctionAt || record.platformAuctionAt);
    const current = now instanceof Date ? now.getTime() : Number(now);
    return Number.isFinite(end) && Number.isFinite(current) && current >= end;
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
    const parsed = trackerAuctionPeriod(source);
    if (parsed) return parsed;
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

  function isHandledReturnDisposition(value) {
    return ["拖回/发回", "拖回/再拍", "寄存"].includes(normalizeReturnDisposition(value));
  }

  function isReturnDispositionConfirmed(record = {}) {
    const disposition = normalizeReturnDisposition(record.returnDisposition);
    if (disposition === "寄存") return true;
    return ["拖回/发回", "拖回/再拍"].includes(disposition)
      && Boolean(String(record.returnDispositionConfirmedAt || "").trim());
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
      returnDispositionConfirmedAt:"",
      returnDispositionReviewRequiredAt:"",
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
    if (isStorageRecord(record) && record.paymentStatus !== "已付款") return 0;
    return isReturnRecord(record) ? 0 : Math.max(0, Number(record.finalPrice) || 0);
  }

  function isSettlementEligible(record = {}) {
    if (isStorageRecord(record)) return true;
    return isReturnRecord(record) || record.finalOutcome === "流拍" || settlementGross(record) > 0;
  }

  function settlementBlocker(record = {}) {
    const disposition = normalizeReturnDisposition(record.returnDisposition);
    const returnLike = record.unpaidReturn === true
      || record.finalOutcome === "拖回"
      || /^拖回\//.test(String(record.returnDisposition || ""));
    if (returnLike) {
      if (disposition === "寄存" || isReturnDispositionConfirmed(record)) return "";
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
    if (["拖回/发回", "拖回/再拍"].includes(record.returnDisposition) && !isReturnDispositionConfirmed(record)) return "拖回/等待";
    if (["拖回/发回", "拖回/再拍", "拖回/等待", "寄存"].includes(record.returnDisposition)) return record.returnDisposition;
    if (record.relisted && record.finalOutcome === "待拍") return "上拍";
    if (isPaymentOverdue(record, now)) return "超时未付款";
    if (record.paymentStatus === "待付款") return "待付款";
    if (isAuctionResultPending(record, now)) return "成交结果待同步";
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
    const sameIdentity = Number.isInteger(leftLot)
      && leftLot > 0
      && leftLot === rightLot
      && auctionPeriod(left) === auctionPeriod(right);
    if (!sameIdentity) return false;
    const leftDate = auctionDateKey(left.auctionAt || left.platformAuctionAt);
    const rightDate = auctionDateKey(right.auctionAt || right.platformAuctionAt);
    return !(leftDate && rightDate && leftDate !== rightDate);
  }

  function settlementMatchKey(record = {}, period = "") {
    const lot = Number(record.lot);
    if (!Number.isInteger(lot) || lot <= 0) return "";
    const normalizedPeriod = period ? auctionPeriod({auctionPeriodOverride:period}) : auctionPeriod(record);
    return `${normalizedPeriod}:${lot}`;
  }

  function hasConsignorName(value) {
    const name = String(value || "").trim();
    return Boolean(name && !["待补送拍人", "手机号用户"].includes(name));
  }

  function mergePreservingConsignor(existing = {}, incoming = {}) {
    const merged = {...existing, ...incoming};
    if (!hasConsignorName(incoming.sellerWechat) && hasConsignorName(existing.sellerWechat)) {
      merged.sellerWechat = existing.sellerWechat;
    }
    if (!String(incoming.sellerPhone || "").trim() && String(existing.sellerPhone || "").trim()) {
      merged.sellerPhone = existing.sellerPhone;
    }
    if (incoming.birthdayPending === true) {
      merged.birthdayMonth = 0;
      merged.birthdayPending = true;
    } else if (Number(incoming.birthdayMonth || 0)) {
      merged.birthdayMonth = Number(incoming.birthdayMonth);
      merged.birthdayPending = false;
    } else if (!Number(incoming.birthdayMonth || 0) && Number(existing.birthdayMonth || 0)) {
      merged.birthdayMonth = Number(existing.birthdayMonth);
    }
    if (!String(incoming.contactedAt || "").trim() && String(existing.contactedAt || "").trim()) {
      merged.contactedAt = existing.contactedAt;
    }
    if (!normalizeReturnDisposition(incoming.returnDisposition) && normalizeReturnDisposition(existing.returnDisposition)) {
      merged.returnDisposition = normalizeReturnDisposition(existing.returnDisposition);
    }
    return merged;
  }

  function mergePlatformOrderRecords(records = [], incomingOrders = [], timestamp = new Date().toISOString()) {
    const next = records.map((record) => ({...record}));
    let matched = 0;
    let added = 0;
    let skipped = 0;
    for (const incomingRecord of incomingOrders) {
      const incoming = {...incomingRecord};
      const lot = Number(incoming.lot);
      if (!Number.isInteger(lot) || lot <= 0 || !String(incoming.itemName || "").trim()) {
        skipped += 1;
        continue;
      }
      const platformKey = platformRecordKey(incoming);
      const index = next.findIndex((record) => (platformKey && platformRecordKey(record) === platformKey)
        || sameAuctionLot(record, incoming));
      if (index >= 0) {
        next[index] = {
          ...mergeImportedRecord(next[index], incoming),
          id:next[index].id || incoming.id || "",
          sourceUpdatedAt:incoming.sourceUpdatedAt || timestamp,
        };
        matched += 1;
      } else {
        next.push({...incoming,sourceUpdatedAt:incoming.sourceUpdatedAt || timestamp});
        added += 1;
      }
    }
    return {records:next,matched,added,skipped};
  }

  const CROSS_AUCTION_RESULT_FIELDS = [
    "platformItemKey","source","sourceUpdatedAt","mxiqiAuctionItemUrl","mxiqiOrderId","mxiqiOrderUrl",
    "mxiqiMemberId","mxiqiOrderStatus","mxiqiSeenScopes","platformOrderDate","platformAuctionAt",
    "finalOutcome","finalPrice","paymentStatus","paymentDueAt","paymentResolvedAt","paymentStatusManual",
    "paymentStatusManualAt","buyerName","buyerPhone","recipientRaw","recipientName","recipientPhone",
    "addressProvince","addressCity","addressDistrict","addressDetail","addressStatus","addressWarnings",
    "addressReviewedAt","commissionPlatformAmount","incomePlatformAmount","commissionAmount","settlementAmount",
    "settlementAdjustment","profit","promotion","settledAt","settlementNote","unpaidReturn",
    "unpaidReturnDetectedAt","returnDisposition","outboundTrackingNumber","shippingOrderedAt","mxiqiShippingStatus",
  ];

  function repairKnown0806Import(records = [], timestamp = new Date().toISOString()) {
    let periodCorrected = 0;
    let settlementCleared = 0;
    let birthdayPending = 0;
    const affectedConsignors = new Set();
    const next = records.map((record) => {
      if (auctionDateKey(record.auctionAt || record.platformAuctionAt) !== "2026-08-06") return {...record};
      const updated = {...record};
      const rawPeriodText = [record.auctionPeriodOverride,record.auctionAt,record.projectName,record.lotLabel]
        .filter(Boolean)
        .join(" · ");
      if (/(?:第\s*)?77\s*期/.test(rawPeriodText)) {
        updated.auctionPeriodOverride = "第78期";
        updated.auctionAt = correctKnown0806AuctionText(record.auctionAt);
        updated.periodCorrectedAt = timestamp;
        periodCorrected += 1;
      }
      if (Number(record.birthdayMonth || 0) === 8) {
        updated.birthdayMonth = 0;
        updated.birthdayPending = true;
        updated.birthdayRuleCorrectedAt = timestamp;
        if (record.sellerWechat) affectedConsignors.add(String(record.sellerWechat));
        birthdayPending += 1;
      }
      if (/^auction-result:312210:/.test(String(record.platformItemKey || ""))) {
        CROSS_AUCTION_RESULT_FIELDS.forEach((field) => { delete updated[field]; });
        updated.finalPrice = 0;
        updated.settled = false;
        updated.crossAuctionResultClearedAt = timestamp;
        settlementCleared += 1;
      }
      return updated;
    });
    return {records:next,periodCorrected,settlementCleared,birthdayPending,affectedConsignors:[...affectedConsignors]};
  }

  function isBlankImportValue(value) {
    return value === undefined
      || value === null
      || (typeof value === "string" && value.trim() === "")
      || (Array.isArray(value) && value.length === 0);
  }

  function mergeImportedRecord(existing = {}, incoming = {}) {
    const nonBlankIncoming = Object.fromEntries(
      Object.entries(incoming).filter(([, value]) => !isBlankImportValue(value)),
    );
    const merged = mergePreservingConsignor(existing, nonBlankIncoming);
    if (existing.paymentStatusManual && !incoming.paymentStatusManual) {
      merged.paymentStatus = existing.paymentStatus;
      merged.paymentStatusManual = true;
      merged.paymentStatusManualAt = existing.paymentStatusManualAt || "";
      if (existing.paymentStatus === "已付款" && !normalizeReturnDisposition(existing.returnDisposition)) {
        merged.finalOutcome = existing.finalOutcome || merged.finalOutcome;
        merged.returnDisposition = "";
        merged.unpaidReturn = false;
        merged.unpaidReturnDetectedAt = "";
        merged.paymentDueAt = "";
      }
    }
    return merged;
  }

  function applyManualPaymentResolution(record = {}, previous = {}, timestamp = new Date().toISOString()) {
    const updated = {...record};
    const changed = String(record.paymentStatus || "") !== String(previous.paymentStatus || "");
    if (changed) {
      updated.paymentStatusManual = true;
      updated.paymentStatusManualAt = timestamp;
    } else if (previous.paymentStatusManual) {
      updated.paymentStatusManual = true;
      updated.paymentStatusManualAt = previous.paymentStatusManualAt || timestamp;
    }
    if (updated.paymentStatus === "已付款"
      && updated.finalOutcome === "成交"
      && !normalizeReturnDisposition(updated.returnDisposition)) {
      updated.unpaidReturn = false;
      updated.unpaidReturnDetectedAt = "";
      updated.paymentDueAt = "";
    }
    return updated;
  }

  function mergeAuctionRecordCopies(preferred = {}, fallback = {}) {
    const merged = {...preferred};
    Object.entries(fallback).forEach(([key, value]) => {
      const current = merged[key];
      const currentMissing = current === undefined
        || current === null
        || current === ""
        || (Array.isArray(current) && current.length === 0);
      const fallbackPresent = value !== undefined
        && value !== null
        && value !== ""
        && (!Array.isArray(value) || value.length > 0);
      if (currentMissing && fallbackPresent) merged[key] = value;
    });
    if (!hasConsignorName(merged.sellerWechat) && hasConsignorName(fallback.sellerWechat)) {
      merged.sellerWechat = fallback.sellerWechat;
    }
    if (!String(merged.sellerPhone || "").trim() && String(fallback.sellerPhone || "").trim()) {
      merged.sellerPhone = fallback.sellerPhone;
    }
    if (!Number(merged.birthdayMonth || 0) && Number(fallback.birthdayMonth || 0)) {
      merged.birthdayMonth = Number(fallback.birthdayMonth);
    }
    if (!String(merged.contactedAt || "").trim() && String(fallback.contactedAt || "").trim()) {
      merged.contactedAt = fallback.contactedAt;
    }
    return merged;
  }

  function deduplicateAuctionLots(records = []) {
    const next = [];
    const idMap = {};
    let removed = 0;
    records.forEach((record) => {
      const index = next.findIndex((existing) => sameAuctionLot(existing, record));
      if (index < 0) {
        next.push({...record});
        return;
      }
      const survivor = next[index];
      next[index] = mergeAuctionRecordCopies(survivor, record);
      if (record.id && survivor.id && record.id !== survivor.id) idMap[record.id] = survivor.id;
      removed += 1;
    });
    return {records:next,removed,idMap};
  }

  function restoreConsignorIdentities(records = [], snapshots = [], customers = {}) {
    const identities = new Map();
    snapshots.forEach((snapshot) => {
      const snapshotRecords = Array.isArray(snapshot) ? snapshot : snapshot?.records;
      if (!Array.isArray(snapshotRecords)) return;
      snapshotRecords.forEach((record) => {
        const key = settlementMatchKey(record);
        if (!key || identities.has(key) || !hasConsignorName(record.sellerWechat)) return;
        identities.set(key, {
          sellerWechat:String(record.sellerWechat).trim(),
          sellerPhone:String(record.sellerPhone || "").trim(),
          birthdayMonth:Number(record.birthdayMonth || 0),
          contactedAt:String(record.contactedAt || ""),
        });
      });
    });
    let restored = 0;
    const next = records.map((record) => {
      let updated = {...record};
      const historical = identities.get(settlementMatchKey(record));
      if (!hasConsignorName(updated.sellerWechat) && historical) {
        updated = mergePreservingConsignor(updated, historical);
        restored += 1;
      }
      if (hasConsignorName(updated.sellerWechat)) {
        const profile = customers?.[updated.sellerWechat] || {};
        if (!String(updated.sellerPhone || "").trim() && String(profile.phone || "").trim()) updated.sellerPhone = String(profile.phone).trim();
        if (!Number(updated.birthdayMonth || 0) && Number(profile.birthdayMonth || 0)) updated.birthdayMonth = Number(profile.birthdayMonth);
      }
      return updated;
    });
    return {records:next,restored};
  }

  function restoreHandledReturnDispositions(records = [], snapshots = [], timestamp = new Date().toISOString()) {
    const handledById = new Map();
    const handledByLot = new Map();
    snapshots.forEach((snapshot) => {
      const snapshotRecords = Array.isArray(snapshot) ? snapshot : snapshot?.records;
      if (!Array.isArray(snapshotRecords)) return;
      snapshotRecords.forEach((record) => {
        const disposition = normalizeReturnDisposition(record.returnDisposition);
        if (!isHandledReturnDisposition(disposition) || !isReturnDispositionConfirmed(record)) return;
        const historical = {...record,returnDisposition:disposition};
        if (record.id && !handledById.has(String(record.id))) handledById.set(String(record.id), historical);
        const key = settlementMatchKey(record);
        if (key && !handledByLot.has(key)) handledByLot.set(key, historical);
      });
    });
    let restored = 0;
    const next = records.map((record) => {
      if (record.settled || isHandledReturnDisposition(record.returnDisposition)) return {...record};
      if (normalizeReturnDisposition(record.returnDisposition)) return {...record};
      if (!String(record.sourceUpdatedAt || "").trim()) return {...record};
      const historical = (record.id && handledById.get(String(record.id))) || handledByLot.get(settlementMatchKey(record));
      if (!historical) return {...record};
      const disposition = normalizeReturnDisposition(historical.returnDisposition);
      restored += 1;
      return {
        ...record,
        returnDisposition:disposition,
        returnDispositionConfirmedAt:historical.returnDispositionConfirmedAt,
        finalOutcome:disposition === "寄存" ? "待拍" : "拖回",
        unpaidReturn:false,
        returnDispositionRestoredAt:timestamp,
      };
    });
    return {records:next,restored};
  }

  function requireManualReturnReview(records = [], timestamp = new Date().toISOString()) {
    let reviewRequired = 0;
    const next = records.map((record) => {
      const disposition = normalizeReturnDisposition(record.returnDisposition);
      if (record.settled || !["拖回/发回", "拖回/再拍"].includes(disposition) || isReturnDispositionConfirmed(record)) return {...record};
      reviewRequired += 1;
      return {
        ...record,
        finalOutcome:"拖回",
        returnDisposition:"拖回/等待",
        returnDispositionConfirmedAt:"",
        returnDispositionRestoredAt:"",
        returnDispositionReviewRequiredAt:timestamp,
        unpaidReturn:Boolean(record.unpaidReturn || record.finalOutcome === "拖回" || record.paymentStatus === "待付款"),
      };
    });
    return {records:next,reviewRequired};
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
      const manualPaidNormal = existing.paymentStatusManual
        && existing.paymentStatus === "已付款"
        && !normalizeReturnDisposition(existing.returnDisposition);
      const pending = isPending({...existing,...incoming}) && !manualPaidNormal;
      const localDisposition = normalizeReturnDisposition(existing.returnDisposition);
      const keepHandledDisposition = isHandledReturnDisposition(localDisposition) && isReturnDispositionConfirmed(existing);
      const finalPrice = Math.max(0, Number(incoming.finalPrice ?? existing.finalPrice) || 0);
      const platformOutcome = incoming.finalOutcome || (finalPrice > 0 ? "成交" : "流拍");
      const updated = {
        ...mergePreservingConsignor(existing, incoming),
        auctionPeriodOverride:selectedPeriod,
        source:incoming.source || existing.source || "mxiqi_connector",
        sourceUpdatedAt:timestamp,
      };
      if (pending) {
        updated.finalPrice = finalPrice;
        updated.paymentStatus = "待付款";
        if (keepHandledDisposition) {
          updated.finalOutcome = localDisposition === "寄存" ? "待拍" : "拖回";
          updated.unpaidReturn = localDisposition !== "寄存";
          updated.unpaidReturnDetectedAt = existing.unpaidReturnDetectedAt || timestamp;
          updated.returnDisposition = localDisposition;
        } else {
          updated.finalOutcome = finalPrice > 0 ? "成交" : platformOutcome;
          updated.unpaidReturn = false;
          updated.unpaidReturnDetectedAt = "";
          updated.returnDisposition = "";
          updated.returnDispositionConfirmedAt = "";
          updated.returnDispositionReviewRequiredAt = "";
        }
        updated.settled = Boolean(existing.settled);
        unpaid += 1;
      } else if (platformOutcome === "成交" && finalPrice > 0) {
        updated.finalOutcome = keepHandledDisposition
          ? localDisposition === "寄存" ? "待拍" : "拖回"
          : "成交";
        updated.finalPrice = finalPrice;
        updated.paymentStatus = incoming.paymentStatus || "已付款";
        updated.unpaidReturn = false;
        updated.returnDisposition = keepHandledDisposition
          ? localDisposition
          : localDisposition === "拖回/等待" ? "" : normalizeReturnDisposition(updated.returnDisposition);
        if (!keepHandledDisposition) {
          updated.returnDispositionConfirmedAt = "";
          updated.returnDispositionReviewRequiredAt = "";
        }
      } else {
        updated.finalOutcome = keepHandledDisposition
          ? localDisposition === "寄存" ? "待拍" : "拖回"
          : "流拍";
        updated.finalPrice = keepHandledDisposition ? finalPrice : 0;
        updated.paymentStatus = "";
        updated.unpaidReturn = false;
        updated.returnDisposition = keepHandledDisposition
          ? localDisposition
          : localDisposition === "拖回/等待" ? "" : normalizeReturnDisposition(updated.returnDisposition);
        if (!keepHandledDisposition) {
          updated.returnDispositionConfirmedAt = "";
          updated.returnDispositionReviewRequiredAt = "";
        }
      }
      if (existing.paymentStatusManual && existing.paymentStatus) {
        updated.paymentStatus = existing.paymentStatus;
        updated.paymentStatusManual = true;
        updated.paymentStatusManualAt = existing.paymentStatusManualAt || "";
        if (existing.paymentStatus === "已付款" && !normalizeReturnDisposition(existing.returnDisposition)) {
          updated.finalOutcome = existing.finalOutcome === "成交" ? "成交" : updated.finalOutcome;
          updated.returnDisposition = "";
          updated.unpaidReturn = false;
          updated.unpaidReturnDetectedAt = "";
          updated.paymentDueAt = "";
        }
      }
      return updated;
    }

    const processedDealIndexes = new Set();
    for (const incoming of deals) {
      const lot = Number(incoming.lot);
      if (!Number.isInteger(lot) || lot <= 0 || !incoming.itemName) continue;
      const incomingWithPeriod = {...incoming,auctionPeriodOverride:selectedPeriod};
      const index = next.findIndex((record) => sameAuctionLot(record, incomingWithPeriod));
      if (index >= 0) {
        next[index] = applyResult(next[index], incomingWithPeriod);
        processedDealIndexes.add(index);
        matched += 1;
      } else {
        next.push(applyResult({}, incomingWithPeriod));
        processedDealIndexes.add(next.length - 1);
        added += 1;
      }
    }

    next.forEach((record, index) => {
      if (processedDealIndexes.has(index) || auctionPeriod(record) !== selectedPeriod || !isPending(record) || record.unpaidReturn) return;
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

  return {isStorageRecord,isReturnRecord,auctionDateKey,trackerAuctionPeriod,correctKnown0806AuctionText,auctionPeriod,auctionDateEnd,isAuctionResultPending,normalizeReturnDisposition,isHandledReturnDisposition,isReturnDispositionConfirmed,trackerOutcome,relistRecord,settlementGross,isSettlementEligible,settlementBlocker,settlementReadiness,shippingBucket,isPaymentOverdue,recordStatus,platformRecordKey,sameAuctionLot,settlementMatchKey,hasConsignorName,mergePreservingConsignor,mergeImportedRecord,mergePlatformOrderRecords,repairKnown0806Import,applyManualPaymentResolution,mergeAuctionRecordCopies,deduplicateAuctionLots,restoreConsignorIdentities,restoreHandledReturnDispositions,requireManualReturnReview,applyAuctionSettlementResults,recordBelongsToScope,reconcileAuthoritativeScope};
});
