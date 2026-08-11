import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-sync-shipping-orders-regression.mjs <url> <node_modules>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";
const connectionKey = "mxiqi-public-demo-connection-v1";
const collectorKey = "mxiqi-public-demo-collector-v1";

try {
  const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:"block"});
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("**/connector-bridge.js*", async (route) => {
    await route.fulfill({
      contentType:"application/javascript; charset=utf-8",
      body:`
        globalThis.__shippingSyncRequests = [];
        globalThis.MxiqiConnector = Object.freeze({
          ping:async () => ({ok:true,loggedIn:true,version:"1.9.3",capabilities:["syncOrders","syncAuctionDeals"]}),
          syncOrders:async ({scope,maxPages}) => {
            globalThis.__shippingSyncRequests.push({scope,maxPages});
            return {
              requiresLogin:false,pages:1,totalPages:1,
              records:[{
                platformItemKey:"shipping-order-a:7:0",mxiqiOrderId:"shipping-order-a",source:"mxiqi_connector",
                lot:7,itemName:"待发货同步测试拍品",auctionPeriodOverride:"第79期",auctionAt:"2026-08-10",
                finalOutcome:"成交",finalPrice:680,paymentStatus:"已付款",buyerName:"最新买家",buyerPhone:"13912345678",
                recipientRaw:"收件人甲 13912345678 上海市浦东新区测试路7号",recipientName:"收件人甲",recipientPhone:"13912345678",
                addressStatus:"pending_review",mxiqiShippingStatus:"pending",mxiqiOrderStatus:"待发货"
              }]
            };
          },
          syncAuctionDeals:async () => ({requiresLogin:false,records:[]})
        });
      `,
    });
  });
  await page.addInitScript(({recordsKey,connectionKey,collectorKey}) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(connectionKey, JSON.stringify({
      status:"connected",mode:"connector",connectorInstalled:true,connectorVersion:"1.9.3",
      connectorCapabilities:["syncOrders","syncAuctionDeals"],label:"测试商家账号"
    }));
    localStorage.setItem(collectorKey, JSON.stringify({scope:"waitpay",intervalSeconds:60,idleMinutes:10}));
    localStorage.setItem(recordsKey, JSON.stringify([
      {
        id:"local-shipping-a",platformItemKey:"shipping-order-a:7:0",mxiqiOrderId:"shipping-order-a",source:"mxiqi_connector",
        lot:7,itemName:"待发货同步测试拍品",sellerWechat:"原送拍人",sellerPhone:"13800000001",
        auctionPeriodOverride:"第79期",auctionAt:"2026-08-10",finalOutcome:"成交",finalPrice:680,paymentStatus:"已付款",
        buyerName:"旧买家",buyerPhone:"13700000001",mxiqiShippingStatus:"pending",settled:false
      },
      {
        id:"local-shipping-departed",platformItemKey:"shipping-order-b:8:0",mxiqiOrderId:"shipping-order-b",source:"mxiqi_connector",
        lot:8,itemName:"已离开待发货测试拍品",sellerWechat:"第二送拍人",auctionPeriodOverride:"第79期",auctionAt:"2026-08-10",
        finalOutcome:"成交",finalPrice:820,paymentStatus:"已付款",buyerName:"买家乙",buyerPhone:"13600000001",
        mxiqiShippingStatus:"pending",settled:false
      }
    ]));
  }, {recordsKey,connectionKey,collectorKey});

  await page.goto(siteUrl, {waitUntil:"networkidle"});
  const button = page.locator("#sync-shipping-orders");
  await assert.doesNotReject(() => button.waitFor({state:"visible",timeout:10000}));
  assert.equal(await button.isEnabled(), true);
  await button.click();
  await page.waitForFunction((recordsKey) => {
    const records = JSON.parse(localStorage.getItem(recordsKey) || "[]");
    return records.find((record) => record.id === "local-shipping-a")?.buyerName === "最新买家"
      && records.find((record) => record.id === "local-shipping-departed")?.mxiqiShippingStatus === "filled";
  }, recordsKey, {timeout:15000});

  const result = await page.evaluate((recordsKey) => ({
    records:JSON.parse(localStorage.getItem(recordsKey) || "[]"),
    requests:globalThis.__shippingSyncRequests,
    shippingSelected:document.querySelector('[data-stage="shipping"]')?.classList.contains("selected"),
    resultText:JSON.parse(localStorage.getItem("mxiqi-public-demo-collector-v1") || "{}").lastResult || "",
    audit:JSON.parse(localStorage.getItem("mxiqi-public-demo-audit-v1") || "[]"),
  }), recordsKey);

  assert.deepEqual(result.requests, [{scope:"waitexpress",maxPages:20}], "top button must ignore the collector's wait-pay selection");
  assert.equal(result.records.length, 2, "sync must merge rather than duplicate existing auction lots");
  const updated = result.records.find((record) => record.id === "local-shipping-a");
  const departed = result.records.find((record) => record.id === "local-shipping-departed");
  assert.equal(updated.sellerWechat, "原送拍人");
  assert.equal(updated.buyerName, "最新买家");
  assert.equal(updated.recipientName, "收件人甲");
  assert.equal(updated.recipientRaw, "收件人甲 13912345678 上海市浦东新区测试路7号");
  assert.equal(updated.mxiqiShippingStatus, "pending");
  assert.ok(updated.mxiqiSeenScopes.includes("waitexpress"));
  assert.equal(departed.mxiqiShippingStatus, "filled");
  assert.equal(departed.mxiqiOrderStatus, "已离开待发货");
  assert.equal(result.shippingSelected, true);
  assert.match(result.resultText, /真实同步完成：读取 1 页、1 件拍品，新增 0 条，更新 1 条，退出原状态 1 条/);
  assert.ok(result.audit.some((entry) => entry.action === "同步麦稀奇待发货"));
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({ok:true,scope:"waitexpress",maxPages:20,updated:1,departed:1,deduplicated:true,openedShippingReview:true}));
} finally {
  await browser.close();
}
