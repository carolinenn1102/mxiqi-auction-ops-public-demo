import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-current-storage-inventory-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";
const assetsKey = "mxiqi-public-demo-assets-v1";

try {
  const context = await browser.newContext({viewport:{width:1500,height:1000},serviceWorkers:"block"});
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  await page.addInitScript(({recordsKey, assetsKey}) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "20");
    localStorage.setItem(recordsKey, JSON.stringify([
      {id:"pending-record",lot:1,itemName:"仍在库拍品",mxiqiOrderId:"ORDER-PENDING",mxiqiShippingStatus:"pending",outboundTrackingNumber:""},
      {id:"filled-record",lot:2,itemName:"平台已发货拍品",mxiqiOrderId:"ORDER-FILLED",mxiqiShippingStatus:"filled",mxiqiFilledAt:"2026-08-16T10:00:00.000Z"},
      {id:"waybill-record",lot:3,itemName:"已有运单拍品",mxiqiOrderId:"ORDER-WAYBILL",mxiqiShippingStatus:"pending",outboundTrackingNumber:"SF123456789",shippingOrderedAt:"2026-08-16T11:00:00.000Z"},
    ]));
    localStorage.setItem(assetsKey, JSON.stringify([
      {id:"pending",assetKey:"pending",assetType:"consignment",buyerName:"混合组买家",buyerPhone:"13900000001",itemName:"仍在库寄存",consignmentOrderNo:"ORDER-PENDING",matchStatus:"auto",matchedRecordId:"pending-record",storageOrder:1},
      {id:"manual-done",assetKey:"manual-done",assetType:"consignment",buyerName:"混合组买家",buyerPhone:"13900000001",itemName:"手动处理寄存",matchStatus:"manual",matchedRecordId:"pending-record",storageShippingStatus:"completed",storageShippedAt:"2026-08-15T09:00:00.000Z",storageOrder:2},
      {id:"platform-done",assetKey:"platform-done",assetType:"consignment",buyerName:"自动发货买家",buyerPhone:"13900000002",itemName:"平台已发货寄存",consignmentOrderNo:"ORDER-FILLED",matchStatus:"auto",matchedRecordId:"filled-record",storageOrder:3},
      {id:"waybill-done",assetKey:"waybill-done",assetType:"consignment",buyerName:"运单买家",buyerPhone:"13900000003",itemName:"已有运单寄存",matchStatus:"manual",matchedRecordId:"waybill-record",storageOrder:4},
    ]));
  }, {recordsKey, assetsKey});

  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});
  await page.click("#open-assets");

  assert.equal(await page.locator("#asset-total").innerText(), "1");
  assert.equal(await page.locator("#asset-auto").innerText(), "1");
  assert.equal(await page.locator("#asset-manual").innerText(), "0");
  assert.match(await page.locator("#asset-footer-note").innerText(), /当前库存 1 件 \/ 1 位买家/);
  assert.match(await page.locator("#asset-footer-note").innerText(), /已发货记录 3 件（不计库存）/);

  const mixedGroup = page.locator("#asset-body .asset-group-row").filter({hasText:"混合组买家"});
  assert.match(await mixedGroup.innerText(), /1 件当前库存 · 1 件已发货/);
  assert.match(await mixedGroup.innerText(), /整组发货（1 件）/);
  await mixedGroup.locator("[data-asset-group-toggle]").click();
  const mixedChildren = await page.locator("#asset-body .asset-child-row").allTextContents();
  assert.ok(mixedChildren.some((text) => text.includes("已手动处理发货")));

  const platformGroup = page.locator("#asset-body .asset-group-row").filter({hasText:"自动发货买家"});
  assert.match(await platformGroup.innerText(), /0 件当前库存 · 1 件已发货/);
  assert.match(await platformGroup.innerText(), /寄存发货已完成 · 不计库存/);
  await platformGroup.locator("[data-asset-group-toggle]").click();
  const allChildren = await page.locator("#asset-body .asset-child-row").allTextContents();
  assert.ok(allChildren.some((text) => text.includes("已匹配发货")));

  await mixedGroup.locator("[data-asset-group-ship]").click();
  assert.equal(await page.locator("#asset-total").innerText(), "0");
  const storedAssets = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), assetsKey);
  assert.equal(storedAssets.find((asset) => asset.id === "pending").storageShippingStatus, "completed");
  assert.equal(storedAssets.find((asset) => asset.id === "manual-done").storageShippedAt, "2026-08-15T09:00:00.000Z");
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    currentInventory:0,
    excludedManualCompletion:true,
    excludedMatchedShipment:true,
    historicalRecordsPreserved:true,
  }));
} finally {
  await browser.close();
}
