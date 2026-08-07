import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-edit-save-regression.mjs <url> <node_modules>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const { chromium } = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";

try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(siteUrl, {waitUntil:"networkidle"});
  await page.evaluate((recordsKeyValue) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "18");
    localStorage.setItem(recordsKeyValue, JSON.stringify([{
      id:"lot21-save-regression",
      lot:21,
      itemName:"PCGS-MS64RB 1926英属锡兰1/2分铜币",
      projectName:"甄臻铺-世界币章拍卖（第77期）",
      auctionPeriodOverride:"第77期",
      auctionAt:"2026-08-03 20:00",
      finalOutcome:"成交",
      finalPrice:85,
      paymentStatus:"已付款",
      buyerName:"云台主人",
      buyerPhone:"158****1268",
      recipientName:"云台主人",
      recipientPhone:"158****1268",
      commissionAmount:5,
      settlementAmount:80,
      profit:5,
      promotion:"低价固定佣金 · ¥5.00",
      settled:false,
    }]));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
  }, recordsKey);
  await page.reload({waitUntil:"networkidle"});

  await page.locator('button[data-action="edit"][data-id="lot21-save-regression"]').last().click();
  await page.fill('#edit-form input[name="settlementAdjustment"]', "5");
  await page.click("#save-record");
  await page.waitForFunction(() => !document.querySelector("#edit-dialog")?.open);

  let record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]")[0], recordsKey);
  assert.equal(record.settlementAdjustment, 5);
  assert.equal(record.commissionAmount, 5);
  assert.equal(record.settlementAmount, 85);
  assert.equal(record.profit, 0);
  assert.match(record.promotion, /额外加款/);
  assert.equal(record.buyerPhone, "158****1268");
  assert.equal(record.recipientPhone, "158****1268");

  await page.locator('button[data-action="edit"][data-id="lot21-save-regression"]').last().click();
  await page.fill('#edit-form input[name="buyerPhone"]', "123");
  await page.click("#save-record");
  assert.equal(await page.getAttribute("#edit-dialog", "open"), "");
  assert.match(await page.locator("#edit-form-error").innerText(), /买家登录手机号应为 11 位/);
  assert.equal(await page.getAttribute('#edit-form input[name="buyerPhone"]', "aria-invalid"), "true");

  await page.fill('#edit-form input[name="buyerPhone"]', "13800000001");
  await page.click("#save-record");
  await page.waitForFunction(() => !document.querySelector("#edit-dialog")?.open);
  record = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]")[0], recordsKey);
  assert.equal(record.buyerPhone, "13800000001");
  assert.equal(record.settlementAdjustment, 5);
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    adjustmentSaved:true,
    legacyMaskedPhonesPreserved:true,
    invalidPhoneShownInsideDialog:true,
    correctedPhoneSaved:true,
  }));
} finally {
  await browser.close();
}
