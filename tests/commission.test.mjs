import test from "node:test";
import assert from "node:assert/strict";
import commission from "../commission-core.js";

const settings = {
  defaultCommissionType: "percent",
  defaultCommissionValue: 8,
  lowPriceThreshold: 100,
  lowPriceFee: 5,
  birthdayCommissionType: "percent",
  birthdayCommissionValue: 5,
  birthdayLabel: "生日月优惠",
  boxRebateThreshold: 1000,
  boxRebateKeywords: "NGC, PCGS",
  returnHandlingFee: 8,
};

test("charges the configurable fixed fee below the low-price threshold", () => {
  const plan = commission.calculate({gross:70,birthdayMonth:0,auctionMonth:7,settings});
  assert.equal(plan.amount, 5);
  assert.equal(plan.isLowPrice, true);
  assert.equal(plan.label, "低价固定佣金");
});

test("birthday-month commission takes priority over the low-price rule", () => {
  const plan = commission.calculate({gross:70,birthdayMonth:7,auctionMonth:7,settings});
  assert.equal(plan.amount, 3.5);
  assert.equal(plan.isBirthday, true);
  assert.equal(plan.isLowPrice, false);
});

test("recognizes configurable box keywords", () => {
  assert.equal(commission.hasBoxRebate({gross:1361,title:"NGC-MS62 日本龙洋",settings}), true);
  assert.equal(commission.hasBoxRebate({gross:999,title:"PCGS-MS62 银币",settings}), false);
});

test("negative birthday rebate increases settlement payable for eligible boxes", () => {
  const rebateSettings = {...settings,birthdayCommissionValue:-2};
  const plan = commission.calculate({gross:2500,birthdayMonth:7,auctionMonth:7,title:"NGC-MS62 银币",settings:rebateSettings});
  assert.equal(plan.amount, -50);
  assert.equal(plan.isBoxRebate, true);
  assert.equal(2500 - plan.amount, 2550);
});

test("return handling fee is charged per lot", () => {
  const plan = commission.calculate({gross:0,isReturn:true,settings});
  assert.equal(plan.amount, 8);
  assert.equal(plan.label, "拖回处理费");
  assert.equal(plan.isReturn, true);
});
