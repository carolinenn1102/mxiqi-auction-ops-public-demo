import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-storage-settlement-export-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";

try {
  const context = await browser.newContext({viewport:{width:1500,height:1000},serviceWorkers:"block",acceptDownloads:true});
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "19");
    localStorage.setItem("mxiqi-public-demo-settings-v2", JSON.stringify({
      defaultCommissionType:"percent",
      defaultCommissionValue:8,
      lowPriceThreshold:100,
      lowPriceFee:5,
      birthdayCommissionType:"percent",
      birthdayCommissionValue:-2,
      birthdayLabel:"生日",
      birthdayThreshold:2000,
      birthdayKeywords:"NGC,PCGS",
      boxRebateThreshold:1000,
      boxRebateKeywords:"NGC,PCGS",
      boxRebateValue:1,
      returnHandlingFee:8,
      sfThreshold:2000,
    }));
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([
      {
        id:"stored-unsettled",lot:5,itemName:"寄存后等待结账的拍品",sellerWechat:"寄存送拍人",sellerPhone:"13800000005",
        projectName:"第82期",auctionPeriodOverride:"第82期",auctionAt:"2026-08-09 20:00",
        finalOutcome:"成交",finalPrice:700,paymentStatus:"已付款",unpaidReturn:false,returnDisposition:"寄存",
        commissionAmount:0,settlementAmount:0,profit:0,promotion:"旧版寄存清零",settled:false,
      },
      {
        id:"rebate-export",lot:65,itemName:"PCGS-AU58 1934年民国二十三年船洋",sellerWechat:"明天见!",sellerPhone:"18386434752",
        projectName:"第83期",auctionPeriodOverride:"第83期",auctionAt:"2026-08-10 20:00",
        finalOutcome:"成交",finalPrice:1440,paymentStatus:"已付款",
        commissionAmount:-14.4,settlementAmount:1454.4,profit:-14.4,promotion:"NP优惠 · -1%",settled:true,
        settledAt:"2026-08-11T04:47:12.000Z",settlementOrder:1770000000000,
      },
      {
        id:"manual-storage",lot:6,itemName:"手动选择寄存的已付款拍品",sellerWechat:"手动寄存送拍人",sellerPhone:"13800000006",
        projectName:"第84期",auctionPeriodOverride:"第84期",auctionAt:"2026-08-11 20:00",
        finalOutcome:"成交",finalPrice:500,paymentStatus:"已付款",returnDisposition:"",
        commissionAmount:40,settlementAmount:460,profit:40,promotion:"普通佣金 · 8%",settled:false,
      },
    ]));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
    globalThis.__settlementImageText = [];
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      globalThis.__settlementImageText.push(String(text));
      return originalFillText.call(this, text, ...args);
    };
    HTMLCanvasElement.prototype.toBlob = function (callback) { callback(new Blob(["settlement"], {type:"image/png"})); };
    HTMLAnchorElement.prototype.click = function () {};
  });
  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});

  let records = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), recordsKey);
  let stored = records.find((record) => record.id === "stored-unsettled");
  assert.equal(await page.evaluate(() => localStorage.getItem("mxiqi-public-demo-schema")), "22");
  assert.equal(stored.commissionAmount, 56);
  assert.equal(stored.settlementAmount, 644);
  assert.equal(stored.settled, false);

  await page.click('button.nav-item[data-stage="settlement"]');
  await page.selectOption("#filter-auction", "第82期");
  const storageGroup = page.locator("#records-body .settlement-group-row").filter({hasText:"寄存送拍人"});
  assert.match(await storageGroup.innerText(), /0\/1/);
  await storageGroup.locator("button[data-settlement-settle]").click();
  await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]").find((record) => record.id === "stored-unsettled")?.settled === true, recordsKey);

  records = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), recordsKey);
  stored = records.find((record) => record.id === "stored-unsettled");
  assert.equal(stored.settled, true);
  assert.equal(stored.commissionAmount, 56);
  assert.equal(stored.settlementAmount, 644);
  assert.match(stored.promotion, /普通佣金/);

  await page.click('button.nav-item[data-stage="all"]');
  await page.selectOption("#filter-auction", "第84期");
  await page.locator('button[data-action="edit"][data-id="manual-storage"]').last().click();
  await page.selectOption('#edit-form select[name="returnDisposition"]', "寄存");
  await page.click("#save-record");
  await page.waitForFunction(() => !document.querySelector("#edit-dialog")?.open);
  let manuallyStored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]").find((record) => record.id === "manual-storage"), recordsKey);
  assert.equal(manuallyStored.returnDisposition, "寄存");
  assert.equal(manuallyStored.commissionAmount, 40);
  assert.equal(manuallyStored.settlementAmount, 460);

  await page.click('button.nav-item[data-stage="settlement"]');
  await page.selectOption("#filter-auction", "第84期");
  const manualStorageGroup = page.locator("#records-body .settlement-group-row").filter({hasText:"手动寄存送拍人"});
  await manualStorageGroup.locator("button[data-settlement-settle]").click();
  await page.waitForFunction((key) => JSON.parse(localStorage.getItem(key) || "[]").find((record) => record.id === "manual-storage")?.settled === true, recordsKey);
  manuallyStored = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]").find((record) => record.id === "manual-storage"), recordsKey);
  assert.equal(manuallyStored.settled, true);
  assert.equal(manuallyStored.settlementAmount, 460);

  await page.selectOption("#filter-auction", "第83期");
  await page.click("#export-settlement-image");
  await page.waitForFunction(() => globalThis.__settlementImageText.some((text) => text.includes("返佣合计")));
  const imageText = await page.evaluate(() => globalThis.__settlementImageText);
  const summary = imageText.find((text) => text.includes("1 笔") && text.includes("成交"));
  assert.match(summary, /成交 ¥1,440\.00/);
  assert.match(summary, /返佣合计 \+¥14\.40/);
  assert.match(summary, /应结 ¥1,454\.40/);
  assert.doesNotMatch(summary, /佣金 -¥14\.40/);
  assert.ok(imageText.includes("佣金 / 返佣"));
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    paidStorageSettledNormally:true,
    manualStorageSelectionSettled:true,
    rebateSummary:summary,
    settlementColumn:"佣金 / 返佣",
  }));
} finally {
  await browser.close();
}
