import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules, workbookPath] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules || !workbookPath) {
  throw new Error("usage: node browser-0806-regression.mjs <url> <node_modules> <0806-workbook>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";

async function importWorkbook(page) {
  await page.click("#open-import");
  await page.setInputFiles("#excel-file", workbookPath);
  await page.click("#run-import");
  await page.waitForFunction(() => !document.querySelector("#import-dialog")?.open, null, {timeout:20000});
}

try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());
  await page.goto(siteUrl, {waitUntil:"networkidle"});

  await page.evaluate((recordsKey) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(recordsKey, JSON.stringify([{
      id:"same-consignor-reauction",
      lot:115,
      itemName:"NGC-MS63 1913 年 A，德国普鲁士战胜拿破仑一百周年纪念三马克。",
      projectName:"260723 周四",
      auctionAt:"260723 周四",
      sellerWechat:"野",
      sellerPhone:"13845470978",
      finalOutcome:"拖回",
      finalPrice:0,
      returnDisposition:"拖回/再拍",
      settled:false,
    }]));
  }, recordsKey);
  await page.reload({waitUntil:"networkidle"});
  await importWorkbook(page);

  const matched = await page.evaluate((recordsKey) => {
    const records = JSON.parse(localStorage.getItem(recordsKey) || "[]");
    return {records, record:records.find((item) => item.id === "same-consignor-reauction")};
  }, recordsKey);
  assert.equal(matched.records.length, 73);
  assert.equal(matched.record.lot, 10);
  assert.equal(matched.record.auctionPeriodOverride, "第78期");
  assert.match(matched.record.auctionAt, /78期/);
  assert.equal(matched.record.birthdayMonth, 0);
  assert.equal(matched.record.birthdayPending, true);
  assert.ok(matched.records.some((record) => record.sellerWechat === "四维" && record.birthdayMonth === 12 && record.birthdayPending === false));
  assert.ok(matched.records.filter((record) => record.birthdayPending).every((record) => Number(record.birthdayMonth || 0) === 0));
  assert.equal(matched.record.returnDisposition, "");
  assert.equal(matched.record.finalOutcome, "待拍");
  assert.equal(matched.record.reauctionMatchStatus, "auto");
  assert.match(await page.locator(".reauction-match-note").innerText(), /再拍库匹配/);

  await page.evaluate((recordsKey) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(recordsKey, JSON.stringify([{
      id:"conflicting-consignor-reauction",
      lot:115,
      itemName:"NGC-MS63 1913 年 A，德国普鲁士战胜拿破仑一百周年纪念三马克。",
      projectName:"260723 周四",
      auctionAt:"260723 周四",
      sellerWechat:"飞",
      sellerPhone:"13821659662",
      finalOutcome:"拖回",
      finalPrice:0,
      returnDisposition:"拖回/再拍",
      settled:false,
    }]));
  }, recordsKey);
  await page.reload({waitUntil:"networkidle"});
  await importWorkbook(page);

  const reviewed = await page.evaluate((recordsKey) => {
    const records = JSON.parse(localStorage.getItem(recordsKey) || "[]");
    return {
      records,
      source:records.find((item) => item.id === "conflicting-consignor-reauction"),
      incoming:records.find((item) => Number(item.lot) === 10 && item.id !== "conflicting-consignor-reauction"),
    };
  }, recordsKey);
  assert.equal(reviewed.records.length, 74);
  assert.equal(reviewed.source.returnDisposition, "拖回/再拍");
  assert.equal(reviewed.source.lot, 115);
  assert.equal(reviewed.incoming.auctionPeriodOverride, "第78期");
  assert.equal(reviewed.incoming.reauctionMatchStatus, "review");
  assert.match(reviewed.incoming.reauctionMatchReason, /手机号不一致/);
  assert.match(await page.locator(".reauction-match-note.review").innerText(), /再拍待确认/);
  assert.match(await page.locator("#toast").innerText(), /成交结果空白 73/);

  await page.evaluate((recordsKey) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(recordsKey, JSON.stringify([
      {id:"closed-77",lot:9,itemName:"第77期已结束拍品",auctionAt:"260803 周一，77期",auctionPeriodOverride:"第77期",finalOutcome:"待拍",finalPrice:0},
      {id:"upcoming-78",lot:10,itemName:"第78期待拍拍品",auctionAt:"260806 周四，78期",auctionPeriodOverride:"第78期",finalOutcome:"待拍",finalPrice:0},
    ]));
  }, recordsKey);
  await page.reload({waitUntil:"networkidle"});
  const lifecycleRows = await page.evaluate(() => {
    const closedButton = document.querySelector('button[data-action="sync-result"][data-id="closed-77"]');
    const futureButton = document.querySelector('button[data-action="edit"][data-id="upcoming-78"]');
    return {closed:closedButton?.closest("tr")?.innerText || "",upcoming:futureButton?.closest("tr")?.innerText || ""};
  });
  assert.match(lifecycleRows.closed, /成交结果待同步/);
  assert.match(lifecycleRows.closed, /同步成交/);
  assert.match(lifecycleRows.closed, /待同步/);
  assert.match(lifecycleRows.upcoming, /待拍/);
  assert.doesNotMatch(lifecycleRows.upcoming, /成交结果待同步/);

  await page.evaluate((recordsKey) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(recordsKey, JSON.stringify([{
      id:"polluted-0806",lot:8,itemName:"1917年英属埃及5 PIASTRES银币",sellerWechat:"野",sellerPhone:"13845470978",
      auctionAt:"260806 周四，77期",auctionPeriodOverride:"第77期",platformItemKey:"auction-result:312210:8",
      source:"mxiqi_connector",finalOutcome:"成交",finalPrice:369,paymentStatus:"已付款",buyerName:"错误买家",
      birthdayMonth:8,commissionAmount:-7.38,settlementAmount:376.38,promotion:"生日 · -2%",settled:false,
    }]));
  }, recordsKey);
  await page.reload({waitUntil:"networkidle"});
  const repaired = await page.evaluate((recordsKey) => JSON.parse(localStorage.getItem(recordsKey) || "[]")[0], recordsKey);
  assert.equal(repaired.auctionPeriodOverride, "第78期");
  assert.match(repaired.auctionAt, /78期/);
  assert.equal(repaired.finalPrice, 0);
  assert.equal(repaired.finalOutcome, undefined);
  assert.equal(repaired.paymentStatus, undefined);
  assert.equal(repaired.buyerName, undefined);
  assert.equal(repaired.birthdayMonth, 0);
  assert.equal(repaired.birthdayPending, true);

  await page.click("#open-import");
  await page.setInputFiles("#excel-file", {
    name:"第77期成交结果.json",
    mimeType:"application/json",
    buffer:Buffer.from(JSON.stringify([{
      lot:8,itemName:"第77期另一件拍品",auctionPeriodOverride:"第77期",platformItemKey:"auction-result:312210:8",
      source:"mxiqi_connector",finalOutcome:"成交",finalPrice:369,paymentStatus:"已付款",
    }]), "utf8"),
  });
  await page.click("#run-import");
  await page.waitForFunction(() => !document.querySelector("#import-dialog")?.open, null, {timeout:20000});
  const separated = await page.evaluate((recordsKey) => JSON.parse(localStorage.getItem(recordsKey) || "[]"), recordsKey);
  assert.equal(separated.length, 2);
  assert.equal(separated.find((record) => record.id === "polluted-0806").finalPrice, 0);
  assert.equal(separated.find((record) => record.auctionPeriodOverride === "第77期").finalPrice, 369);
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    originalWorkbookRows:73,
    safeReauctionAutoMatch:true,
    conflictingConsignorReview:true,
    periodNormalized:"第78期",
    bareBirthdayRequiresMonth:true,
    pollutedPeriod77SettlementCleared:true,
    oldPeriod77ImportSeparated:true,
    blankOutcomeExplained:true,
    closedAuctionResultSync:true,
    upcomingAuctionStillPending:true,
  }));
} finally {
  await browser.close();
}
