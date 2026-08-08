import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-latest-consignor-name-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true});

try {
  const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:"block"});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "19");
    localStorage.setItem("mxiqi-public-demo-customers-v2", JSON.stringify({
      "四维 12月":{phone:"15885513177",updatedAt:"2026-08-08T08:00:00.000Z"},
    }));
    const base = {
      auctionAt:"2026-08-09 20:00",
      auctionPeriodOverride:"第79期",
      finalOutcome:"成交",
      paymentStatus:"已付款",
      settled:false,
      sellerPhone:"15885513177",
    };
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([
      {...base,id:"old-name",lot:6,itemName:"第79期拍品",sellerWechat:"四维 12月",finalPrice:200,importedAt:"2026-08-08T10:00:00.000Z"},
    ]));
  });
  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});
  await page.click("#open-import");
  await page.setInputFiles("#excel-file", {
    name:"latest-consignor.json",
    mimeType:"application/json",
    buffer:Buffer.from(JSON.stringify([{
      lot:6,
      itemName:"第79期拍品",
      auctionAt:"2026-08-09 20:00",
      auctionPeriodOverride:"第79期",
      finalOutcome:"成交",
      paymentStatus:"已付款",
      finalPrice:200,
      sellerWechat:"最新表送拍人名称",
      sellerPhone:"15885513177",
    }]), "utf8"),
  });
  await page.click("#run-import");
  await page.waitForFunction(() => !document.querySelector("#import-dialog")?.open);
  const storedRecords = await page.evaluate(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]"));
  assert.equal(storedRecords.length, 1, "重新上传同一期同一 Lot 不应产生重复记录");
  assert.equal(storedRecords[0].sellerWechat, "最新表送拍人名称");
  assert.equal(storedRecords[0].sellerPhone, "15885513177");

  await page.click('[data-stage="settlement"]');
  await page.selectOption("#filter-auction", "第79期");

  const cards = page.locator("#seller-summary-list .seller-summary-item");
  assert.equal(await cards.count(), 1, "同一手机号的历史昵称应合并成一个送拍人");
  const cardText = await cards.first().innerText();
  assert.match(cardText, /最新表送拍人名称/);
  assert.doesNotMatch(cardText, /四维 12月/);
  assert.match(cardText, /15885513177/);

  const sellerOptions = await page.locator("#filter-seller option").allTextContents();
  assert.ok(sellerOptions.some((text) => text.includes("最新表送拍人名称")), JSON.stringify(sellerOptions));
  assert.ok(!sellerOptions.some((text) => text.startsWith("四维 12月")), JSON.stringify(sellerOptions));
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({ok:true,reimportUpdated:true,displayName:"最新表送拍人名称",phoneIdentity:"15885513177",aliasesMerged:2}));
} finally {
  await browser.close();
}
