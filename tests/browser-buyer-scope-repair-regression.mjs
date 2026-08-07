import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-buyer-scope-repair-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true});

try {
  const context = await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:"block"});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    const period77 = Array.from({length:31}, (_,index) => {
      const lot = index + 1;
      return {id:`lot-77-${lot}`,lot,itemName:`第77期拍品 ${lot}`,sellerWechat:`送拍人${lot}`,sellerPhone:"13845470978",auctionAt:"260803 周一，77期",auctionPeriodOverride:"第77期",finalOutcome:"成交",finalPrice:100 + lot,paymentStatus:"已付款"};
    });
    const period78 = Array.from({length:6}, (_,index) => ({id:`lot-78-${index + 1}`,lot:index + 1,itemName:`第78期拍品 ${index + 1}`,sellerWechat:"第78期送拍人",sellerPhone:"13763018456",auctionAt:"260806 周四，78期",auctionPeriodOverride:"第78期",finalOutcome:"待拍",finalPrice:0}));
    const beforeRecords = [...period77,...period78];
    const backfilled = beforeRecords.map((record) => record.auctionPeriodOverride === "第77期" ? {...record,buyerName:`买家${record.lot}`,buyerPhone:`1390000${String(record.lot).padStart(4,"0")}`,recipientName:`收件人${record.lot}`,recipientPhone:`1390000${String(record.lot).padStart(4,"0")}`,platformItemKey:`period77:${record.lot}:0`,mxiqiOrderId:`order-${record.lot}`} : record);
    const unrelated = Array.from({length:435}, (_,index) => ({id:`history-${index}`,lot:1000 + index,itemName:`历史订单 ${index}`,auctionAt:"2026-07-27",auctionPeriodOverride:"第76期",finalOutcome:"成交",finalPrice:500 + index,paymentStatus:"已付款",buyerName:`历史买家${index}`,buyerPhone:"13600000000",source:"mxiqi_connector",platformItemKey:`history:${index}`}));
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([...backfilled,...unrelated]));
    localStorage.setItem("mxiqi-public-demo-history-v1", JSON.stringify([{id:"bad-buyer-backfill",time:"2026-08-07T11:38:00.000Z",action:"回补本期买家资料",detail:"第77期 · 网页订单回补 472",pending:false,before:{records:beforeRecords,assets:[],settings:{},customers:{}}}]));
  });
  await page.goto(siteUrl, {waitUntil:"networkidle"});
  await page.waitForFunction(() => document.querySelector("#metric-total")?.textContent?.trim() === "37");
  const result = await page.evaluate(() => ({
    total:document.querySelector("#metric-total")?.textContent?.trim(),
    records:JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]"),
    toast:document.querySelector("#toast")?.textContent || "",
  }));
  assert.equal(result.total, "37");
  assert.equal(result.records.length, 37);
  assert.equal(result.records.filter((record) => record.auctionPeriodOverride === "第77期" && record.buyerName && record.buyerPhone).length, 31);
  assert.equal(result.records.some((record) => record.id.startsWith("history-")), false);
  assert.match(result.toast, /已自动清理 435 条误导入订单/);
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({ok:true,total:37,buyers:31,removed:435}));
} finally {
  await browser.close();
}
