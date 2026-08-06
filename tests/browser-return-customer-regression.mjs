import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-return-customer-regression.mjs <url> <node_modules>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const { chromium } = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

try {
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(siteUrl, {waitUntil:"networkidle"});
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([{
      id:"return-review",lot:6,itemName:"人工复核拍品",sellerWechat:"机器战士",sellerPhone:"13900000001",
      buyerName:"机器战士",buyerPhone:"13900000001",projectName:"第78期",auctionPeriodOverride:"第78期",
      auctionAt:"2026-08-06 20:00",finalOutcome:"拖回",finalPrice:1000,paymentStatus:"待付款",
      unpaidReturn:true,returnDisposition:"拖回/发回",settled:false,
    }]));
  });
  await page.reload({waitUntil:"networkidle"});

  assert.equal(await page.locator("#records-body .status-cell .chip").innerText(), "拖回/等待");
  assert.equal(await page.locator('[data-customer-open="phone:13900000001"]').count(), 1);
  await page.locator('[data-customer-open="phone:13900000001"]').click();
  assert.equal(await page.locator("#customer-dialog").isVisible(), true);
  assert.equal(await page.locator('#customer-form [name="sellerWechat"]').inputValue(), "机器战士");
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({ok:true,manualReturnReview:true,consignorProfileClickable:true}));
} finally {
  await browser.close();
}
