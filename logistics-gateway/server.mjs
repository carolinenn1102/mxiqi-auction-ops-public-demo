import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import http from "node:http";
import {cancelSfOrder, createSfOrder, createSfWaybillPdf, findSfOrder, searchSfOrder, sfConfiguration} from "./sf-adapter.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(process.env.PUBLIC_ROOT || path.join(HERE, ".."));
const DATA_ROOT = path.resolve(process.env.LOGISTICS_DATA_DIR || path.join(HERE, "data"));
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || "0.0.0.0";
const MAX_BODY_BYTES = 128 * 1024;
const activeOrders = new Map();
const requestWindows = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;

function text(value) {
  return String(value ?? "").trim();
}

function json(response, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "content-type":"application/json; charset=utf-8",
    "content-length":Buffer.byteLength(body),
    "cache-control":"no-store",
    ...headers,
  });
  response.end(body);
}

function safeEqual(left, right) {
  const a = Buffer.from(text(left));
  const b = Buffer.from(text(right));
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

function clientAddress(request) {
  const forwarded = text(request.headers["x-forwarded-for"]).split(",")[0].trim();
  return forwarded || text(request.socket?.remoteAddress) || "unknown";
}

function exceedsRateLimit(request) {
  const key = clientAddress(request);
  const now = Date.now();
  const current = requestWindows.get(key);
  const next = !current || current.resetAt <= now
    ? {count:1, resetAt:now + RATE_WINDOW_MS}
    : {count:current.count + 1, resetAt:current.resetAt};
  requestWindows.set(key, next);
  if (requestWindows.size > 1000) {
    for (const [address, value] of requestWindows) {
      if (value.resetAt <= now) requestWindows.delete(address);
    }
  }
  return next.count > RATE_LIMIT;
}

function providerStatus() {
  const sf = sfConfiguration(process.env);
  return {
    sf:{
      configured:sf.configured,
      environment:sf.environment,
      reason:sf.configured
        ? `顺丰${sf.environment === "production" ? "生产" : "沙箱"}接口已配置`
        : `还缺：${sf.missing.join("、")}`,
    },
    cainiao:{
      configured:false,
      reason:"菜鸟开放平台应用的正式 AppKey、AppSecret 和商家寄件接口权限尚未提供",
    },
  };
}

function allowedOrigin(request) {
  const origin = text(request.headers.origin);
  if (!origin) return "";
  const allowed = text(process.env.ALLOWED_ORIGINS)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return allowed.includes(origin) ? origin : "";
}

function corsHeaders(request) {
  const origin = allowedOrigin(request);
  return origin ? {
    "access-control-allow-origin":origin,
    "access-control-allow-headers":"content-type,x-logistics-operator-key,x-idempotency-key",
    "access-control-allow-methods":"GET,POST,DELETE,OPTIONS",
    vary:"Origin",
  } : {};
}

async function readJson(request) {
  let size = 0;
  const chunks = [];
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error("请求内容过大");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
  } catch {
    throw new Error("请求内容不是有效 JSON");
  }
}

function validateOrderRequest(request = {}) {
  const missing = [];
  if (!["sf", "cainiao"].includes(request.carrier)) missing.push("承运商");
  if (!text(request.clientReference)) missing.push("业务单号");
  if (!text(request.sender?.name)) missing.push("寄件人");
  if (!/^1[3-9]\d{9}$/.test(text(request.sender?.phone).replace(/\D/g, ""))) missing.push("寄件手机号");
  if (!text(request.sender?.address)) missing.push("寄件地址");
  if (!text(request.receiver?.name)) missing.push("收件人");
  if (!/^1[3-9]\d{9}$/.test(text(request.receiver?.phone).replace(/\D/g, ""))) missing.push("收件手机号");
  if (!text(request.receiver?.address)) missing.push("收件地址");
  if (!(Number(request.parcel?.weightKg) > 0)) missing.push("包裹重量");
  if (!text(request.parcel?.goodsName)) missing.push("物品名称");
  return missing;
}

