import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-unsold-settlement-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";

try {
  const context = await browser.newContext({viewport:{width:1500,height:1000},serviceWorkers:"block"});
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  await page.addInitScript(({recordsKey}) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "21");
    localStorage.setItem("mxiqi-public-demo-settings-v2", JSON.stringify({
      defaultCommissionType:"percent",
      defaultCommissionValue:8,
      lowPriceThreshold:100,
      lowPriceFee:5,
      birthdayCommissionType:"percent",
      birthdayCommissionValue:-2,
      birthdayThreshold:2000,
      birthdayKeywords:"NGC,PCGS",
      boxRebateThreshold:1000,
      boxRebateKeywords:"NGC,PCGS",
      boxRebateValue:1,
      returnHandlingFee:8,
    }));
    localStorage.setItem(recordsKey, JSON.stringify([
      {
        id:"period-80-unsold-lot-1",lot:1,itemName:"第80期流拍拍品",sellerWechat:"奶油布丁",sellerPhone:"13524696180",
        projectName:"第80期",auctionPeriodOverride:"第80期",auctionAt:"260813 周四，80期",
        finalOutcome:"流拍",finalPrice:0,paymentStatus:"",commissionAmount:0,settlementAmount:0,promotion:"",settled:false,
      },
      {
        id:"period-80-settled-lot-2",lot:2,itemName:"第80期已结账拍品",sellerWechat:"奶油布丁",sellerPhone:"13524696180",
        projectName:"第80期",auctionPeriodOverride:"第80期",auctionAt:"260813 周四，80期",
        finalOutcome:"成交",finalPrice:65,paymentStatus:"已付款",commissionAmount:5,settlementAmount:60,promotion:"低价固定佣金 · ¥5.00",
        settled:true,settledAt:"2026-08-16T10:00:00.000Z",settlementOrder:1,
      },
    ]));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
  }, {recordsKey});

  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});
  await page.click('button.nav-item[data-stage="settlement"]');

  const records = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), recordsKey);
  const unsold = records.find((record) => record.id === "period-80-unsold-lot-1");
  const settled = records.find((record) => record.id === "period-80-settled-lot-2");
  assert.equal(await page.evaluate(() => localStorage.getItem("mxiqi-public-demo-schema")), "22");
  assert.equal(unsold.commissionAmount, 5);
  assert.equal(unsold.settlementAmount, -5);
  assert.match(unsold.promotion, /低价固定佣金/);
  assert.equal(settled.settlementAmount, 60, "already-settled historical amount must remain unchanged");

  assert.equal(await page.locator("#sold-count").innerText(), "2");
  assert.equal(await page.locator("#settlement-gross").innerText(), "¥65.00");
  assert.equal(await page.locator("#settlement-payable").innerText(), "¥55.00");
  assert.equal(await page.locator("#settlement-unsettled-payable").innerText(), "-¥5.00");

  const group = page.locator("#records-body .settlement-group-row").filter({hasText:"奶油布丁"});
  assert.match(await group.innerText(), /2 件 · Lot 1、2/);
  await group.locator("[data-settlement-toggle]").click();
  const unsoldRow = page.locator("#records-body .settlement-child-row").filter({hasText:"Lot 1"});
  assert.match(await unsoldRow.innerText(), /流拍/);
  assert.equal((await unsoldRow.locator("td").nth(6).innerText()).trim(), "¥5.00");
  assert.equal((await unsoldRow.locator("td").nth(7).innerText()).trim(), "-¥5.00");

  await page.selectOption("#filter-auction", "第80期");
  await group.locator("[data-settlement-settle]").click();
  assert.equal(await page.locator("#settlement-unsettled-payable").innerText(), "¥0.00");
  assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]").find((record) => record.id === "period-80-unsold-lot-1")?.settled, recordsKey), true);
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    unsoldLotVisible:true,
    fixedFee:5,
    unsoldPayable:-5,
    unsettledBefore:-5,
    unsettledAfter:0,
    settledHistoryPreserved:true,
  }));
} finally {
  await browser.close();
}
