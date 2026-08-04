import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules, screenshotPath] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-unsettled-regression.mjs <url> <node_modules>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const { chromium } = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";

try {
  const page = await browser.newPage({viewport:{width:420,height:900}});
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto(siteUrl, {waitUntil:"networkidle"});
  await page.evaluate(({recordsKey}) => {
    localStorage.clear();
    localStorage.setItem(recordsKey, JSON.stringify([
      {
        id:"pending-zhang",lot:1,itemName:"未结账拍品甲",sellerWechat:"张先生",sellerPhone:"13900000001",
        projectName:"第88期",auctionPeriodOverride:"第88期",auctionAt:"2026-08-05 20:00",
        finalOutcome:"成交",finalPrice:1000,paymentStatus:"已付款",commissionAmount:80,settlementAmount:920,settled:false,
      },
      {
        id:"pending-li",lot:2,itemName:"未结账拍品乙",sellerWechat:"李女士",sellerPhone:"13900000002",
        projectName:"第88期",auctionPeriodOverride:"第88期",auctionAt:"2026-08-05 20:00",
        finalOutcome:"成交",finalPrice:2000,paymentStatus:"已付款",commissionAmount:160,settlementAmount:1840,settled:false,
      },
      {
        id:"settled-wang",lot:3,itemName:"已结账拍品",sellerWechat:"王先生",sellerPhone:"13900000003",
        projectName:"第88期",auctionPeriodOverride:"第88期",auctionAt:"2026-08-05 20:00",
        finalOutcome:"成交",finalPrice:3000,paymentStatus:"已付款",commissionAmount:240,settlementAmount:2760,
        settled:true,settledAt:"2026-08-05T13:00:00.000Z",
      },
    ]));
  }, {recordsKey});
  await page.reload({waitUntil:"networkidle"});

  await page.click('button.nav-item[data-stage="settlement"]');
  const primaryAction = page.locator("#export-settlement");
  assert.equal(await primaryAction.isEnabled(), true);
  assert.equal(await primaryAction.innerText(), "查看 2 条未结账");

  await primaryAction.click();
  assert.equal(await primaryAction.innerText(), "显示全部结算记录");
  assert.equal(await page.locator("#panel-title").innerText(), "未结账送拍人");
  assert.equal(await page.locator("#result-count").innerText(), "未结账：2 位送拍人 · 2 件拍品");
  assert.deepEqual(
    (await page.locator("#seller-summary-list .seller-summary-item b").allTextContents()).sort(),
    ["张先生", "李女士"].sort(),
  );
  assert.deepEqual(
    (await page.locator("#records-body .settlement-seller b").allTextContents()).sort(),
    ["张先生", "李女士"].sort(),
  );
  if (screenshotPath) await page.screenshot({path:screenshotPath,fullPage:true});

  const zhang = page.locator('#seller-summary-list [data-seller-summary="phone:13900000001"]');
  assert.equal(await zhang.count(), 1);
  await zhang.click();
  assert.equal(await page.locator("#result-count").innerText(), "未结账：1 位送拍人 · 1 件拍品");
  assert.match(await page.locator("#records-body .settlement-group-row").innerText(), /张先生[\s\S]*Lot 1/);

  await page.selectOption("#settlement-seller", "");
  await primaryAction.click();
  assert.equal(await primaryAction.innerText(), "查看 2 条未结账");
  assert.equal(await page.locator("#result-count").innerText(), "3 位送拍人 · 3 件拍品");

  await page.selectOption("#filter-auction", "第88期");
  await primaryAction.click();
  await page.click('[data-settlement-settle="phone:13900000001"]');
  assert.equal(await page.locator("#result-count").innerText(), "未结账：1 位送拍人 · 1 件拍品");
  await page.click('[data-settlement-settle="phone:13900000002"]');
  assert.equal(await primaryAction.innerText(), "导出本期结算表");
  assert.equal(await page.locator("#result-count").innerText(), "3 位送拍人 · 3 件拍品");
  const completeLabels = page.locator("#records-body .settlement-queue-complete small");
  assert.equal(await completeLabels.count(), 3);
  assert.ok((await completeLabels.allTextContents()).every((label) => label === "全部已结账"));
  assert.ok((await completeLabels.evaluateAll((labels) => labels.map((label) => getComputedStyle(label).color))).every((color) => color === "rgb(29, 97, 74)"));
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    unsettledButtonEnabled:true,
    consignorsVisible:true,
    sellerDrilldown:true,
    allRecordsRestored:true,
    autoRestoredAfterFinalSettlement:true,
    completedGroupsGreen:true,
  }));
} finally {
  await browser.close();
}
