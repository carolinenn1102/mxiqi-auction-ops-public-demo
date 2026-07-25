(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MxiqiPackages = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function packageKey(record) {
    const orderId = String(record?.mxiqiOrderId || "").trim();
    if (orderId) return `order:${orderId}`;
    const waybill = String(record?.outboundTrackingNumber || "").trim();
    if (waybill) return `waybill:${waybill}`;
    return `single:${String(record?.id || "")}`;
  }

  function groupRecords(records) {
    const groups = new Map();
    for (const record of records || []) {
      const key = packageKey(record);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    }
    return Array.from(groups, ([key, items]) => ({
      key,
      records: items,
      isPackage: items.length > 1,
    }));
  }

  function sameValue(records, field) {
    const values = (records || []).map((record) => String(record?.[field] || "").trim());
    if (!values.length || !values[0]) return "";
    return values.every((value) => value === values[0]) ? values[0] : "";
  }

  return {packageKey, groupRecords, sameValue};
});
