import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-operational-actions-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true});

try {
  const context = await browser.newContext({viewport:{width:1600,height:1100},serviceWorkers:"block",acceptDownloads:true});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem("mxiqi-public-demo-customers-v2", JSON.stringify({
      "测试送拍人":{phone:"13812345678",birthdayMonth:0},
      "其他送拍人":{phone:"13912345678",birthdayMonth:8},
    }));
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([
      {id:"low-missing",lot:1,itemName:"低价成交拍品",sellerWechat:"",sellerPhone:"",auctionAt:"2026-08-08 20:00",auctionPeriodOverride:"第80期",finalOutcome:"成交",finalPrice:4,paymentStatus:"已付款",buyerName:"买家甲",buyerPhone:"13612345678",recipientRaw:"买家甲 13612345678 上海市浦东新区世纪大道100号",recipientName:"买家甲",recipientPhone:"13612345678",addressProvince:"上海市",addressCity:"上海市",addressDistrict:"浦东新区",addressDetail:"世纪大道100号",addressStatus:"reviewed",mxiqiOrderId:"order-80"},
      {id:"seller-paid",lot:2,itemName:"正常成交拍品",sellerWechat:"测试送拍人",sellerPhone:"13812345678",auctionAt:"2026-08-08 20:00",auctionPeriodOverride:"第80期",finalOutcome:"成交",finalPrice:200,paymentStatus:"已付款",buyerName:"买家甲",buyerPhone:"13612345678",recipientRaw:"买家甲 13612345678 上海市浦东新区世纪大道100号",recipientName:"买家甲",recipientPhone:"13612345678",addressProvince:"上海市",addressCity:"上海市",addressDistrict:"浦东新区",addressDetail:"世纪大道100号",addressStatus:"reviewed",mxiqiOrderId:"order-80"},
      {id:"blocked-shipping",lot:3,itemName:"未付款拍品",sellerWechat:"其他送拍人",sellerPhone:"13912345678",auctionAt:"2026-08-10 20:00",auctionPeriodOverride:"第81期",finalOutcome:"成交",finalPrice:300,paymentStatus:"待付款",buyerName:"买家乙",buyerPhone:"13712345678"},
      {id:"preauction",lot:4,itemName:"拍前核对日期拍品",sellerWechat:"测试送拍人",sellerPhone:"13812345678",auctionAt:"2026-08-09 20:00",auctionPeriodOverride:"第80期",finalOutcome:"待拍",finalPrice:0},
    ]));
    localStorage.setItem("mxiqi-public-demo-assets-v1", JSON.stringify([]));
    localStorage.setItem("mxiqi-public-demo-history-v1", JSON.stringify([{id:"legacy-heavy",time:"2026-08-07T10:00:00.000Z",action:"旧版记录",detail:"旧版超大撤回记录",pending:false,before:{records:[]},afterFingerprint:"x".repeat(2500000)}]));
    globalThis.__checklistText = [];
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      globalThis.__checklistText.push(String(text));
      return originalFillText.call(this, text, ...args);
    };
    HTMLCanvasElement.prototype.toBlob = function (callback) { callback(new Blob(["checklist"], {type:"image/png"})); };
    HTMLAnchorElement.prototype.click = function () {};
  });
  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});

  await page.click("#open-assets");
  assert.equal(await page.locator("#asset-dialog").getAttribute("open"), "");
  await page.click("#asset-dialog [data-close-dialog]");
  await page.click("#open-customers");
  assert.equal(await page.locator("#customer-dialog").getAttribute("open"), "");
  await page.click("#customer-dialog [data-close-dialog]");

  await page.click('[data-stage="settlement"]');
  await page.selectOption("#filter-auction", "第80期");
  const sellerSelect = page.locator("select[data-settlement-seller-assign]");
  assert.equal(await sellerSelect.count(), 1);
  await sellerSelect.selectOption("phone:13812345678");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").find((record) => record.id === "low-missing")?.sellerWechat === "测试送拍人");

  const settleStartedAt = Date.now();
  await page.locator("button[data-settlement-settle]").click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").filter((record) => ["low-missing","seller-paid"].includes(record.id)).every((record) => record.settled));
  assert.ok(Date.now() - settleStartedAt < 2500, "整组结账应在 2.5 秒内完成");
  let records = await page.evaluate(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]"));
  const low = records.find((record) => record.id === "low-missing");
  assert.equal(low.commissionAmount, 5);
  assert.equal(low.settlementAmount, -1);

  await page.click('[data-stage="all"]');
  await page.selectOption("#filter-auction", "");
  const blockedRow = page.locator("tr", {hasText:"未付款拍品"});
  await blockedRow.getByRole("button", {name:"发货"}).click();
  assert.match(await page.locator("#toast").innerText(), /尚未付款/);

  await page.click('[data-stage="shipping"]');
  const packageShipping = page.locator("[data-package-shipping]").first();
  assert.equal(await packageShipping.count(), 1);
  await packageShipping.click();
  assert.equal(await page.locator("#shipping-dialog").getAttribute("open"), "");
  await page.fill('[name="outboundTrackingNumber"]', "SF1234567890");
  await page.fill('[name="pickupCode"]', "PICK-80");
  assert.equal(await page.locator("#shipping-save-result").isEnabled(), true);
  await page.click("#shipping-save-result");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").find((record) => record.id === "seller-paid")?.outboundTrackingNumber === "SF1234567890");
  await page.click("#shipping-dialog [data-close-dialog]");

  await page.click("#open-preauction-check");
  await page.selectOption("#filter-auction", "第80期");
  await page.click("#export-preauction-image");
  await page.waitForFunction(() => globalThis.__checklistText.includes("2026-08-09"));
  const checklistText = await page.evaluate(() => globalThis.__checklistText);
  assert.ok(checklistText.includes("拍卖日期"));
  assert.ok(checklistText.includes("2026-08-09"));

  records = await page.evaluate(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]"));
  const storedHistory = await page.evaluate(() => localStorage.getItem("mxiqi-public-demo-history-v1") || "");
  assert.ok(storedHistory.length < 800000, `历史记录仍过大：${storedHistory.length}`);
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({
    ok:true,
    menusOpened:true,
    settlementSellerAssigned:true,
    groupSettlementMs:Date.now() - settleStartedAt,
    negativeSettlement:low.settlementAmount,
    blockedShippingExplained:true,
    manualShippingSaved:records.find((record) => record.id === "seller-paid")?.outboundTrackingNumber,
    checklistDate:"2026-08-09",
    historyChars:storedHistory.length,
  }));
} finally {
  await browser.close();
}
