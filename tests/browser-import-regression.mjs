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

  await page.goto(siteUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
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
  const recordCount = await page.evaluate(() => {
    const records = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1") || "[]");
    return Array.isArray(records) ? records.length : 0;
  });
  assert.ok(recordCount > 0, "import should persist records");
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

  process.stdout.write(JSON.stringify({ ok: true, recordCount, workbooks: workbooks.length, corruptionRecovered: true }));
} finally {
  await browser.close();
}
