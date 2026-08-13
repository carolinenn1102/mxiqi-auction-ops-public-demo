import crypto from "node:crypto";

const API_BASES = {
  sandbox:"https://sfapi-sbox.sf-express.com/std/service",
  production:"https://sfapi.sf-express.com/std/service",
};
const SANDBOX_MONTHLY_CARD = "7551234567";

function text(value) {
  return String(value ?? "").trim();
}

function digits(value) {
  return text(value).replace(/\D/g, "");
}

function phpUrlEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/%20/g, "+")
    .replace(/[!'()*~]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function createSfDigest(msgData, timestamp, checkWord, mode = "simple_md5") {
  const source = `${msgData}${timestamp}${checkWord}`;
  const signed = mode === "url_encoded_md5" ? phpUrlEncode(source) : source;
  return crypto.createHash("md5").update(signed, "utf8").digest("base64");
}

function formatShanghai(date) {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone:"Asia/Shanghai",
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
    hourCycle:"h23",
  }).formatToParts(date).reduce((result, part) => ({...result, [part.type]:part.value}), {});
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function shanghaiDate(value) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone:"Asia/Shanghai",
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
  }).format(value);
}

export function nextPickupTime(now = new Date(), options = {}) {
  const leadHours = Math.max(0, Number(options.leadHours ?? 5));
  const latestHour = Math.min(23, Math.max(0, Number(options.latestHour ?? 19)));
  const nextDayHour = Math.min(23, Math.max(0, Number(options.nextDayHour ?? 10)));
  const hourMs = 60 * 60 * 1000;
  const earliest = now.getTime() + leadHours * hourMs;
  // 顺丰按整点预约；业务示例要求 12:00 下单落到 18:00，而不是 17:00。
  const candidate = new Date((Math.floor(earliest / hourMs) + 1) * hourMs);
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone:"Asia/Shanghai",
    hour:"2-digit",
    hourCycle:"h23",
  }).format(candidate));
  if (shanghaiDate(candidate) === shanghaiDate(now) && hour < latestHour) return formatShanghai(candidate);

  const [year, month, day] = shanghaiDate(now).split("-").map(Number);
  const nextDayUtc = new Date(Date.UTC(year, month - 1, day + 1, nextDayHour - 8, 0, 0));
  return formatShanghai(nextDayUtc);
}

export function sfConfiguration(env = process.env) {
  const environment = text(env.SF_ENVIRONMENT).toLowerCase() === "production" ? "production" : "sandbox";
  const signatureMode = text(env.SF_SIGNATURE_MODE).toLowerCase() === "url_encoded_md5"
    ? "url_encoded_md5"
    : "simple_md5";
  const monthlyCard = text(env.SF_MONTHLY_CARD) || (environment === "sandbox" ? SANDBOX_MONTHLY_CARD : "");
  const expressTypeId = Number(env.SF_EXPRESS_TYPE_ID || 0);
  const payMethod = Number(env.SF_PAY_METHOD || 1);
  const productName = text(env.SF_EXPRESS_PRODUCT_NAME) || "账号协议产品";
  const liveOrdersAllowed = text(env.SF_ALLOW_LIVE_ORDERS).toLowerCase() === "true";
  const required = [
    ["SF_CLIENT_CODE", "顾客编码"],
    ["SF_CHECK_WORD", "校验码"],
  ];
  const missing = required.filter(([name]) => !text(env[name])).map(([, label]) => label);
  if (!monthlyCard) missing.push("月结卡号");
  if (payMethod !== 1) missing.push("运费付款方式必须为寄方付（1）");
  if (environment === "production" && !(expressTypeId > 0)) missing.push("顺丰小件协议产品编码");
  if (environment === "production" && !liveOrdersAllowed) missing.push("生产下单确认开关");
  return {
    configured:missing.length === 0,
    missing,
    environment,
    liveOrdersAllowed,
    apiBase:text(env.SF_API_BASE) || API_BASES[environment],
    clientCode:text(env.SF_CLIENT_CODE),
    checkWord:text(env.SF_CHECK_WORD),
    monthlyCard,
    expressTypeId:expressTypeId > 0 ? expressTypeId : 0,
    productName,
    payMethod:1,
    signatureMode,
    pickupLeadHours:Number(env.SF_PICKUP_LEAD_HOURS || 5),
    pickupLatestHour:Number(env.SF_PICKUP_LATEST_HOUR || 19),
    nextDayPickupHour:Number(env.SF_NEXT_DAY_PICKUP_HOUR || 10),
  };
}

