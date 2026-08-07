import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-settlement-buyer-sync-regression.mjs <url> <node_modules>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";
const connectionKey = "mxiqi-public-demo-connection-v1";

try {
  const context = await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:"block"});
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.route("**/connector-bridge.js*", async (route) => {
    await route.fulfill({
      contentType:"application/javascript; charset=utf-8",
      body:`
        globalThis.__settlementSyncScopes = [];
        globalThis.MxiqiConnector = Object.freeze({
          ping:async () => ({ok:true,loggedIn:true,version:"1.9.2",capabilities:["syncOrders","syncAuctionDeals"]}),
          syncOrders:async ({scope}) => {
            globalThis.__settlementSyncScopes.push(scope);
            const allOrders = Array.from({length:31}, (_,index) => {
              const lot = index + 1;
              return {
                lot,itemName:"第77期测试拍品 " + lot,auctionAt:"2026-08-03",auctionPeriodOverride:"第77期",
                platformItemKey:"2026080300000000" + String(lot).padStart(2,"0") + ":" + lot + ":0",mxiqiOrderId:"2026080300000000" + String(lot).padStart(2,"0"),source:"mxiqi_connector",
                finalOutcome:"成交",finalPrice:100 + lot,paymentStatus:"已付款",buyerName:"网页买家" + lot,buyerPhone:"1390000" + String(lot).padStart(4,"0"),
                recipientRaw:"网页收件人" + lot + " 1390000" + String(lot).padStart(4,"0") + " 上海市测试路" + lot + "号",recipientName:"网页收件人" + lot,recipientPhone:"1390000" + String(lot).padStart(4,"0")
              };
            });
            if (scope === "waitconfirm") return {requiresLogin:false,pages:1,totalPages:1,records:allOrders.slice(0,7)};
            if (scope === "recent") return {requiresLogin:false,pages:3,totalPages:105,records:allOrders};
            return {requiresLogin:false,records:[],pages:1,totalPages:1};
          },
          syncAuctionDeals:async () => ({requiresLogin:false,records:Array.from({length:31}, (_,index) => {
            const lot = index + 1;
            return {lot,itemName:"第77期测试拍品 " + lot,auctionPeriodOverride:"第77期",
              platformItemKey:"auction-result:period77:" + lot,source:"mxiqi_connector",finalOutcome:"成交",finalPrice:100 + lot,paymentStatus:"已付款"};
          })})
        });
      `,
    });
  });
  await page.addInitScript(({recordsKey,connectionKey}) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(connectionKey, JSON.stringify({status:"connected",mode:"connector",connectorInstalled:true,connectorVersion:"1.9.2"}));
    localStorage.setItem(recordsKey, JSON.stringify(Array.from({length:31}, (_,index) => {
      const lot = index + 1;
      return {id:`local-77-lot-${lot}`,lot,itemName:`第77期测试拍品 ${lot}`,sellerWechat:`送拍人${lot}`,sellerPhone:"13845470978",
        auctionAt:"260803 周一，77期",auctionPeriodOverride:"第77期",lotLabel:`麦稀奇 / Lot ${lot}`,received:"是",
        birthdayPending:true,birthdayMonth:0,finalOutcome:"成交",finalPrice:100 + lot,paymentStatus:"已付款",settled:false};
    })));
  }, {recordsKey,connectionKey});
  await page.goto(siteUrl, {waitUntil:"networkidle"});
  await page.waitForFunction((recordsKey) => {
    const records = JSON.parse(localStorage.getItem(recordsKey) || "[]");
    return records.length === 31 && records.every((record) => record.buyerName && record.buyerPhone);
  }, recordsKey, {timeout:20000});

  const result = await page.evaluate((recordsKey) => ({
    records:JSON.parse(localStorage.getItem(recordsKey) || "[]"),
    scopes:globalThis.__settlementSyncScopes,
    collector:JSON.parse(localStorage.getItem("mxiqi-public-demo-collector-v1") || "{}"),
  }), recordsKey);
  assert.deepEqual(result.scopes, ["waitpay","waitconfirm","waitexpress","recent"]);
  assert.equal(result.records.length, 31);
  assert.ok(result.records.every((record) => record.sellerWechat === `送拍人${record.lot}`));
  assert.ok(result.records.every((record) => record.birthdayPending === true));
  assert.ok(result.records.every((record) => record.finalOutcome === "成交"));
  assert.ok(result.records.every((record) => record.paymentStatus === "已付款"));
  assert.ok(result.records.every((record) => record.buyerName === `网页买家${record.lot}`));
  assert.ok(result.records.every((record) => record.buyerPhone === `1390000${String(record.lot).padStart(4,"0")}`));
  assert.ok(result.records.every((record) => record.recipientName === `网页收件人${record.lot}`));
  assert.match(result.collector.lastResult || "", /网页订单回补 31 件/);
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({ok:true,orderScopes:result.scopes,buyersBackfilled:result.records.length,paymentBackfilled:true}));
} finally {
  await browser.close();
}