function orderKey(request, suppliedKey = "") {
  const raw = text(suppliedKey) || JSON.stringify({
    carrier:request.carrier,
    reference:request.clientReference,
    receiver:text(request.receiver?.phone),
    lots:Array.isArray(request.parcel?.lots) ? [...request.parcel.lots].sort() : [],
  });
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function orderFile(key) {
  return path.join(DATA_ROOT, "orders", `${key}.json`);
}

function readStoredOrder(key) {
  try {
    return JSON.parse(fs.readFileSync(orderFile(key), "utf8"));
  } catch {
    return null;
  }
}

function storeOrder(key, value) {
  const directory = path.dirname(orderFile(key));
  fs.mkdirSync(directory, {recursive:true, mode:0o700});
  const temporary = `${orderFile(key)}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value), {encoding:"utf8", mode:0o600});
  fs.renameSync(temporary, orderFile(key));
}

async function submitOrder(request, key) {
  const existing = readStoredOrder(key);
  if (existing) return {...existing, replayed:true};
  if (request.carrier === "sf") {
    const remote = await findSfOrder(request.clientReference);
    if (remote?.waybill) {
      const reconciled = {
        ...remote,
        carrier:"sf",
        createdAt:new Date().toISOString(),
        replayed:true,
        reconciled:true,
      };
      storeOrder(key, reconciled);
      return reconciled;
    }
    const receipt = await createSfOrder(request);
    const result = {...receipt, carrier:"sf", createdAt:new Date().toISOString(), replayed:false};
    storeOrder(key, result);
    return result;
  }
  throw new Error("菜鸟正式寄件接口尚未完成应用授权，当前不会提交模拟订单");
}

async function handleCreate(request, response) {
  const headers = corsHeaders(request);
  if (exceedsRateLimit(request)) {
    return json(response, 429, {ok:false,error:"操作过于频繁，请稍后重试"}, {...headers,"retry-after":"60"});
  }
  if (!safeEqual(request.headers["x-logistics-operator-key"], process.env.LOGISTICS_OPERATOR_KEY)) {
    return json(response, 401, {ok:false,error:"物流操作授权码无效"}, headers);
  }
  let payload;
  try {
    payload = await readJson(request);
  } catch (error) {
    return json(response, 400, {ok:false,error:error.message}, headers);
  }
  const orderRequest = payload.request || payload;
  const missing = validateOrderRequest(orderRequest);
  if (missing.length) return json(response, 400, {ok:false,error:`真实下单资料不完整：${missing.join("、")}`}, headers);
  const provider = providerStatus()[orderRequest.carrier];
  if (!provider?.configured) return json(response, 503, {ok:false,error:provider?.reason || "承运商接口未配置"}, headers);

  const key = orderKey(orderRequest, request.headers["x-idempotency-key"]);
  try {
    if (!activeOrders.has(key)) {
      activeOrders.set(key, submitOrder(orderRequest, key).finally(() => activeOrders.delete(key)));
    }
    const result = await activeOrders.get(key);
    return json(response, 200, {ok:true,...result}, headers);
  } catch (error) {
    return json(response, 502, {ok:false,error:text(error.message) || "物流平台下单失败"}, headers);
  }
}

async function handleSearch(request, response, orderId) {
  const headers = corsHeaders(request);
  if (exceedsRateLimit(request)) {
    return json(response, 429, {ok:false,error:"操作过于频繁，请稍后重试"}, {...headers,"retry-after":"60"});
  }
  if (!safeEqual(request.headers["x-logistics-operator-key"], process.env.LOGISTICS_OPERATOR_KEY)) {
    return json(response, 401, {ok:false,error:"物流操作授权码无效"}, headers);
  }
  const provider = providerStatus().sf;
  if (!provider.configured) return json(response, 503, {ok:false,error:provider.reason}, headers);
  try {
    const result = await searchSfOrder(orderId);
    return json(response, 200, {ok:true,carrier:"sf",...result}, headers);
  } catch (error) {
    return json(response, 502, {ok:false,error:text(error.message) || "顺丰订单查询失败"}, headers);
  }
}

async function handleCancel(request, response, orderId) {
  const headers = corsHeaders(request);
  if (exceedsRateLimit(request)) {
    return json(response, 429, {ok:false,error:"操作过于频繁，请稍后重试"}, {...headers,"retry-after":"60"});
  }
  if (!safeEqual(request.headers["x-logistics-operator-key"], process.env.LOGISTICS_OPERATOR_KEY)) {
    return json(response, 401, {ok:false,error:"物流操作授权码无效"}, headers);
  }
  const provider = providerStatus().sf;
  if (!provider.configured) return json(response, 503, {ok:false,error:provider.reason}, headers);
  try {
    const result = await cancelSfOrder(orderId);
    return json(response, 200, {ok:true,carrier:"sf",...result}, headers);
  } catch (error) {
    return json(response, 502, {ok:false,error:text(error.message) || "顺丰订单取消失败"}, headers);
  }
}

async function handleCreateLabel(request, response) {
  const headers = corsHeaders(request);
  if (exceedsRateLimit(request)) {
    return json(response, 429, {ok:false,error:"操作过于频繁，请稍后重试"}, {...headers,"retry-after":"60"});
  }
  if (!safeEqual(request.headers["x-logistics-operator-key"], process.env.LOGISTICS_OPERATOR_KEY)) {
    return json(response, 401, {ok:false,error:"物流操作授权码无效"}, headers);
  }
  const provider = providerStatus().sf;
  if (!provider.configured) return json(response, 503, {ok:false,error:provider.reason}, headers);
  let payload;
  try {
    payload = await readJson(request);
  } catch (error) {
    return json(response, 400, {ok:false,error:error.message}, headers);
  }
  const waybill = text(payload.waybill);
  if (!waybill) return json(response, 400, {ok:false,error:"缺少顺丰运单号"}, headers);
  try {
    const result = await createSfWaybillPdf(waybill);
    return json(response, 200, {ok:true,carrier:"sf",...result}, headers);
  } catch (error) {
    return json(response, 502, {ok:false,error:text(error.message) || "顺丰面单生成失败"}, headers);
  }
}

const CONTENT_TYPES = {
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".webmanifest":"application/manifest+json; charset=utf-8",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".png":"image/png",
  ".svg":"image/svg+xml",
  ".zip":"application/zip",
};

function isPrivateStaticPath(relative) {
  const segments = relative.split(/[\\/]+/).filter(Boolean);
  return segments.some((segment) => segment.startsWith("."))
    || ["logistics-gateway", "tests"].includes(segments[0]);
}

function serveStatic(request, response, pathname) {
  const relative = pathname === "/" ? "index.html" : decodeURIComponent(pathname).replace(/^\/+/, "");
  if (isPrivateStaticPath(relative)) {
    response.writeHead(404, {"content-type":"text/plain; charset=utf-8"});
    response.end("Not Found");
    return;
  }
  const target = path.resolve(PUBLIC_ROOT, relative);
  if (target !== PUBLIC_ROOT && !target.startsWith(`${PUBLIC_ROOT}${path.sep}`)) {
    response.writeHead(403);
    response.end();
    return;
  }
  let file = target;
  try {
    if (fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    const body = fs.readFileSync(file);
    response.writeHead(200, {
      "content-type":CONTENT_TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
      "content-length":body.length,
      "x-content-type-options":"nosniff",
      "referrer-policy":"same-origin",
      "permissions-policy":"camera=(), microphone=(), geolocation=()",
      "content-security-policy":"default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      "x-frame-options":"DENY",
    });
    response.end(body);
  } catch {
    response.writeHead(404, {"content-type":"text/plain; charset=utf-8"});
    response.end("Not Found");
  }
}

export function createServer() {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", "http://localhost");
    if (request.method === "OPTIONS") {
      response.writeHead(204, corsHeaders(request));
      response.end();
      return;
    }
    if (url.pathname === "/api/logistics/health" && request.method === "GET") {
      return json(response, 200, {
        ok:true,
        online:true,
        version:"1.1.0",
        capabilities:["createLogisticsOrder","queryLogisticsOrder","cancelLogisticsOrder","createWaybillPdf"],
        providers:providerStatus(),
      }, corsHeaders(request));
    }
    if (url.pathname === "/api/logistics/orders" && request.method === "POST") {
      return handleCreate(request, response);
    }
    if (url.pathname === "/api/logistics/labels" && request.method === "POST") {
      return handleCreateLabel(request, response);
    }
    const orderSearch = url.pathname.match(/^\/api\/logistics\/orders\/([^/]+)$/);
    if (orderSearch && request.method === "GET") {
      return handleSearch(request, response, decodeURIComponent(orderSearch[1]));
    }
    if (orderSearch && request.method === "DELETE") {
      return handleCancel(request, response, decodeURIComponent(orderSearch[1]));
    }
    if (url.pathname.startsWith("/api/")) return json(response, 404, {ok:false,error:"接口不存在"}, corsHeaders(request));
    return serveStatic(request, response, url.pathname);
  });
}

function realPath(value) {
  try {
    return fs.realpathSync.native(path.resolve(value));
  } catch {
    return path.resolve(value);
  }
}

if (process.argv[1] && realPath(process.argv[1]) === realPath(fileURLToPath(import.meta.url))) {
  if (!text(process.env.LOGISTICS_OPERATOR_KEY)) {
    console.error("LOGISTICS_OPERATOR_KEY is required");
    process.exit(1);
  }
  createServer().listen(PORT, HOST, () => {
    console.log(`mxiqi logistics gateway listening on ${HOST}:${PORT}`);
  });
}