export function buildSfOrder(request, configuration, now = new Date()) {
  const orderId = text(request.clientReference).slice(0, 64);
  const sender = request.sender || {};
  const receiver = request.receiver || {};
  const parcel = request.parcel || {};
  const order = {
    language:"zh_CN",
    orderId,
    monthlyCard:configuration.monthlyCard,
    payMethod:1,
    parcelQty:Math.max(1, Number(parcel.count || 1)),
    totalWeight:Number(parcel.weightKg),
    cargoDesc:text(parcel.goodsName) || "章牌",
    cargoDetails:[{
      name:text(parcel.goodsName) || "章牌",
      count:Math.max(1, Number(parcel.itemCount || 1)),
      unit:"件",
      weight:Number(parcel.weightKg),
    }],
    contactInfoList:[
      {
        contactType:1,
        contact:text(sender.name),
        mobile:digits(sender.phone),
        country:"CN",
        province:text(sender.province),
        city:text(sender.city),
        county:text(sender.district),
        address:text(sender.address),
      },
      {
        contactType:2,
        contact:text(receiver.name),
        mobile:digits(receiver.phone),
        country:"CN",
        province:text(receiver.province),
        city:text(receiver.city),
        county:text(receiver.district),
        address:text(receiver.address),
      },
    ],
    sendStartTm:nextPickupTime(now, {
      leadHours:configuration.pickupLeadHours,
      latestHour:configuration.pickupLatestHour,
      nextDayHour:configuration.nextDayPickupHour,
    }),
    isDocall:1,
    isGenWaybillNo:1,
    custReferenceNo:text(request.orderNumber || request.clientReference).slice(0, 64),
    remark:text(request.remark).slice(0, 100),
  };
  // 不购买保价或包装服务：不发送 serviceList，也不发送声明价值。
  if (configuration.expressTypeId > 0) order.expressTypeId = configuration.expressTypeId;
  return order;
}

function parseSfEnvelope(payload, actionLabel) {
  if (!payload || payload.apiResultCode !== "A1000") {
    const error = new Error(`顺丰接口拒绝请求：${text(payload?.apiErrorMsg || payload?.apiResultCode || "未知错误")}`);
    error.code = text(payload?.apiResultCode);
    throw error;
  }
  let result;
  try {
    result = typeof payload.apiResultData === "string" ? JSON.parse(payload.apiResultData) : payload.apiResultData;
  } catch {
    throw new Error("顺丰接口返回了无法识别的数据");
  }
  if (!result?.success || result.errorCode !== "S0000") {
    const error = new Error(`顺丰${actionLabel}失败：${text(result?.errorMsg || result?.errorCode || "未知错误")}`);
    error.code = text(result?.errorCode);
    throw error;
  }
  return result.msgData || {};
}

function normalizeSfReceipt(msgData) {
  const waybill = text(msgData.waybillNoInfoList?.find((item) => item?.waybillNo)?.waybillNo);
  return {
    waybill,
    pickupCode:"",
    logisticsOrderId:text(msgData.orderId),
    providerStatus:text(msgData.filterResult),
    originCode:text(msgData.originCode || msgData.origincode),
    destinationCode:text(msgData.destCode || msgData.destcode),
  };
}

async function callSf(serviceCode, msgDataObject, configuration, {fetchImpl = fetch, now = new Date()} = {}) {
  const msgData = JSON.stringify(msgDataObject);
  const timestamp = Math.floor(now.getTime() / 1000);
  const requestID = crypto.randomUUID().replaceAll("-", "");
  const form = new URLSearchParams({
    partnerID:configuration.clientCode,
    requestID,
    serviceCode,
    timestamp:String(timestamp),
    msgDigest:createSfDigest(msgData, timestamp, configuration.checkWord, configuration.signatureMode),
    msgData,
  });
  const response = await fetchImpl(configuration.apiBase, {
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded;charset=UTF-8"},
    body:form.toString(),
    signal:AbortSignal.timeout(30_000),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`顺丰接口连接失败（HTTP ${response.status}）`);
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("顺丰接口返回了非 JSON 数据");
  }
}

