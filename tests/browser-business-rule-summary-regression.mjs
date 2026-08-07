import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-business-rule-summary-regression.mjs <url> <node_modules>");
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
    localStorage.setItem(recordsKeyValue, JSON.stringify([
      {
        id:"np-under-threshold-a",lot:9,itemName:"NGC-MS62 低于生日门槛拍品",sellerWechat:"返佣组合",sellerPhone:"13900000001",
        projectName:"第77期",auctionPeriodOverride:"第77期",auctionAt:"2026-08-03 20:00",birthdayMonth:8,
        finalOutcome:"成交",finalPrice:1428,paymentStatus:"已付款",commissionAmount:-28.56,settlementAmount:1456.56,promotion:"生日 · -2%",settled:false,
      },
      {
        id:"np-under-threshold-b",lot:10,itemName:"PCGS-AU58 低于生日门槛拍品",sellerWechat:"返佣组合",sellerPhone:"13900000001",
        projectName:"第77期",auctionPeriodOverride:"第77期",auctionAt:"2026-08-03 20:00",birthdayMonth:8,
        finalOutcome:"成交",finalPrice:1470,paymentStatus:"已付款",commissionAmount:-29.4,settlementAmount:1499.4,promotion:"生日 · -2%",settled:false,
      },
      {
        id:"birthday-missing-keyword",lot:11,itemName:"生肖纪念章 无评级关键词",sellerWechat:"无关键词",sellerPhone:"13900000002",
        projectName:"第77期",auctionPeriodOverride:"第77期",auctionAt:"2026-08-03 20:00",birthdayMonth:8,
        finalOutcome:"成交",finalPrice:2500,paymentStatus:"已付款",commissionAmount:-50,settlementAmount:2550,promotion:"生日 · -2%",settled:false,
      },
      {
        id:"birthday-eligible",lot:12,itemName:"NGC-MS65 符合生日优惠",sellerWechat:"符合生日",sellerPhone:"13900000003",
        projectName:"第77期",auctionPeriodOverride:"第77期",auctionAt:"2026-08-03 20:00",birthdayMonth:8,
        finalOutcome:"成交",finalPrice:2500,paymentStatus:"已付款",commissionAmount:200,settlementAmount:2300,promotion:"普通佣金 · 8%",settled:false,
      },
      {
        id:"pending-normal-flow",lot:6,itemName:"待付款后人工选择处理",sellerWechat:"正常流程",sellerPhone:"13900000004",
        projectName:"第78期",auctionPeriodOverride:"第78期",auctionAt:"2026-08-06 20:00",
        finalOutcome:"拖回",finalPrice:1085,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/等待",
        commissionAmount:8,settlementAmount:-8,promotion:"拖回处理费 · ¥8.00",settled:false,
      },
    ]));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
  }, recordsKey);
  await page.reload({waitUntil:"networkidle"});

  const records = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), recordsKey);
  const byId = Object.fromEntries(records.map((record) => [record.id, record]));
  assert.equal(localStorageSchema(await page.evaluate(() => localStorage.getItem("mxiqi-public-demo-schema"))), "19");
  assert.equal(byId["np-under-threshold-a"].commissionAmount, -14.28);
  assert.match(byId["np-under-threshold-a"].promotion, /NP优惠/);
  assert.equal(byId["np-under-threshold-b"].commissionAmount, -14.7);
  assert.equal(byId["birthday-missing-keyword"].commissionAmount, 200);
  assert.match(byId["birthday-missing-keyword"].promotion, /普通佣金/);
  assert.equal(byId["birthday-eligible"].commissionAmount, -50);
  assert.match(byId["birthday-eligible"].promotion, /生日/);
  assert.equal(byId["pending-normal-flow"].returnDisposition, "");
  assert.equal(byId["pending-normal-flow"].unpaidReturn, false);
  assert.equal(byId["pending-normal-flow"].finalOutcome, "成交");

  const pendingRow = page.locator("#records-body tr").filter({hasText:"待付款后人工选择处理"});
  assert.match(await pendingRow.innerText(), /待付款/);
  assert.doesNotMatch(await pendingRow.innerText(), /拖回\/等待/);

  await page.click('button.nav-item[data-stage="settlement"]');
  const rebateGroup = page.locator("#records-body .settlement-group-row").filter({hasText:"返佣组合"});
  const rebateTotal = await rebateGroup.locator("td").nth(6).innerText();
  assert.match(rebateTotal, /^\+.*28\.98$/);

  assert.equal(await page.locator("#open-platform-tools").count(), 1);
  assert.equal(await page.locator("#open-connection").count(), 0);
  assert.equal(await page.locator("#open-collector").count(), 0);
  await page.click("#open-platform-tools");
  assert.equal(await page.getAttribute("#connection-dialog", "open"), "");
  assert.equal(await page.locator("#connection-dialog h2").innerText(), "麦稀奇平台登录与采集");
  await page.click("#connection-open-collector");
  assert.equal(await page.getAttribute("#connection-dialog", "open"), null);
  assert.equal(await page.getAttribute("#collector-dialog", "open"), "");
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    staleBirthdayCommissionsRecalculated:true,
    birthdayEligibilityEnforced:true,
    pendingItemsStayInNormalFlow:true,
    groupedRebateSignCorrect:true,
    platformNavigationMerged:true,
  }));
} finally {
  await browser.close();
}

function localStorageSchema(value) {
  return String(value || "");
}
