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
            if (scope !== "waitconfirm") return {requiresLogin:false,records:[],pages:1,totalPages:1};
            return {requiresLogin:false,pages:1,totalPages:1,records:[{
              lot:8,itemName:"1917年英属埃及5 PIASTRES银币",auctionAt:"2026-08-06",auctionPeriodOverride:"第78期",
              platformItemKey:"202608060000000008:8:0",mxiqiOrderId:"202608060000000008",source:"mxiqi_connector",
              finalOutcome:"成交",finalPrice:880,paymentStatus:"已付款",buyerName:"网页买家",buyerPhone:"13900000008",
              recipientRaw:"网页收件人 13900000008 上海市浦东新区测试路8号",recipientName:"网页收件人",recipientPhone:"13900000008"
            }]};
          },
          syncAuctionDeals:async () => ({requiresLogin:false,records:[{
            lot:8,itemName:"1917年英属埃及5 PIASTRES银币",auctionPeriodOverride:"第78期",
            platformItemKey:"auction-result:period78:8",source:"mxiqi_connector",finalOutcome:"成交",finalPrice:880,paymentStatus:"已付款"
          }]})
        });
      `,
    });
  });
  await page.addInitScript(({recordsKey,connectionKey}) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(connectionKey, JSON.stringify({status:"connected",mode:"connector",connectorInstalled:true,connectorVersion:"1.9.2"}));
    localStorage.setItem(recordsKey, JSON.stringify([{
      id:"local-78-lot-8",lot:8,itemName:"1917年英属埃及5 PIASTRES银币",sellerWechat:"野",sellerPhone:"13845470978",
      auctionAt:"260806 周四，78期",auctionPeriodOverride:"第78期",lotLabel:"麦稀奇 / Lot 8",received:"是",
      birthdayPending:true,birthdayMonth:0,finalPrice:0,settled:false,
    }]));
  }, {recordsKey,connectionKey});
  await page.goto(siteUrl, {waitUntil:"networkidle"});
  await page.selectOption("#filter-auction", "第78期");
  await page.waitForFunction((recordsKey) => {
    const records = JSON.parse(localStorage.getItem(recordsKey) || "[]");
    return records.find((record) => record.id === "local-78-lot-8")?.buyerName === "网页买家";
  }, recordsKey, {timeout:20000});

  const result = await page.evaluate((recordsKey) => ({
    records:JSON.parse(localStorage.getItem(recordsKey) || "[]"),
    scopes:globalThis.__settlementSyncScopes,
  }), recordsKey);
  assert.deepEqual(result.scopes, ["waitpay","waitconfirm","waitexpress"]);
  assert.equal(result.records.length, 1);
  const record = result.records[0];
  assert.equal(record.id, "local-78-lot-8");
  assert.equal(record.sellerWechat, "野");
  assert.equal(record.birthdayPending, true);
  assert.equal(record.finalOutcome, "成交");
  assert.equal(record.finalPrice, 880);
  assert.equal(record.paymentStatus, "已付款");
  assert.equal(record.buyerName, "网页买家");
  assert.equal(record.buyerPhone, "13900000008");
  assert.equal(record.recipientName, "网页收件人");
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({ok:true,orderScopes:result.scopes,buyerBackfilled:true,paymentBackfilled:true}));
} finally {
  await browser.close();
}
