(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MxiqiCommission = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

  function keywords(value) {
    return String(value || "")
      .split(/[，,、\s]+/)
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
  }

  function calculate({gross = 0, birthdayMonth = 0, auctionMonth = 0, settings = {}} = {}) {
    const price = Math.max(0, Number(gross) || 0);
    const isBirthday = Boolean(Number(birthdayMonth) && Number(birthdayMonth) === Number(auctionMonth));
    const isLowPrice = !isBirthday && price < Number(settings.lowPriceThreshold || 0);
    const type = isBirthday ? settings.birthdayCommissionType : isLowPrice ? "fixed" : settings.defaultCommissionType;
    const value = Number(isBirthday ? settings.birthdayCommissionValue : isLowPrice ? settings.lowPriceFee : settings.defaultCommissionValue) || 0;
    const label = isBirthday ? settings.birthdayLabel || "生日月优惠" : isLowPrice ? "低价固定佣金" : "普通佣金";
    const amount = money(type === "fixed" ? value : price * value / 100);
    return {amount:Math.min(amount, price),label,isBirthday,isLowPrice,type,value};
  }

  function hasBoxRebate({gross = 0, title = "", settings = {}} = {}) {
    if (Number(gross || 0) < Number(settings.boxRebateThreshold || 0)) return false;
    const normalizedTitle = String(title || "").toUpperCase();
    return keywords(settings.boxRebateKeywords).some((keyword) => normalizedTitle.includes(keyword));
  }

  return {calculate,hasBoxRebate,keywords};
});
