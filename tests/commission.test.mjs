import test from "node:test";
import assert from "node:assert/strict";
import commission from "../commission-core.js";
import workflow from "../workflow-core.js";

const settings = {
  defaultCommissionType: "percent",
  defaultCommissionValue: 8,
  lowPriceThreshold: 100,
  lowPriceFee: 5,
  birthdayCommissionType: "percent",
  birthdayCommissionValue: 5,
  birthdayLabel: "生日月优惠",
  birthdayThreshold: 2000,
  birthdayKeywords: "NGC, PCGS",
  boxRebateThreshold: 1000,
  boxRebateKeywords: "NGC, PCGS",
  boxRebateValue: 1,
  returnHandlingFee: 8,
};

test("charges the configurable fixed fee below the low-price threshold", () => {
  const plan = commission.calculate({gross:70,birthdayMonth:0,auctionMonth:7,settings});
  assert.equal(plan.amount, 5);
  assert.equal(plan.isLowPrice, true);
  assert.equal(plan.label, "低价固定佣金");
});

test("fixed low-price fee can make the seller settlement negative", () => {
  const plan = commission.calculate({gross:4,birthdayMonth:0,auctionMonth:7,settings});
  assert.equal(plan.amount, 5);
  assert.equal(4 - plan.amount, -1);
});

test("birthday month alone does not activate the birthday discount below the threshold", () => {
  const plan = commission.calculate({gross:70,birthdayMonth:7,auctionMonth:7,title:"NGC 银币",settings});
  assert.equal(plan.amount, 5);
  assert.equal(plan.isBirthdayMonth, true);
  assert.equal(plan.isBirthday, false);
  assert.equal(plan.isLowPrice, true);
});

test("birthday discount requires both the price threshold and an NGC or PCGS keyword", () => {
  const belowThreshold = commission.calculate({gross:1999,birthdayMonth:7,auctionMonth:7,title:"NGC 银币",settings});
  const missingKeyword = commission.calculate({gross:2500,birthdayMonth:7,auctionMonth:7,title:"生肖纪念章",settings});
  const eligibleNgc = commission.calculate({gross:2000,birthdayMonth:7,auctionMonth:7,title:"NGC-MS62 银币",settings});
  const eligiblePcgs = commission.calculate({gross:2500,birthdayMonth:7,auctionMonth:7,title:"pcgs au58 银币",settings});
  assert.equal(belowThreshold.isBirthday, false);
  assert.equal(missingKeyword.isBirthday, false);
  assert.equal(missingKeyword.amount, 200);
  assert.equal(eligibleNgc.isBirthday, true);
  assert.equal(eligibleNgc.amount, 100);
  assert.equal(eligiblePcgs.isBirthday, true);
  assert.equal(eligiblePcgs.amount, 125);
});

test("recognizes configurable box keywords", () => {
  assert.equal(commission.hasBoxRebate({gross:1361,title:"NGC-MS62 日本龙洋",settings}), true);
  assert.equal(commission.hasBoxRebate({gross:999,title:"PCGS-MS62 银币",settings}), false);
});

test("birthday rebate takes priority when a birthday item also qualifies for NP", () => {
  const rebateSettings = {...settings,birthdayCommissionValue:-2};
  const plan = commission.calculate({gross:2500,birthdayMonth:7,auctionMonth:7,title:"NGC-MS62 银币",settings:rebateSettings});
  assert.equal(plan.amount, -50);
  assert.equal(plan.isBoxRebate, false);
  assert.equal(plan.isBoxRebateEligible, true);
  assert.equal(2500 - plan.amount, 2550);
});

test("NP rebate applies independently outside the birthday month", () => {
  const plan = commission.calculate({gross:1539,birthdayMonth:7,auctionMonth:8,title:"NGC-UNCD 德国银币",settings});
  assert.equal(plan.amount, -15.39);
  assert.equal(plan.label, "NP优惠");
  assert.equal(plan.isBoxRebate, true);
  assert.equal(1539 - plan.amount, 1554.39);
});

test("NP rebate tiers use the highest qualifying threshold regardless of input order", () => {
  const tiered = {
    ...settings,
    boxRebateThreshold:1000,boxRebateValue:1,
    boxRebateThreshold2:5000,boxRebateValue2:2,
    boxRebateThreshold3:2000,boxRebateValue3:1.5,
    boxRebateThreshold4:10000,boxRebateValue4:0,
  };
  assert.deepEqual(commission.rebateTiers(tiered).map(({threshold,value}) => [threshold,value]), [
    [5000,2],[2000,1.5],[1000,1],
  ]);
  assert.equal(commission.calculate({gross:1500,title:"PCGS 银币",settings:tiered}).amount, -15);
  assert.equal(commission.calculate({gross:2500,title:"NGC 银币",settings:tiered}).amount, -37.5);
  assert.equal(commission.calculate({gross:6000,title:"NGC 银币",settings:tiered}).amount, -120);
});

test("zero-valued NP tiers are disabled", () => {
  const disabled = {...settings,boxRebateValue:0,boxRebateThreshold2:2000,boxRebateValue2:0};
  const plan = commission.calculate({gross:3000,title:"NGC 银币",settings:disabled});
  assert.equal(plan.isBoxRebate, false);
  assert.equal(plan.label, "普通佣金");
  assert.equal(plan.amount, 240);
});

test("return handling fee is charged per lot", () => {
  const plan = commission.calculate({gross:0,isReturn:true,settings});
  assert.equal(plan.amount, 8);
  assert.equal(plan.label, "拖回处理费");
  assert.equal(plan.isReturn, true);
});

test("an unpaid return stays at minus eight in the settlement bill after later handling", () => {
  ["拖回/发回","拖回/再拍","拖回/等待"].forEach((returnDisposition) => {
    const record = {unpaidReturn:true,returnDisposition,finalPrice:49288};
    const gross = workflow.settlementGross(record);
    const plan = commission.calculate({gross,isReturn:workflow.isReturnRecord(record),settings});
    assert.equal(plan.amount, 8);
    assert.equal(gross - plan.amount, -8);
  });
});

test("stored items bypass return commission and settlement", () => {
  const record = {unpaidReturn:true,returnDisposition:"寄存",finalOutcome:"待拍",finalPrice:49288};
  assert.equal(workflow.isReturnRecord(record), false);
  assert.equal(workflow.settlementGross(record), 0);
  assert.equal(workflow.isSettlementEligible(record), false);
});
