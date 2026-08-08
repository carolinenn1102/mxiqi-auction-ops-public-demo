(() => {
  "use strict";

  const DEFAULT_TIMEOUT = 35_000;

  function normalizedBase(value = "") {
    const input = String(value || "").trim();
    return input ? input.replace(/\/+$/, "") : "";
  }

  function endpoint(baseUrl, path) {
    const base = normalizedBase(baseUrl);
    return base ? `${base}${path}` : path;
  }

  async function requestJson(url, options = {}, timeoutMs = DEFAULT_TIMEOUT) {
    const response = await fetch(url, {...options, signal:AbortSignal.timeout(timeoutMs)});
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      throw new Error(`物流网关返回异常（HTTP ${response.status}）`);
    }
    if (!response.ok || payload.ok === false) throw new Error(payload.error || `物流网关请求失败（HTTP ${response.status}）`);
    return payload;
  }

  async function health({baseUrl = ""} = {}) {
    return requestJson(endpoint(baseUrl, "/api/logistics/health"), {method:"GET"}, 10_000);
  }

  async function createOrder({baseUrl = "", operatorKey = "", request} = {}) {
    const idempotencyKey = [request?.carrier, request?.clientReference, ...(request?.parcel?.lots || [])].join("|");
    return requestJson(endpoint(baseUrl, "/api/logistics/orders"), {
      method:"POST",
      headers:{
        "content-type":"application/json",
        "x-logistics-operator-key":String(operatorKey || "").trim(),
        "x-idempotency-key":idempotencyKey,
      },
      body:JSON.stringify({request}),
    }, 45_000);
  }

  async function queryOrder({baseUrl = "", operatorKey = "", logisticsOrderId = ""} = {}) {
    const orderId = String(logisticsOrderId || "").trim();
    if (!orderId) throw new Error("缺少顺丰客户订单号");
    return requestJson(endpoint(baseUrl, `/api/logistics/orders/${encodeURIComponent(orderId)}`), {
      method:"GET",
      headers:{"x-logistics-operator-key":String(operatorKey || "").trim()},
    }, 35_000);
  }

  async function cancelOrder({baseUrl = "", operatorKey = "", logisticsOrderId = ""} = {}) {
    const orderId = String(logisticsOrderId || "").trim();
    if (!orderId) throw new Error("缺少顺丰客户订单号");
    return requestJson(endpoint(baseUrl, `/api/logistics/orders/${encodeURIComponent(orderId)}`), {
      method:"DELETE",
      headers:{"x-logistics-operator-key":String(operatorKey || "").trim()},
    }, 35_000);
  }

  async function createWaybillPdf({baseUrl = "", operatorKey = "", waybill = ""} = {}) {
    const number = String(waybill || "").trim();
    if (!number) throw new Error("缺少顺丰运单号");
    return requestJson(endpoint(baseUrl, "/api/logistics/labels"), {
      method:"POST",
      headers:{
        "content-type":"application/json",
        "x-logistics-operator-key":String(operatorKey || "").trim(),
      },
      body:JSON.stringify({waybill:number}),
    }, 45_000);
  }

  globalThis.MxiqiLogisticsGateway = Object.freeze({health,createOrder,queryOrder,cancelOrder,createWaybillPdf});
})();
