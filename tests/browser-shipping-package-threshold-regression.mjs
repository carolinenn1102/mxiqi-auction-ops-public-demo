import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-shipping-package-threshold-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

try {
  const context = await browser.newContext({viewport:{width:1500,height:1000},serviceWorkers:"block"});
  const page = await context.newPage();
  const errors = [];
  let createOrderCalls = 0;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/logistics/health", (route) => route.fulfill({
    status:200,
    contentType:"application/json",
    body:JSON.stringify({
      ok:true,
      online:true,
      authorized:true,
      providers:{
        sf:{configured:true,productName:"账号协议产品"},
        cainiao:{configured:false,reason:"菜鸟正式接口未配置"},
      },
    }),
  }));
  await page.route("**/api/logistics/orders", (route) => {
    createOrderCalls += 1;
    return route.fulfill({status:500,contentType:"application/json",body:JSON.stringify({ok:false,error:"回归测试禁止创建真实订单"})});
  });
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "22");
    localStorage.setItem("mxiqi-public-demo-settings-v2", JSON.stringify({
      sfThreshold:2000,
      defaultGoodsName:"章牌",
      defaultPackageWeightKg:0.8,
    }));
    const base = {
      sellerWechat:"测试送拍人",
      sellerPhone:"13800000000",
      auctionAt:"2026-08-17 20:00",
      auctionPeriodOverride:"第81期",
      finalOutcome:"成交",
      paymentStatus:"已付款",
      buyerName:"测试买家",
      buyerPhone:"13900000000",
      recipientRaw:"测试收件人 13600000000 上海市浦东新区世纪大道100号",
      recipientName:"测试收件人",
      recipientPhone:"13600000000",
      addressProvince:"上海市",
      addressCity:"上海市",
      addressDistrict:"浦东新区",
      addressDetail:"世纪大道100号",
      addressStatus:"pending_review",
      shippingGoodsName:"章牌",
      shipmentWeightKg:0.8,
      carrier:"pending",
      shippingCarrier:"pending",
      carrierOverride:"",
      mxiqiShippingStatus:"",
    };
    const records = [
      {...base,id:"single-high",lot:1,itemName:"单件满两千自动顺丰",finalPrice:2351,mxiqiOrderId:"SINGLE-HIGH"},
      {...base,id:"single-low",lot:2,itemName:"单件未满两千默认菜鸟",finalPrice:128,mxiqiOrderId:"SINGLE-LOW"},
      ...[845,846,846,846].map((finalPrice, index) => ({
        ...base,
        id:`package-${index + 1}`,
        lot:10 + index,
        itemName:`整包满两千拍品 ${index + 1}`,
        finalPrice,
        mxiqiOrderId:"PACKAGE-3383",
      })),
    ];
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify(records));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
    localStorage.setItem("mxiqi-public-demo-history-v1", "[]");
  });

  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});
  await page.click('[data-stage="shipping"]');

  assert.equal(await page.locator("#shipping-sf-pending-count").innerText(), "2");
  assert.equal(await page.locator("#shipping-cainiao-pending-count").innerText(), "1");

  const highRow = page.locator("#records-body tr").filter({hasText:"单件满两千自动顺丰"});
  assert.match(await highRow.innerText(), /顺丰/);
  const lowRow = page.locator("#records-body tr").filter({hasText:"单件未满两千默认菜鸟"});
  assert.match(await lowRow.innerText(), /菜鸟/);

  const packageRow = page.locator("#records-body .package-summary-row").filter({hasText:"合并包裹 · 4 件"});
  assert.match(await packageRow.innerText(), /¥3,383\.00/);
  assert.match(await packageRow.innerText(), /顺丰/);
  await packageRow.locator("[data-package-shipping]").click();
  assert.equal(await page.locator('[name="shippingCarrier"]').inputValue(), "sf");
  assert.match(await page.locator("#shipping-carrier-note").innerText(), /整包成交总额自动判断.*3,383.*达到后默认顺丰/);

  assert.equal(createOrderCalls, 0, "浏览器回归不得提交真实物流订单");
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({
    ok:true,
    singleHighCarrier:"sf",
    singleLowCarrier:"cainiao",
    packageTotal:3383,
    packageCarrier:"sf",
    pendingValueIgnored:true,
    createOrderCalls,
  }));
} finally {
  await browser.close();
}
