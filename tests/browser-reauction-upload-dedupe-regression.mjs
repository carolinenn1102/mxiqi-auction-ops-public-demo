import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-reauction-upload-dedupe-regression.mjs <url> <node_modules>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";
const recoveryKey = "mxiqi-public-demo-recovery-v1";

try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(siteUrl, {waitUntil:"networkidle"});
  await page.evaluate((recordsKey) => {
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "16");
    localStorage.setItem(recordsKey, JSON.stringify([
      {
        id:"unique-return",
        lot:1,
        itemName:"PCGS AU58 北洋造光绪元宝",
        sellerWechat:"唯一送拍人",
        sellerPhone:"13900000001",
        projectName:"第78期",
        auctionPeriodOverride:"第78期",
        finalOutcome:"拖回",
        finalPrice:1200,
        paymentStatus:"已付款",
        returnDisposition:"拖回/再拍",
        settled:true,
      },
      {
        id:"ambiguous-return-a",
        lot:2,
        itemName:"NGC MS65 同版银币",
        sellerWechat:"相同送拍人",
        sellerPhone:"13900000002",
        projectName:"第78期",
        auctionPeriodOverride:"第78期",
        finalOutcome:"拖回",
        returnDisposition:"拖回/再拍",
        returnDispositionConfirmedAt:"2026-08-09T10:00:00.000Z",
      },
      {
        id:"ambiguous-return-b",
        lot:3,
        itemName:"NGC MS65 同版银币",
        sellerWechat:"相同送拍人",
        sellerPhone:"13900000002",
        projectName:"第78期",
        auctionPeriodOverride:"第78期",
        finalOutcome:"拖回",
        returnDisposition:"拖回/再拍",
        returnDispositionConfirmedAt:"2026-08-09T10:00:00.000Z",
      },
    ]));
  }, recordsKey);
  await page.reload({waitUntil:"networkidle"});

  await page.click('.nav-item[data-stage="reauction"]');
  await page.click("#reauction-compare-import");
  assert.match(await page.locator("#import-title").innerText(), /上传新表并与拖回库去重/);
  assert.match(await page.locator("#import-copy").innerText(), /库内已有拍品更新原记录，不重复新增/);

  await page.fill("#json-input", JSON.stringify([
    {
      lot:101,
      itemName:"PCGS AU58 北洋造光绪元宝",
      sellerWechat:"唯一送拍人",
      sellerPhone:"13900000001",
      projectName:"第79期",
      auctionPeriodOverride:"第79期",
      finalOutcome:"待拍",
    },
    {
      lot:102,
      itemName:"NGC MS65 同版银币",
      sellerWechat:"相同送拍人",
      sellerPhone:"13900000002",
      projectName:"第79期",
      auctionPeriodOverride:"第79期",
      finalOutcome:"待拍",
    },
    {
      lot:103,
      itemName:"全新孤品铜章 独立题材",
      sellerWechat:"新增送拍人",
      sellerPhone:"13900000003",
      projectName:"第79期",
      auctionPeriodOverride:"第79期",
      finalOutcome:"待拍",
    },
  ]));
  await page.click("#run-import");
  await page.waitForFunction(() => !document.querySelector("#import-dialog")?.open);

  const result = await page.evaluate(({recordsKey, recoveryKey}) => ({
    records:JSON.parse(localStorage.getItem(recordsKey) || "[]"),
    recovery:JSON.parse(localStorage.getItem(recoveryKey) || "null"),
    toast:document.querySelector("#toast")?.textContent || "",
  }), {recordsKey, recoveryKey});

  assert.equal(result.records.length, 4, "可信重复和疑似重复都不应新增副本，只有全新拍品新增");
  const relisted = result.records.find((record) => record.id === "unique-return");
  assert.ok(relisted, "可信匹配必须沿用原记录 ID");
  assert.equal(relisted.lot, 101);
  assert.equal(relisted.auctionPeriodOverride, "第79期");
  assert.equal(relisted.returnDisposition, "");
  assert.ok(relisted.priorReturnSettlement, "原拖回结算资料必须保留");
  assert.equal(result.records.filter((record) => record.itemName === "NGC MS65 同版银币").length, 2, "疑似重复不得写入第三份");
  assert.equal(result.records.filter((record) => record.itemName === "全新孤品铜章 独立题材").length, 1, "真正的新拍品必须新增");
  assert.equal(result.recovery?.reason, "reauction-compare-review");
  assert.equal(result.recovery?.payload?.records?.length, 1, "疑似重复应保留一份本地恢复副本");
  assert.match(result.toast, /库内已有 1/);
  assert.match(result.toast, /新增 1/);
  assert.match(result.toast, /疑似重复未新增 1/);
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    existingMerged:1,
    reviewSkipped:1,
    newAdded:1,
    totalRecords:result.records.length,
  }));
} finally {
  await browser.close();
}
