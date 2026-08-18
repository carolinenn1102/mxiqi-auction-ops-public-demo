import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";

const [siteUrl, runtimeNodeModules] = process.argv.slice(2);
if (!siteUrl || !runtimeNodeModules) {
  throw new Error("usage: node browser-birthday-eligibility-regression.mjs <url> <node_modules>");
}

const requireFromRuntime = createRequire(path.join(runtimeNodeModules, "playwright", "package.json"));
const { chromium } = requireFromRuntime("playwright");
const browser = await chromium.launch({
  executablePath:"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  headless:true,
});

const recordsKey = "mxiqi-public-demo-records-v1";
const settingsKey = "mxiqi-public-demo-settings-v2";
const customersKey = "mxiqi-public-demo-customers-v2";

try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(siteUrl, {waitUntil:"networkidle"});

  await page.evaluate(({recordsKey, settingsKey, customersKey}) => {
    const base = {
      projectName:"生日优惠规则回归",
      auctionPeriodOverride:"第99期",
      auctionAt:"2026-08-07 20:00",
      sellerWechat:"生日测试送拍人",
      sellerPhone:"13900009999",
      birthdayMonth:8,
      finalOutcome:"成交",
      paymentStatus:"已付款",
      settled:false,
    };
    localStorage.clear();
    localStorage.setItem("mxiqi-public-demo-schema", "17");
    localStorage.setItem(recordsKey, JSON.stringify([
      {...base,id:"birthday-low-no-keyword",lot:1,itemName:"生肖纪念章",finalPrice:1500,commissionAmount:-30,settlementAmount:1530,promotion:"生日 · -2%"},
      {...base,id:"birthday-high-no-keyword",lot:2,itemName:"925 银手链",finalPrice:2500,commissionAmount:-50,settlementAmount:2550,promotion:"生日 · -2%"},
      {...base,id:"birthday-ngc-qualified",lot:3,itemName:"NGC-MS62 银币",finalPrice:2500,commissionAmount:200,settlementAmount:2300,promotion:"普通佣金 · 8%"},
      {...base,id:"birthday-pcgs-boundary",lot:4,itemName:"pcgs au58 银币",finalPrice:2000,commissionAmount:160,settlementAmount:1840,promotion:"普通佣金 · 8%"},
      {...base,id:"birthday-ngc-below-threshold",lot:5,itemName:"NGC-MS63 银币",finalPrice:1999,commissionAmount:-39.98,settlementAmount:2038.98,promotion:"生日 · -2%"},
      {...base,id:"outside-birthday-month",lot:6,itemName:"NGC-MS64 银币",auctionAt:"2026-07-06 20:00",finalPrice:2500,commissionAmount:-50,settlementAmount:2550,promotion:"生日 · -2%"},
    ]));
    localStorage.setItem(settingsKey, JSON.stringify({
      defaultCommissionType:"percent",defaultCommissionValue:8,
      lowPriceThreshold:100,lowPriceFee:5,
      birthdayCommissionType:"percent",birthdayCommissionValue:-2,birthdayLabel:"生日",
      boxRebateThreshold:1000,boxRebateKeywords:"NGC,PCGS",boxRebateValue:1,
      boxRebateThreshold2:0,boxRebateValue2:0,boxRebateThreshold3:0,boxRebateValue3:0,boxRebateThreshold4:0,boxRebateValue4:0,
      returnHandlingFee:8,sfThreshold:2000,defaultGoodsName:"章牌",defaultPackageWeightKg:0.8,
    }));
    localStorage.setItem(customersKey, JSON.stringify({"生日测试送拍人":{phone:"13900009999",birthdayMonth:8}}));
    localStorage.setItem("mxiqi-public-demo-assets-v1", "[]");
  }, {recordsKey, settingsKey, customersKey});
  await page.reload({waitUntil:"networkidle"});

  const result = await page.evaluate(({recordsKey, settingsKey}) => ({
    schema:localStorage.getItem("mxiqi-public-demo-schema"),
    records:JSON.parse(localStorage.getItem(recordsKey) || "[]"),
    settings:JSON.parse(localStorage.getItem(settingsKey) || "{}"),
  }), {recordsKey, settingsKey});
  const byId = Object.fromEntries(result.records.map((record) => [record.id, record]));
  assert.equal(result.schema, "22");
  assert.equal(result.settings.birthdayThreshold, 2000);
  assert.equal(result.settings.birthdayKeywords, "NGC,PCGS");

  assert.equal(byId["birthday-low-no-keyword"].commissionAmount, 120);
  assert.equal(byId["birthday-low-no-keyword"].settlementAmount, 1380);
  assert.match(byId["birthday-low-no-keyword"].promotion, /^普通佣金/);
  assert.equal(byId["birthday-high-no-keyword"].commissionAmount, 200);
  assert.match(byId["birthday-high-no-keyword"].promotion, /^普通佣金/);

  assert.equal(byId["birthday-ngc-qualified"].commissionAmount, -50);
  assert.equal(byId["birthday-ngc-qualified"].settlementAmount, 2550);
  assert.match(byId["birthday-ngc-qualified"].promotion, /^生日/);
  assert.equal(byId["birthday-pcgs-boundary"].commissionAmount, -40);
  assert.match(byId["birthday-pcgs-boundary"].promotion, /^生日/);

  assert.equal(byId["birthday-ngc-below-threshold"].commissionAmount, -19.99);
  assert.match(byId["birthday-ngc-below-threshold"].promotion, /^NP优惠/);
  assert.doesNotMatch(byId["birthday-ngc-below-threshold"].promotion, /生日/);
  assert.equal(byId["outside-birthday-month"].commissionAmount, -25);
  assert.match(byId["outside-birthday-month"].promotion, /^NP优惠/);

  await page.click("#open-settings");
  assert.equal(await page.inputValue('#settings-form input[name="birthdayThreshold"]'), "2000");
  assert.equal(await page.inputValue('#settings-form input[name="birthdayKeywords"]'), "NGC,PCGS");
  const preview = await page.locator("#birthday-rule-preview").innerText();
  assert.match(preview, /生日月/);
  assert.match(preview, /2,000/);
  assert.match(preview, /NGC,PCGS/);
  assert.match(preview, /缺少任一条件都不使用生日优惠/);
  assert.deepEqual(pageErrors, []);

  process.stdout.write(JSON.stringify({
    ok:true,
    schema:result.schema,
    ordinaryWithoutKeyword:2,
    birthdayQualified:2,
    birthdayRejectedBelowThreshold:1,
    birthdayRejectedOutsideMonth:1,
  }));
} finally {
  await browser.close();
}