function configuredSf(env) {
  const configuration = sfConfiguration(env);
  if (!configuration.configured) {
    throw new Error(`顺丰开放接口尚未配置完整：${configuration.missing.join("、")}`);
  }
  return configuration;
}

export async function createSfOrder(request, {env = process.env, fetchImpl = fetch, now = new Date()} = {}) {
  const configuration = configuredSf(env);
  const payload = await callSf("EXP_RECE_CREATE_ORDER", buildSfOrder(request, configuration, now), configuration, {fetchImpl, now});
  const receipt = normalizeSfReceipt(parseSfEnvelope(payload, "下单"));
  if (!receipt.waybill) throw new Error("顺丰已接收订单，但未返回运单号；请按客户订单号查询后再决定是否重试");
  return receipt;
}

export async function searchSfOrder(orderId, {env = process.env, fetchImpl = fetch, now = new Date()} = {}) {
  const configuration = configuredSf(env);
  const reference = text(orderId).slice(0, 64);
  if (!reference) throw new Error("缺少顺丰客户订单号");
  const payload = await callSf("EXP_RECE_SEARCH_ORDER_RESP", {
    orderId:reference,
    searchType:"1",
    language:"zh_CN",
  }, configuration, {fetchImpl, now});
  return normalizeSfReceipt(parseSfEnvelope(payload, "订单查询"));
}

function parseSfPrintEnvelope(payload) {
  if (!payload || payload.apiResultCode !== "A1000") {
    throw new Error(`顺丰面单接口拒绝请求：${text(payload?.apiErrorMsg || payload?.apiResultCode || "未知错误")}`);
  }
  let result;
  try {
    result = typeof payload.apiResultData === "string" ? JSON.parse(payload.apiResultData) : payload.apiResultData;
  } catch {
    throw new Error("顺丰面单接口返回了无法识别的数据");
  }
  if (!result?.success) throw new Error(`顺丰面单生成失败：${text(result?.errorMsg || result?.message || "未知错误")}`);
  const files = Array.isArray(result?.obj?.files) ? result.obj.files : [];
  if (!files.some((file) => text(file?.url))) throw new Error("顺丰面单生成成功，但未返回 PDF 文件地址");
  return {
    requestId:text(result.requestId),
    templateCode:text(result?.obj?.templateCode),
    files:files.map((file) => ({
      waybill:text(file?.waybillNo),
      url:text(file?.url),
      token:text(file?.token),
      pageNo:Number(file?.pageNo || 0),
      pageCount:Number(file?.pageCount || 0),
    })),
  };
}

export async function cancelSfOrder(orderId, {env = process.env, fetchImpl = fetch, now = new Date()} = {}) {
  const configuration = configuredSf(env);
  const reference = text(orderId).slice(0, 64);
  if (!reference) throw new Error("缺少顺丰客户订单号");
  const payload = await callSf("EXP_RECE_UPDATE_ORDER", {
    dealType:2,
    language:"zh-CN",
    orderId:reference,
    totalWeight:1,
    waybillNoInfoList:[],
  }, configuration, {fetchImpl, now});
  return {
    ...normalizeSfReceipt(parseSfEnvelope(payload, "取消订单")),
    cancelled:true,
  };
}

export async function createSfWaybillPdf(waybill, {env = process.env, fetchImpl = fetch, now = new Date()} = {}) {
  const configuration = configuredSf(env);
  const number = text(waybill).slice(0, 32);
  if (!number) throw new Error("缺少顺丰运单号");
  const payload = await callSf("COM_RECE_CLOUD_PRINT_WAYBILLS", {
    templateCode:`fm_210_standard_${configuration.clientCode}`,
    version:"2.0",
    fileType:"pdf",
    sync:true,
    documents:[{masterWaybillNo:number}],
  }, configuration, {fetchImpl, now});
  return parseSfPrintEnvelope(payload);
}

export async function findSfOrder(orderId, options = {}) {
  try {
    return await searchSfOrder(orderId, options);
  } catch (error) {
    const message = text(error?.message);
    const isMissingOrder = /(?:未下单|未找到|找不到|不存在|无此订单|查询不到|没有查询到)/.test(message);
    if (isMissingOrder) return null;
    throw error;
  }
}
