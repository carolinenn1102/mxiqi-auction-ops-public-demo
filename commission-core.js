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

  function rebateTiers(settings = {}) {
    return ["", "2", "3", "4"].map((suffix, index) => ({
      index: index + 1,
      threshold: Math.max(0, Number(settings[`boxRebateThreshold${suffix}`]) || 0),
      value: Math.max(0, Number(settings[`boxRebateValue${suffix}`]) || 0),
    })).filter((tier) => tier.value > 0).sort((a, b) => b.threshold - a.threshold || b.value - a.value);
  }

  function matchedBoxRebate({gross = 0, title = "", settings = {}} = {}) {
    const normalizedTitle = String(title || "").toUpperCase();
    if (!keywords(settings.boxRebateKeywords).some((keyword) => normalizedTitle.includes(keyword))) return null;
    return rebateTiers(settings).find((tier) => Number(gross || 0) >= tier.threshold) || null;
  }

  function birthdayEligibility({gross = 0, birthdayMonth = 0, auctionMonth = 0, title = "", settings = {}} = {}) {
    const price = Math.max(0, Number(gross) || 0);
    const threshold = Math.max(0, Number(settings.birthdayThreshold ?? 2000) || 0);
    const requiredKeywords = keywords(settings.birthdayKeywords ?? "NGC,PCGS");
    const normalizedTitle = String(title || "").toUpperCase();
    const isBirthdayMonth = Boolean(Number(birthdayMonth) && Number(birthdayMonth) === Number(auctionMonth));
    const keywordMatched = requiredKeywords.some((keyword) => normalizedTitle.includes(keyword));
    return {
      eligible:isBirthdayMonth && price >= threshold && keywordMatched,
      isBirthdayMonth,
      threshold,
      keywordMatched,
      requiredKeywords,
    };
  }

  function calculate({gross = 0, birthdayMonth = 0, auctionMonth = 0, title = "", isReturn = false, settings = {}} = {}) {
    const price = Math.max(0, Number(gross) || 0);
    if (isReturn) {
      const value = Math.max(0, Number(settings.returnHandlingFee) || 0);
      return {amount:money(value),label:"拖回处理费",isBirthday:false,isBirthdayMonth:false,isLowPrice:false,isBoxRebate:false,isBoxRebateEligible:false,isReturn:true,type:"fixed",value};
    }
    const birthday = birthdayEligibility({gross:price,birthdayMonth,auctionMonth,title,settings});
    const isBirthday = birthday.eligible;
    const boxRebateTier = matchedBoxRebate({gross:price,title,settings});
    const isBoxRebateEligible = Boolean(boxRebateTier);
    const isBoxRebate = !isBirthday && isBoxRebateEligible;
    const isLowPrice = !isBirthday && !isBoxRebate && price < Number(settings.lowPriceThreshold || 0);
    const type = isBirthday ? settings.birthdayCommissionType : isBoxRebate ? "percent" : isLowPrice ? "fixed" : settings.defaultCommissionType;
    const value = Number(isBirthday
      ? settings.birthdayCommissionValue
      : isBoxRebate
        ? -Math.abs(Number(boxRebateTier?.value) || 0)
        : isLowPrice
          ? settings.lowPriceFee
          : settings.defaultCommissionValue) || 0;
    const label = isBirthday ? settings.birthdayLabel || "生日" : isBoxRebate ? "NP优惠" : isLowPrice ? "低价固定佣金" : "普通佣金";
    const amount = money(type === "fixed" ? value : price * value / 100);
    return {amount:type === "fixed" ? amount : Math.min(amount, price),label,isBirthday,isBirthdayMonth:birthday.isBirthdayMonth,birthdayEligibility:birthday,isLowPrice,isBoxRebate,isBoxRebateEligible,boxRebateTier,isReturn:false,type,value};
  }

  function hasBoxRebate({gross = 0, title = "", settings = {}} = {}) {
    return Boolean(matchedBoxRebate({gross,title,settings}));
  }

  function isBirthdayEligible(options = {}) {
    return birthdayEligibility(options).eligible;
  }

  return {calculate,hasBoxRebate,isBirthdayEligible,birthdayEligibility,keywords,rebateTiers,matchedBoxRebate};
});
