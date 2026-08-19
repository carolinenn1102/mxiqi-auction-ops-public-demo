import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-toast-foreground-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true});

try {
  const context = await browser.newContext({viewport:{width:1280,height:800},serviceWorkers:"block"});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});

  await page.click("#open-customers");
  await page.click("#new-customer");
  await page.fill('#customer-form [name="sellerWechat"]', "提示层测试");
  await page.click('#customer-form button[type="submit"]');

  const toast = page.locator("#toast");
  await toast.waitFor({state:"visible"});
  assert.equal(await page.locator("#customer-dialog").getAttribute("open"), "", "保存后档案弹窗应保持打开");
  assert.equal(await toast.evaluate((element) => element.matches(":popover-open")), true, "成功提示应进入浏览器顶层");
  const toastLayer = await toast.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const stack = document.elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      topmost: stack[0] === element,
      rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},
      stack:stack.slice(0, 5).map((node) => `${node.tagName.toLowerCase()}#${node.id}.${node.className}`),
    };
  });
  assert.equal(toastLayer.topmost, true, `成功提示应位于弹窗和遮罩前方：${JSON.stringify(toastLayer)}`);
  assert.match(await toast.innerText(), /档案已保存/);
  assert.equal(errors.length, 0, errors.join("\n"));

  console.log(JSON.stringify({ok:true,popoverOpen:true,dialogStillOpen:true,toastInForeground:true}));
} finally {
  await browser.close();
}
