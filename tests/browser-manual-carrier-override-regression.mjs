import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-manual-carrier-override-regression.mjs <url> <node_modules>");

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const {chromium} = requireFromRuntime("playwright");
const browser = await chromium.launch({executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",headless:true});

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
      authorized:false,
      version:"test-manual-carrier",
      capabilities:["createLogisticsOrder"],
      providers:{
        sf:{configured:true,productName:"账号协议产品"},
        cainiao:{configured:false,reason:"菜鸟真实接口未配置"},
      },
    }),
  }));
  await page.route("**/api/logistics/orders", (route) => {
    createOrderCalls += 1;
    return route.fulfill({status:500,contentType:"application/json",body:JSON.stringify({ok:false,error:"回归测试禁止创建真实订单"})});
  });
  await page.addInitScript(() => {
    if (sessionStorage.getItem("manual-carrier-test-initialized") === "1") return;
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("manual-carrier-test-initialized", "1");
    localStorage.setItem("mxiqi-public-demo-schema", "21");
    localStorage.setItem("mxiqi-public-demo-settings-v2", JSON.stringify({
      sfThreshold:2000,
      defaultGoodsName:"章牌",
      defaultPackageWeightKg:0.8,
      sfSenderName:"测试寄件人",
      sfSenderPhone:"13812345678",
      sfSenderAddress:"北京市门头沟区测试路1号",
    }));
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([{
      id:"low-price-manual-sf",
      lot:89,
      itemName:"低价拍品人工顺丰测试",
      sellerWechat:"测试送拍人",
      sellerPhone:"13800000000",
      auctionAt:"2026-08-10 20:00",
      auctionPeriodOverride:"第80期",
      finalOutcome:"成交",
      finalPrice:530,
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
      addressStatus:"reviewed",
      shippingGoodsName:"章牌",
      shipmentWeightKg:0.8,
      shippingCarrier:"cainiao",
      carrier:"cainiao",
      carrierOverride:"",
      mxiqiOrderId:"LOW-PRICE-89",
      mxiqiShippingStatus:"",
    }]));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
    localStorage.setItem("mxiqi-public-demo-history-v1", "[]");
  });

  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});
  await page.click('[data-stage="shipping"]');
  assert.equal(await page.locator("#shipping-cainiao-pending-count").innerText(), "1");
  assert.equal(await page.locator("#shipping-sf-pending-count").innerText(), "0");

  await page.click("#shipping-next-cainiao");
  assert.equal(await page.locator('[name="shippingCarrier"]').inputValue(), "cainiao");
  assert.match(await page.locator("#shipping-carrier-note").innerText(), /按成交价自动判断.*未满.*2,000.*默认菜鸟/);
  assert.equal(await page.locator("#shipping-reset-carrier").isDisabled(), true);

  await page.selectOption('[name="shippingCarrier"]', "sf");
  assert.match(await page.locator("#shipping-carrier-note").innerText(), /已人工指定顺丰.*刷新页面后仍保留/);
  assert.equal(await page.locator("#shipping-reset-carrier").isEnabled(), true);
  assert.match(await page.locator("#shipping-create-order").innerText(), /顺丰服务已连接.*待授权/);
  assert.equal(await page.locator("#shipping-create-order").isDisabled(), true);
  assert.deepEqual(await page.evaluate(() => {
    const [record] = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1"));
    return {carrierOverride:record.carrierOverride,shippingCarrier:record.shippingCarrier,carrier:record.carrier};
  }), {carrierOverride:"sf",shippingCarrier:"sf",carrier:"sf"});

  await page.click("#shipping-dialog [data-close-dialog]");
  assert.equal(await page.locator("#shipping-cainiao-pending-count").innerText(), "0");
  assert.equal(await page.locator("#shipping-sf-pending-count").innerText(), "1");

  await page.reload({waitUntil:"domcontentloaded"});
  await page.click('[data-stage="shipping"]');
  await page.click("#shipping-next-sf");
  assert.equal(await page.locator('[name="shippingCarrier"]').inputValue(), "sf");
  assert.match(await page.locator("#shipping-carrier-note").innerText(), /已人工指定顺丰/);

  await page.click("#shipping-reset-carrier");
  assert.equal(await page.locator('[name="shippingCarrier"]').inputValue(), "cainiao");
  assert.match(await page.locator("#shipping-carrier-note").innerText(), /按成交价自动判断/);
  assert.deepEqual(await page.evaluate(() => {
    const [record] = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1"));
    return {carrierOverride:record.carrierOverride,shippingCarrier:record.shippingCarrier,carrier:record.carrier};
  }), {carrierOverride:"",shippingCarrier:"cainiao",carrier:"cainiao"});

  await page.evaluate(() => {
    const records = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1"));
    records[0].carrierOverride = "";
    records[0].shippingCarrier = "sf";
    records[0].carrier = "cainiao";
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify(records));
    localStorage.setItem("mxiqi-public-demo-schema", "20");
  });
  await page.reload({waitUntil:"domcontentloaded"});
  await page.click('[data-stage="shipping"]');
  assert.equal(await page.locator("#shipping-sf-pending-count").innerText(), "1");
  assert.deepEqual(await page.evaluate(() => {
    const [record] = JSON.parse(localStorage.getItem("mxiqi-public-demo-records-v1"));
    return {schema:localStorage.getItem("mxiqi-public-demo-schema"),carrierOverride:record.carrierOverride,shippingCarrier:record.shippingCarrier,carrier:record.carrier};
  }), {schema:"22",carrierOverride:"sf",shippingCarrier:"sf",carrier:"sf"});

  assert.equal(createOrderCalls, 0, "浏览器回归不得提交真实物流订单");
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({
    ok:true,
    lowPriceDefault:"cainiao",
    manualOverridePersisted:"sf",
    resetToAutomatic:"cainiao",
    previousManualChoiceMigrated:"sf",
    authorizationStillRequired:true,
    createOrderCalls,
  }));
} finally {
  await browser.close();
}
