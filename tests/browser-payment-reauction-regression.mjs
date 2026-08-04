import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-payment-reauction-regression.mjs <url> <node_modules>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const { chromium } = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";
const assetsKey = "mxiqi-public-demo-assets-v1";

try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(siteUrl, {waitUntil:"networkidle"});

  await page.evaluate(({recordsKey, assetsKey}) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "16");
    localStorage.setItem(recordsKey, JSON.stringify([{
      id:"cancelled-order",
      lot:19,
      itemName:"取消订单后手工确认付款",
      projectName:"麦稀奇第77期",
      auctionPeriodOverride:"第77期",
      auctionAt:"2026-08-04 20:00",
      sellerWechat:"测试送拍人",
      sellerPhone:"13900000001",
      received:"是",
      finalOutcome:"成交",
      finalPrice:1428,
      paymentStatus:"待付款",
      paymentDueAt:"2026-08-04T20:00",
      unpaidReturn:true,
      unpaidReturnDetectedAt:"2026-08-04T21:00:00.000Z",
      returnDisposition:"拖回/等待",
      settled:false,
    }]));
    localStorage.setItem(assetsKey, "[]");
  }, {recordsKey, assetsKey});
  await page.reload({waitUntil:"networkidle"});

  await page.click('[data-action="edit"][data-id="cancelled-order"]');
  await page.selectOption('#edit-form select[name="paymentStatus"]', "已付款");
  await page.selectOption('#edit-form select[name="returnDisposition"]', "");
  await page.click("#save-record");
  let state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]")[0], recordsKey);
  assert.equal(state.paymentStatus, "已付款");
  assert.equal(state.paymentStatusManual, true);
  assert.equal(state.unpaidReturn, false);
  assert.equal(state.returnDisposition, "");
  assert.equal(state.paymentDueAt, "");

  await page.selectOption("#filter-auction", "第77期");
  await page.click('[data-action="toggle-settle"][data-id="cancelled-order"]');
  state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]")[0], recordsKey);
  assert.equal(state.settled, true, "manual paid normal flow should settle successfully");

  await page.evaluate(({recordsKey, assetsKey}) => {
    localStorage.setItem(recordsKey, JSON.stringify([{
      id:"reauction-source",
      lot:13,
      itemName:"NGC—MS63B 日本明治16年一厘铜元，近代东洋机制钱币珍稀小品",
      projectName:"麦稀奇第77期",
      auctionPeriodOverride:"第77期",
      auctionAt:"2026-08-01 20:00",
      sellerWechat:"测试送拍人",
      sellerPhone:"13900000001",
      finalOutcome:"拖回",
      finalPrice:800,
      paymentStatus:"已付款",
      returnDisposition:"拖回/再拍",
      settled:true,
    }]));
    localStorage.setItem(assetsKey, JSON.stringify([
      {id:"asset-first",assetKey:"asset-first",assetType:"consignment",buyerName:"Z先入",buyerPhone:"13900000002",itemName:"先入寄存",matchStatus:"unmatched",storageOrder:1,importedAt:"2026-08-01T10:00:00.000Z"},
      {id:"asset-second",assetKey:"asset-second",assetType:"consignment",buyerName:"A后入",buyerPhone:"13900000003",itemName:"后入寄存",matchStatus:"unmatched",storageOrder:2,importedAt:"2026-08-01T11:00:00.000Z"},
    ]));
  }, {recordsKey, assetsKey});
  await page.reload({waitUntil:"networkidle"});

  await page.click("#open-assets");
  const buyerOrder = await page.locator("#asset-body .asset-group-row .asset-buyer-cell b").allTextContents();
  assert.deepEqual(buyerOrder, ["Z先入", "A后入"]);
  await page.click('#asset-dialog [data-close-dialog]');

  await page.click("#open-import");
  await page.fill("#json-input", JSON.stringify([{
    lot:19,
    itemName:"NGC MS63 日本明治16年一厘铜元",
    projectName:"麦稀奇第78期",
    auctionPeriodOverride:"第78期",
    auctionAt:"2026-08-05 20:00",
    finalOutcome:"待拍",
  }]));
  await page.click("#run-import");
  await page.waitForFunction(() => !document.querySelector("#import-dialog")?.open);
  const matchedState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), recordsKey);
  assert.equal(matchedState.length, 1);
  assert.equal(matchedState[0].id, "reauction-source");
  assert.equal(matchedState[0].lot, 19);
  assert.equal(matchedState[0].returnDisposition, "");
  assert.equal(matchedState[0].finalOutcome, "待拍");
  assert.ok(matchedState[0].reauctionMatchedAt);
  assert.match(await page.locator(".reauction-match-note").innerText(), /再拍库匹配/);

  await page.click('[data-action="edit"][data-id="reauction-source"]');
  await page.selectOption('#edit-form select[name="returnDisposition"]', "拖回/再拍");
  await page.click("#save-record");
  const returnedState = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]")[0], recordsKey);
  assert.equal(returnedState.returnDisposition, "拖回/再拍");
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    manualPaymentSettled:true,
    inventorySortedByStorageOrder:true,
    reauctionMatchedAndReturned:true,
  }));
} finally {
  await browser.close();
}
