import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-preauction-seller-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true});

try {
  const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:"block",acceptDownloads:true});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem("mxiqi-public-demo-customers-v2", JSON.stringify({"档案送拍人":{phone:"13812345678",birthdayMonth:6}}));
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([
      {id:"missing-1",lot:30,itemName:"拍前核对拍品一",sellerWechat:"",sellerPhone:"",auctionAt:"260809 周日，79期",auctionPeriodOverride:"第79期",finalOutcome:"待拍",buyerName:"同一买家",buyerPhone:"13912345678",mxiqiOrderId:"package-79"},
      {id:"missing-2",lot:31,itemName:"拍前核对拍品二",sellerWechat:"",sellerPhone:"",auctionAt:"2026-08-09 20:00",auctionPeriodOverride:"第79期",finalOutcome:"待拍",buyerName:"同一买家",buyerPhone:"13912345678",mxiqiOrderId:"package-79"},
    ]));
    globalThis.__checklistText = [];
    const originalFillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
      globalThis.__checklistText.push(String(text));
      return originalFillText.call(this, text, ...args);
    };
    HTMLCanvasElement.prototype.toBlob = function (callback) { callback(new Blob(["checklist"], {type:"image/png"})); };
    HTMLAnchorElement.prototype.click = function () {};
  });
  await page.goto(siteUrl, {waitUntil:"networkidle"});

  const packageSelector = page.locator("select[data-package-seller-assign]");
  assert.equal(await packageSelector.count(), 1);
  await packageSelector.selectOption("phone:13812345678");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").every((record) => record.sellerWechat === "档案送拍人" && record.sellerPhone === "13812345678"));

  await page.click("#open-preauction-check");
  await page.click("#export-preauction-image");
  await page.waitForTimeout(200);
  const result = await page.evaluate(() => ({
    records:JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]"),
    checklistText:globalThis.__checklistText,
    panelTitle:document.querySelector("#panel-title")?.textContent || "",
    toast:document.querySelector("#toast")?.textContent || "",
  }));
  assert.equal(result.records.length, 2);
  assert.ok(result.records.every((record) => record.sellerWechat === "档案送拍人"));
  assert.ok(result.checklistText.includes("拍卖日期"), JSON.stringify(result));
  assert.ok(result.checklistText.includes("2026-08-09"), JSON.stringify(result));
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({ok:true,assigned:2,checklistDate:"2026-08-09"}));
} finally {
  await browser.close();
}
