(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MxiqiLogistics = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const CARRIERS = Object.freeze({
    sf: {label:"顺丰", portal:"https://v.sf-express.com/web/"},
    cainiao: {label:"菜鸟", portal:""},
  });

  function text(value) {
    return String(value ?? "").trim();
  }

  function phone(value) {
    const digits = text(value).replace(/\D/g, "");
    return /^1[3-9]\d{9}$/.test(digits) ? digits : "";
  }

  function senderFor(settings = {}, carrier = "cainiao") {
    const prefix = carrier === "sf" ? "sf" : "cainiao";
    return {
      name:text(settings[`${prefix}SenderName`]),
      phone:phone(settings[`${prefix}SenderPhone`]),
      address:text(settings[`${prefix}SenderAddress`]),
      monthlyAccount:carrier === "sf" ? text(settings.sfMonthlyAccount) : "",
    };
  }

  function buildRequest({records = [], carrier = "cainiao", settings = {}} = {}) {
    const first = records[0] || {};
    const localSender = senderFor(settings, carrier);
    // 月结卡号由服务器物流网关持有，不随浏览器下单请求发送。
    const sender = {
      name:localSender.name,
      phone:localSender.phone,
      address:localSender.address,
    };
    const receiver = {
      name:text(first.recipientName),
      phone:phone(first.recipientPhone),
      province:text(first.addressProvince),
      city:text(first.addressCity),
      district:text(first.addressDistrict),
      address:text(first.addressDetail),
    };
    const request = {
      carrier,
      clientReference:text(first.mxiqiOrderId || `LOT-${first.lot || ""}`),
      orderNumber:text(first.mxiqiOrderId),
      billing:{payer:"sender"},
      service:{
        insurance:false,
        packaging:false,
        orderMode:carrier === "cainiao" ? "apply_express" : "contract_product",
      },
      pickup:carrier === "sf"
        ? {mode:"scheduled", policy:"five_hours_next_whole_hour"}
        : {mode:"carrier_default"},
      sender,
      receiver,
      parcel:{
        count:1,
        weightKg:Number(first.shipmentWeightKg || settings.defaultPackageWeightKg || 0.8),
        goodsName:text(first.shippingGoodsName || settings.defaultGoodsName || "章牌"),
        insured:false,
        packagingService:false,
        itemCount:records.length,
        lots:records.map((item) => text(item.lot)).filter(Boolean),
      },
    };
    return request;
  }

  function validateRequest(request = {}) {
    const missing = [];
    if (!CARRIERS[request.carrier]) missing.push("承运商");
    if (!request.clientReference) missing.push("业务单号");
    if (!request.sender?.name) missing.push("寄件人");
    if (!phone(request.sender?.phone)) missing.push("寄件手机号");
    if (!request.sender?.address) missing.push("寄件地址");
    if (!request.receiver?.name) missing.push("收件人");
    if (!phone(request.receiver?.phone)) missing.push("收件手机号");
    if (!request.receiver?.province) missing.push("收件省份");
    if (!request.receiver?.city) missing.push("收件城市");
    if (!request.receiver?.district) missing.push("收件区县");
    if (!request.receiver?.address) missing.push("收件详细地址");
    if (!(Number(request.parcel?.weightKg) > 0)) missing.push("包裹重量");
    if (!request.parcel?.goodsName) missing.push("物品名称");
    return {ok:missing.length === 0, missing};
  }

  function normalizeReceipt(value = {}) {
    const waybill = text(value.waybill || value.waybillNo || value.trackingNumber || value.outboundTrackingNumber).replace(/\s+/g, "");
    const pickupCode = text(value.pickupCode || value.pickup_code);
    const logisticsOrderId = text(value.logisticsOrderId || value.orderId || value.order_id);
    if (!/^[A-Za-z0-9-]{6,50}$/.test(waybill)) throw new Error("请输入物流平台返回的真实运单号");
    return {waybill,pickupCode,logisticsOrderId};
  }

  function carrierLabel(value) {
    return CARRIERS[value]?.label || "待判断";
  }

  return Object.freeze({CARRIERS, senderFor, buildRequest, validateRequest, normalizeReceipt, carrierLabel});
});
