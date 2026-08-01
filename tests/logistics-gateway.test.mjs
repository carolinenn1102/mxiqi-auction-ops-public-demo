import assert from "node:assert/strict";
import test, {after, before} from "node:test";
import {createServer} from "../logistics-gateway/server.mjs";

let server;
let baseUrl;
const previousOperatorKey = process.env.LOGISTICS_OPERATOR_KEY;

before(async () => {
  process.env.LOGISTICS_OPERATOR_KEY = "test-operator-key";
  server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  if (previousOperatorKey === undefined) delete process.env.LOGISTICS_OPERATOR_KEY;
  else process.env.LOGISTICS_OPERATOR_KEY = previousOperatorKey;
});

const order = {
  carrier:"cainiao",
  clientReference:"ORDER-001",
  sender:{name:"寄件人",phone:"15200000000",address:"北京市朝阳区测试路1号"},
  receiver:{name:"收件人",phone:"13800000000",address:"上海市浦东新区测试路2号"},
  parcel:{weightKg:0.8,goodsName:"章牌",lots:[1]},
};

test("health reports provider readiness without exposing credentials", async () => {
  const response = await fetch(`${baseUrl}/api/logistics/health`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.online, true);
  assert.ok(payload.capabilities.includes("queryLogisticsOrder"));
  assert.equal(payload.providers.cainiao.configured, false);
  assert.equal(payload.providers.sf.environment, "sandbox");
  assert.equal("operatorKey" in payload, false);
  assert.equal(JSON.stringify(payload).includes("test-operator-key"), false);
});

test("order query also requires operator authorization", async () => {
  const response = await fetch(`${baseUrl}/api/logistics/orders/ORDER-001`);
  assert.equal(response.status, 401);
});

test("order submission requires the short-lived operator authorization", async () => {
  const response = await fetch(`${baseUrl}/api/logistics/orders`, {
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({request:order}),
  });
  assert.equal(response.status, 401);
});

test("an unconfigured carrier is refused instead of returning a demo waybill", async () => {
  const response = await fetch(`${baseUrl}/api/logistics/orders`, {
    method:"POST",
    headers:{
      "content-type":"application/json",
      "x-logistics-operator-key":"test-operator-key",
      "x-idempotency-key":"ORDER-001",
    },
    body:JSON.stringify({request:order}),
  });
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.equal(payload.ok, false);
  assert.match(payload.error, /菜鸟开放平台应用/);
});
