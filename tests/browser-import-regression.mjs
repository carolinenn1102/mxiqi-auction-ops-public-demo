import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules, ...workbooks] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules || !workbooks.length) {
  throw new Error("usage: node browser-import-regression.mjs <url> <node_modules> <workbook...>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const { chromium } = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless: true,
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto(siteUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => {
    const records = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]");
    records.push({
      id:"protected-import-record",
      lot:22,
      itemName:"导入前已有拍品",
      projectName:"第77期",
      auctionAt:"260803 周一，77期",
      received:"是",
      finalOutcome:"成交",
      finalPrice:2500,
      settled:true,
      sellerWechat:"原送拍人",
      sellerPhone:"13900000009",
    });
    records.push({
      id:"protected-import-duplicate",
      lot:22,
      itemName:"导入前重复拍品",
      projectName:"第77期",
      auctionAt:"260803 周一，77期",
      coinBoxId:"duplicate-rich-field",
    });
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify(records));
  });
  await page.reload({ waitUntil: "networkidle" });

  for (const workbook of workbooks) {
    await page.click("#open-import");
    await page.setInputFiles("#excel-file", workbook);
    await page.click("#run-import");
    await page.waitForFunction(() => !document.querySelector("#import-dialog")?.open, null, { timeout: 15000 });
    assert.ok((await page.locator("body").innerText()).includes("送拍全流程工作台"));
    await page.reload({ waitUntil: "networkidle" });
    assert.ok((await page.locator("body").innerText()).includes("送拍全流程工作台"));
  }

  assert.deepEqual(pageErrors, []);
  const importState = await page.evaluate(() => {
    const records = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]");
    const protectedRecord = records.find((record) => record.id === "protected-import-record");
    const protectedLots = records.filter((record) => Number(record.lot) === 22 && /77期/.test(`${record.projectName || ""} ${record.auctionAt || ""}`));
    const history = JSON.parse(localStorage.getItem("mxiqi-public-demo-history-v1") || "[]");
    return {
      count:Array.isArray(records) ? records.length : 0,
      protectedRecord,
      protectedLots,
      hasImportSnapshot:history.some((entry) => entry?.before && entry.action === "导入数据"),
    };
  });
  const recordCount = importState.count;
  assert.ok(recordCount > 0, "import should persist records");
  assert.equal(importState.protectedRecord.received, "是");
  assert.equal(importState.protectedRecord.finalOutcome, "成交");
  assert.equal(importState.protectedRecord.finalPrice, 2500);
  assert.equal(importState.protectedRecord.settled, true);
  assert.equal(importState.protectedRecord.birthdayMonth, 8);
  assert.doesNotMatch(importState.protectedRecord.sellerWechat, /生日|1\d{10}/);
  assert.equal(importState.protectedLots.length, 1, "same-period duplicate lot must be merged");
  assert.equal(importState.protectedRecord.coinBoxId, "duplicate-rich-field");
  assert.equal(importState.hasImportSnapshot, true);

  await page.click("#open-import");
  await page.setInputFiles("#excel-file", workbooks.at(-1));
  await page.click("#run-import");
  await page.waitForFunction(() => !document.querySelector("#import-dialog")?.open, null, { timeout: 15000 });
  const repeatedCount = await page.evaluate(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").length);
  assert.equal(repeatedCount, recordCount, "reimport must upsert instead of duplicating records");

  await page.click("#open-audit");
  await page.selectOption("#undo-target", { index: 1 });
  await page.click("#undo-operation");
  await page.waitForFunction((before) => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").length < before, recordCount);
  const undoneRecord = await page.evaluate(() => JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]").find((record) => record.id === "protected-import-record"));
  assert.equal(undoneRecord.itemName, "导入前已有拍品");
  assert.equal(undoneRecord.finalPrice, 2500);
  await page.evaluate(() => {
    const records = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]");
    records.push({
      id: "corrupt-regression-record",
      lot: { unexpected: true },
      itemName: { unexpected: true },
      sellerWechat: { unexpected: true },
      sellerPhone: { unexpected: true },
      auctionPeriod: "第77期",
    });
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify(records));
  });
  await page.reload({ waitUntil: "networkidle" });
  assert.ok((await page.locator("body").innerText()).includes("送拍全流程工作台"));
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({ ok: true, recordCount, workbooks: workbooks.length, blankFieldsPreserved:true, duplicateConflictMerged:true, reimportUpserted:true, undoVerified:true, corruptionRecovered: true }));
} finally {
  await browser.close();
}
