import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-address-auth-regression.mjs <url> <node_modules>");

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
      version:"test-address-auth",
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
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "20");
    localStorage.setItem("mxiqi-public-demo-settings-v2", JSON.stringify({
      sfThreshold:2000,
      defaultGoodsName:"章牌",
      defaultPackageWeightKg:0.8,
      sfSenderName:"甄元旭",
      sfSenderPhone:"15201638190",
      sfSenderAddress:"北京市门头沟区三家店东街五十号院2-1-202",
    }));
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([{
      id:"address-tail-name",
      lot:95,
      itemName:"PCGS-MS64 1878年摩根银元",
      sellerWechat:"测试送拍人",
      sellerPhone:"13800000000",
      auctionAt:"2026-08-12 20:00",
      auctionPeriodOverride:"第79期",
      finalOutcome:"成交",
      finalPrice:2530,
      paymentStatus:"已付款",
      buyerName:"测试买家",
      buyerPhone:"13900000000",
      recipientRaw:"黑龙江省 佳木斯市 前进区 永安街道 唐人中心小区F栋楼1单元613室 刘野 13845470978",
      recipientName:"",
      recipientPhone:"13845470978",
      addressStatus:"needs_correction",
      shippingCarrier:"sf",
      shippingGoodsName:"章牌",
      shipmentWeightKg:0.8,
      mxiqiShippingStatus:"",
    }]));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
    localStorage.setItem("mxiqi-public-demo-history-v1", "[]");
  });

  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});
  await page.click('[data-stage="shipping"]');
  await page.click("#shipping-next-sf");
  await page.waitForFunction(() => document.querySelector("#shipping-logistics-status")?.textContent.includes("待本机授权"));

  await page.click("#shipping-split-address");
  assert.equal(await page.locator('#shipping-form [name="recipientName"]').inputValue(), "刘野");
  assert.equal(await page.locator('#shipping-form [name="recipientPhone"]').inputValue(), "13845470978");
  assert.equal(await page.locator('#shipping-form [name="addressProvince"]').inputValue(), "黑龙江省");
  assert.equal(await page.locator('#shipping-form [name="addressCity"]').inputValue(), "佳木斯市");
  assert.equal(await page.locator('#shipping-form [name="addressDistrict"]').inputValue(), "前进区");
  assert.equal(await page.locator('#shipping-form [name="addressDetail"]').inputValue(), "永安街道唐人中心小区F栋楼1单元613室");

  await page.click("#shipping-review-address");
  assert.match(await page.locator("#shipping-logistics-status").innerText(), /顺丰服务已连接.*待本机授权/);
  assert.match(await page.locator("#shipping-order-note").innerText(), /服务已连接.*尚未完成操作授权/);
  assert.equal(await page.locator("#shipping-open-authorization").isVisible(), true);
  assert.match(await page.locator("#shipping-create-order").innerText(), /服务已连接.*待授权/);
  assert.equal(await page.locator("#shipping-create-order").isDisabled(), true);

  await page.click("#shipping-open-authorization");
  assert.equal(await page.locator("#settings-dialog").getAttribute("open"), "");
  assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("name")), "logisticsOperatorKey");

  assert.equal(createOrderCalls, 0, "回归测试不得提交真实物流订单");
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({ok:true,addressSplit:true,authorizationStateClear:true,createOrderCalls}));
} finally {
  await browser.close();
}
