import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-auto-settlement-recovery-regression.mjs <url> <node_modules>");
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
        globalThis.__autoSettlementScopes = [];
        globalThis.__autoSettlementPeriods = [];
        globalThis.MxiqiConnector = Object.freeze({
          ping:async () => ({ok:true,loggedIn:true,version:"1.9.2",capabilities:["syncOrders","syncAuctionDeals"]}),
          syncOrders:async ({scope}) => {
            globalThis.__autoSettlementScopes.push(scope);
            return {requiresLogin:false,records:[],pages:1,totalPages:1};
          },
          syncAuctionDeals:async ({period}) => {
            globalThis.__autoSettlementPeriods.push(period);
            return {requiresLogin:false,records:period === "第78期" ? [{
              lot:19,itemName:"比利时利奥波德二世1873年5法郎大银币（裸币）",auctionPeriodOverride:"第78期",
              platformItemKey:"auction-result:period78:19",source:"mxiqi_connector",finalOutcome:"成交",finalPrice:1428,paymentStatus:"已付款"
            }] : []};
          }
        });
      `,
    });
  });
  await page.addInitScript(({recordsKey,connectionKey}) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(connectionKey, JSON.stringify({status:"connected",mode:"connector",connectorInstalled:true,connectorVersion:"1.9.2"}));
    localStorage.setItem(recordsKey, JSON.stringify([
      {
        id:"local-78-lot-19",lot:19,itemName:"比利时利奥波德二世1873年5法郎大银币（裸币）",sellerWechat:"弘治十八年",sellerPhone:"15267676688",
        auctionAt:"2026-08-06",auctionPeriodOverride:"第78期",lotLabel:"麦稀奇 / Lot 19",received:"是",finalPrice:0,settled:false,
      },
      {
        id:"future-79-lot-1",lot:1,itemName:"未来场次测试拍品",sellerWechat:"未来送拍人",
        auctionAt:"2026-08-20",auctionPeriodOverride:"第79期",lotLabel:"麦稀奇 / Lot 1",received:"是",finalPrice:0,settled:false,
      },
    ]));
  }, {recordsKey,connectionKey});

  await page.goto(siteUrl, {waitUntil:"networkidle"});
  try {
    await page.waitForFunction((recordsKey) => {
      const records = JSON.parse(localStorage.getItem(recordsKey) || "[]");
      return records.find((record) => record.id === "local-78-lot-19")?.finalOutcome === "成交";
    }, recordsKey, {timeout:20000});
  } catch (error) {
    const debug = await page.evaluate((recordsKey) => ({
      records:JSON.parse(localStorage.getItem(recordsKey) || "[]"),
      scopes:globalThis.__autoSettlementScopes,
      periods:globalThis.__autoSettlementPeriods,
      connection:JSON.parse(localStorage.getItem("mxiqi-public-demo-connection-v1") || "{}"),
      collector:JSON.parse(localStorage.getItem("mxiqi-public-demo-collector-v1") || "{}"),
      toast:document.querySelector("#toast")?.textContent || "",
    }), recordsKey);
    throw new Error(`${error.message}\n${JSON.stringify({debug,pageErrors}, null, 2)}`);
  }

  const result = await page.evaluate((recordsKey) => ({
    records:JSON.parse(localStorage.getItem(recordsKey) || "[]"),
    scopes:globalThis.__autoSettlementScopes,
    periods:globalThis.__autoSettlementPeriods,
  }), recordsKey);

  assert.deepEqual(result.periods, ["第78期"], "fresh page load should automatically sync only ended pending periods");
  assert.deepEqual(result.scopes, ["waitpay","waitconfirm","waitexpress"]);
  const settled = result.records.find((record) => record.id === "local-78-lot-19");
  const future = result.records.find((record) => record.id === "future-79-lot-1");
  assert.equal(settled.finalOutcome, "成交");
  assert.equal(settled.finalPrice, 1428);
  assert.equal(settled.paymentStatus, "已付款");
  assert.equal(future.finalOutcome || "", "", "upcoming auctions must not be treated as settlement results");
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({ok:true,automatic:true,periods:result.periods,upcomingProtected:true}));
} finally {
  await browser.close();
}
