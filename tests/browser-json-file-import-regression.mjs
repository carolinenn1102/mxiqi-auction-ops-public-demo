import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules, jsonFile] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules || !jsonFile) {
  throw new Error("usage: node browser-json-file-import-regression.mjs <url> <node_modules> <json-file>");
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

  await page.goto(siteUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });

  await page.click("#open-import");
  const accept = await page.getAttribute("#excel-file", "accept");
  assert.match(accept || "", /\.json/);
  await page.setInputFiles("#excel-file", jsonFile);
  assert.match(await page.locator("#file-name").innerText(), /\.json$/i);
  await page.click("#run-import");
  await page.waitForFunction(() => !document.querySelector("#import-dialog")?.open, null, { timeout: 15000 });

  const imported = await page.evaluate(() => {
    const records = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]");
    const periodRecords = records.filter((record) => record.auctionPeriodOverride === "第77期");
    return {
      count:periodRecords.length,
      allSold:periodRecords.every((record) => record.finalOutcome === "成交"),
      allPaid:periodRecords.every((record) => record.paymentStatus === "已付款"),
      total:periodRecords.reduce((sum, record) => sum + Number(record.finalPrice || 0), 0),
      lots:periodRecords.map((record) => Number(record.lot)).sort((a, b) => a - b),
    };
  });

  assert.equal(imported.count, 31);
  assert.equal(imported.allSold, true);
  assert.equal(imported.allPaid, true);
  assert.equal(imported.total, 12982);
  assert.deepEqual(imported.lots, Array.from({ length: 31 }, (_, index) => index + 1));
  assert.deepEqual(pageErrors, []);
  process.stdout.write(JSON.stringify({ ok:true, ...imported }));
} finally {
  await browser.close();
}
