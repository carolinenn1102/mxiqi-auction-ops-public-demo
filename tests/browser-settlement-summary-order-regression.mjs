import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-settlement-summary-order-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true});

try {
  const context = await browser.newContext({viewport:{width:1600,height:1100},serviceWorkers:"block"});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    if (sessionStorage.getItem("settlement-order-fixture-ready") === "1") return;
    sessionStorage.setItem("settlement-order-fixture-ready", "1");
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "19");
    localStorage.setItem("mxiqi-public-demo-customers-v2", JSON.stringify({
      Zeta:{phone:"13800000001"},
      Alpha:{phone:"13800000002"},
      Beta:{phone:"13800000003"},
    }));
    const base = {auctionAt:"2026-08-12 20:00",auctionPeriodOverride:"第82期",finalOutcome:"成交",paymentStatus:"已付款",buyerName:"测试买家",buyerPhone:"13600000000"};
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([
      {...base,id:"alpha-1",lot:1,itemName:"Alpha 拍品",sellerWechat:"Alpha",sellerPhone:"13800000002",finalPrice:100},
      {...base,id:"beta-1",lot:2,itemName:"Beta 拍品",sellerWechat:"Beta",sellerPhone:"13800000003",finalPrice:200},
      {...base,id:"zeta-1",lot:3,itemName:"Zeta 拍品一",sellerWechat:"Zeta",sellerPhone:"13800000001",finalPrice:300},
      {...base,id:"zeta-2",lot:4,itemName:"Zeta 拍品二",sellerWechat:"Zeta",sellerPhone:"13800000001",finalPrice:400},
    ]));
  });
  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});
  await page.click('[data-stage="settlement"]');
  await page.selectOption("#filter-auction", "第82期");

  async function settleSeller(seller) {
    const row = page.locator("tr.settlement-group-row", {hasText:seller});
    await row.locator("button[data-settlement-settle]").click();
    await page.waitForFunction((name) => {
      const records = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").filter((record) => record.sellerWechat === name);
      return records.length > 0 && records.every((record) => record.settled);
    }, seller);
  }

  await settleSeller("Zeta");
  await settleSeller("Alpha");
  await settleSeller("Beta");

  const expected = ["Zeta", "Alpha", "Beta"];
  const summaryNames = page.locator("#seller-summary-list .seller-summary-item b");
  assert.deepEqual(await summaryNames.allTextContents(), expected, "送拍人汇总应按点击结账的先后顺序排列");

  let stored = await page.evaluate(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]"));
  const zeta = stored.filter((record) => record.sellerWechat === "Zeta");
  assert.equal(zeta[0].settlementOrder, zeta[1].settlementOrder, "一次整组结账应使用同一顺序号");
  assert.ok(zeta[0].settlementOrder < stored.find((record) => record.sellerWechat === "Alpha").settlementOrder);
  assert.ok(stored.find((record) => record.sellerWechat === "Alpha").settlementOrder < stored.find((record) => record.sellerWechat === "Beta").settlementOrder);

  await page.reload({waitUntil:"domcontentloaded"});
  await page.click('[data-stage="settlement"]');
  await page.selectOption("#filter-auction", "第82期");
  assert.deepEqual(await page.locator("#seller-summary-list .seller-summary-item b").allTextContents(), expected, "刷新后结账顺序应保持不变");

  stored = await page.evaluate(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]"));
  await page.locator("tr.settlement-group-row", {hasText:"Alpha"}).locator("button[data-settlement-toggle]").click();
  const alphaToggle = page.locator("tr.settlement-child-row", {hasText:"Alpha 拍品"}).locator('button[data-action="toggle-settle"]');
  await alphaToggle.click();
  await page.waitForFunction(() => !JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").find((record) => record.sellerWechat === "Alpha")?.settled);
  await alphaToggle.click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").find((record) => record.sellerWechat === "Alpha")?.settled);
  const reordered = ["Zeta", "Beta", "Alpha"];
  assert.deepEqual(await page.locator("#seller-summary-list .seller-summary-item b").allTextContents(), reordered, "撤销后重新结账的送拍人应移动到顺序末尾");

  await page.reload({waitUntil:"domcontentloaded"});
  await page.click('[data-stage="settlement"]');
  await page.selectOption("#filter-auction", "第82期");
  assert.deepEqual(await page.locator("#seller-summary-list .seller-summary-item b").allTextContents(), reordered, "重新结账后的顺序也应在刷新后保持");

  const finalStored = await page.evaluate(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]"));
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({
    ok:true,
    clickOrder:expected,
    refreshedOrder:expected,
    reorderedAfterResettle:await page.locator("#seller-summary-list .seller-summary-item b").allTextContents(),
    zetaBatchOrder:zeta[0].settlementOrder,
    alphaOrder:stored.find((record) => record.sellerWechat === "Alpha").settlementOrder,
    betaOrder:stored.find((record) => record.sellerWechat === "Beta").settlementOrder,
    alphaResettledOrder:finalStored.find((record) => record.sellerWechat === "Alpha").settlementOrder,
  }));
} finally {
  await browser.close();
}
