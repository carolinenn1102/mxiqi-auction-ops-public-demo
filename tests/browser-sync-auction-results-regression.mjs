import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-sync-auction-results-regression.mjs <url> <node_modules>");
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
  await page.route("**/connector-bridge.js*", (route) => route.fulfill({
    contentType:"application/javascript; charset=utf-8",
    body:`
      globalThis.__auctionResultPeriods = [];
      globalThis.__auctionResultScopes = [];
      globalThis.MxiqiConnector = Object.freeze({
        ping:async () => ({ok:true,loggedIn:true,version:"1.9.3",capabilities:["syncOrders","syncAuctionDeals"]}),
        syncOrders:async ({scope}) => {
          globalThis.__auctionResultScopes.push(scope);
          return {requiresLogin:false,records:[],pages:1,totalPages:1};
        },
        syncAuctionDeals:async ({period}) => {
          globalThis.__auctionResultPeriods.push(period);
          return {requiresLogin:false,period,records:[{
            lot:6,itemName:"当前场次待同步拍品",auctionPeriodOverride:period,
            platformItemKey:"auction-result:period99:6",source:"mxiqi_connector",
            finalOutcome:"成交",finalPrice:860,paymentStatus:"已付款",buyerName:"真实买家",buyerPhone:"13800000006"
          }]};
        }
      });
    `,
  }));
  await page.addInitScript(({recordsKey,connectionKey}) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(connectionKey, JSON.stringify({status:"connected",mode:"connector",connectorInstalled:true,connectorVersion:"1.9.3"}));
    localStorage.setItem(recordsKey, JSON.stringify([
      {id:"current-lot-6",lot:6,itemName:"当前场次待同步拍品",sellerWechat:"测试送拍人",sellerPhone:"13900000006",auctionPeriodOverride:"第99期",finalOutcome:"待拍",finalPrice:0},
      {id:"older-lot-1",lot:1,itemName:"较早场次拍品",sellerWechat:"历史送拍人",auctionPeriodOverride:"第98期",finalOutcome:"待拍",finalPrice:0},
    ]));
  }, {recordsKey,connectionKey});

  await page.goto(siteUrl, {waitUntil:"networkidle"});
  const button = page.locator("#sync-auction-results");
  await assert.doesNotReject(() => button.waitFor({state:"visible"}));
  assert.equal(await button.innerText(), "同步拍卖结果");
  assert.equal(await button.isEnabled(), true);
  await button.click();
  await page.waitForFunction(() => globalThis.__auctionResultPeriods?.length === 1);
  await page.waitForFunction((recordsKey) => JSON.parse(localStorage.getItem(recordsKey) || "[]").find((record) => record.id === "current-lot-6")?.finalOutcome === "成交", recordsKey);

  const result = await page.evaluate((recordsKey) => ({
    records:JSON.parse(localStorage.getItem(recordsKey) || "[]"),
    periods:globalThis.__auctionResultPeriods,
    scopes:globalThis.__auctionResultScopes,
    stage:document.querySelector('.nav-item[data-stage="settlement"]')?.classList.contains("active"),
    selectedPeriod:document.querySelector("#filter-auction")?.value,
    resultText:document.querySelector("#collector-last-result")?.textContent || "",
  }), recordsKey);

  assert.deepEqual(result.periods, ["第99期"], "newest known period should be selected automatically");
  assert.deepEqual(result.scopes, ["waitpay","waitconfirm","waitexpress","recent"]);
  const synced = result.records.find((record) => record.id === "current-lot-6");
  const untouched = result.records.find((record) => record.id === "older-lot-1");
  assert.equal(synced.finalOutcome, "成交");
  assert.equal(synced.finalPrice, 860);
  assert.equal(synced.paymentStatus, "已付款");
  assert.equal(synced.sellerWechat, "测试送拍人", "consignor identity must be preserved");
  assert.equal(untouched.finalOutcome, "待拍");
  assert.equal(result.stage, true);
  assert.equal(result.selectedPeriod, "第99期");
  assert.match(result.resultText, /第99期成交目录同步完成/);
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({ok:true,period:result.periods[0],scopes:result.scopes,preservedConsignor:true,openedSettlement:true}));
} finally {
  await browser.close();
}
