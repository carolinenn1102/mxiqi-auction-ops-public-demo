import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) throw new Error("usage: node browser-shipping-carrier-ready-actions-regression.mjs <url> <node_modules>");

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
      authorized:true,
      version:"test-ready-actions",
      capabilities:["createLogisticsOrder"],
      providers:{
        sf:{configured:true,productName:"contract-test-product"},
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
    localStorage.setItem("mxiqi-public-demo-schema", "19");
    localStorage.setItem("mxiqi-public-demo-settings-v2", JSON.stringify({
      sfThreshold:2000,
      defaultGoodsName:"章牌",
      defaultPackageWeightKg:0.8,
      sfSenderName:"测试寄件人",
      sfSenderPhone:"13812345678",
      sfSenderAddress:"北京市门头沟区测试路1号",
      cainiaoSenderName:"测试寄件人",
      cainiaoSenderPhone:"13812345678",
      cainiaoSenderAddress:"北京市门头沟区测试路1号",
    }));
    const base = {
      sellerWechat:"测试送拍人",
      sellerPhone:"13800000000",
      auctionAt:"2026-08-10 20:00",
      auctionPeriodOverride:"第80期",
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
      shippingGoodsName:"章牌",
      shipmentWeightKg:0.8,
      mxiqiShippingStatus:"",
    };
    localStorage.setItem("mxiqi-public-demo-records-v1", JSON.stringify([
      {...base,id:"sf-ready",lot:1,itemName:"顺丰检查通过拍品",finalPrice:3000,mxiqiOrderId:"SF-READY-1",shippingCarrier:"sf",addressStatus:"reviewed"},
      {...base,id:"sf-address",lot:2,itemName:"顺丰地址待审拍品",finalPrice:2600,mxiqiOrderId:"SF-ADDRESS-2",shippingCarrier:"sf",addressStatus:"pending_review"},
      {...base,id:"cainiao-ready",lot:3,itemName:"菜鸟接口未接通拍品",finalPrice:300,mxiqiOrderId:"CN-READY-3",shippingCarrier:"cainiao",addressStatus:"reviewed"},
    ]));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
    localStorage.setItem("mxiqi-public-demo-history-v1", "[]");
  });

  await page.goto(siteUrl, {waitUntil:"domcontentloaded"});
  await page.click('[data-stage="shipping"]');
  await page.waitForFunction(() => document.querySelector("#shipping-next-sf")?.classList.contains("ready-to-order"));

  assert.equal(await page.locator("#shipping-sf-pending-count").innerText(), "2");
  assert.equal(await page.locator("#shipping-sf-address-count").innerText(), "1");
  assert.equal(await page.locator("#shipping-sf-ready-count").innerText(), "1");
  assert.match(await page.locator("#shipping-next-sf").innerText(), /顺丰检查通过.*点击下单/);
  assert.match(await page.locator("#shipping-sf-card").getAttribute("class"), /ready-to-order/);
  const sfButtonColor = await page.locator("#shipping-next-sf").evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.equal(sfButtonColor, "rgb(38, 116, 91)");
  const sfCardBox = await page.locator("#shipping-sf-card").boundingBox();
  const cainiaoCardBox = await page.locator("#shipping-cainiao-card").boundingBox();
  assert.ok(sfCardBox && cainiaoCardBox && sfCardBox.x + sfCardBox.width <= cainiaoCardBox.x, "顺丰和菜鸟卡片应在桌面端分栏显示");

  assert.equal(await page.locator("#shipping-cainiao-pending-count").innerText(), "1");
  assert.equal(await page.locator("#shipping-cainiao-ready-count").innerText(), "1");
  assert.doesNotMatch(await page.locator("#shipping-next-cainiao").getAttribute("class"), /ready-to-order/);
  assert.match(await page.locator("#shipping-next-cainiao").innerText(), /查看未通过项/);
  assert.match(await page.locator("#shipping-cainiao-status").innerText(), /菜鸟真实接口未配置/);

  await page.click("#shipping-next-sf");
  assert.equal(await page.locator("#shipping-dialog").getAttribute("open"), "");
  assert.match(await page.locator("#shipping-title").innerText(), /顺丰检查通过拍品/);
  assert.equal(await page.locator("#shipping-create-order").isEnabled(), true);
  assert.match(await page.locator("#shipping-create-order").getAttribute("class"), /ready-to-order/);
  assert.match(await page.locator("#shipping-create-order").innerText(), /顺丰检查通过.*点击下单/);
  assert.match(await page.locator("#shipping-order-note").innerText(), /点击绿色按钮后才会创建订单/);
  const sfPolicy = await page.locator("#shipping-order-policy").innerText();
  assert.match(sfPolicy, /contract-test-product/);
  assert.match(sfPolicy, /0\.8kg/);
  assert.match(sfPolicy, /18:00/);
  assert.match(sfPolicy, /10:00/);
  await page.click("#shipping-dialog [data-close-dialog]");

  await page.click("#shipping-next-cainiao");
  assert.equal(await page.locator("#shipping-dialog").getAttribute("open"), "");
  assert.match(await page.locator("#shipping-title").innerText(), /菜鸟接口未接通拍品/);
  assert.equal(await page.locator("#shipping-create-order").isDisabled(), true);
  assert.doesNotMatch(await page.locator("#shipping-create-order").getAttribute("class"), /ready-to-order/);
  assert.match(await page.locator("#shipping-order-note").innerText(), /菜鸟真实接口未配置/);

  assert.equal(createOrderCalls, 0, "浏览器回归不得提交真实物流订单");
  assert.deepEqual(errors, []);
  process.stdout.write(JSON.stringify({
    ok:true,
    sfReady:true,
    sfButtonColor,
    sfPolicyVisible:true,
    cainiaoBlocked:true,
    addressPendingSeparated:true,
    createOrderCalls,
  }));
} finally {
  await browser.close();
}
