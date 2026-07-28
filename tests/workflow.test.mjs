import test from "node:test";
import assert from "node:assert/strict";
import workflow from "../workflow-core.js";

test("extracts the auction period from the Mxiqi project title", () => {
  assert.equal(workflow.auctionPeriod({projectName:'甄臻铺“甄品场”-世界币章拍卖（第75期）'}), "第75期");
  assert.equal(workflow.auctionPeriod({projectName:"ANACS-AU58 1923年美国和平银币",auctionAt:"260730 周四, 76期"}), "第76期");
  assert.equal(workflow.auctionPeriod({projectName:"长期征集拍品"}), "期数待补");
});

test("normalizes tracker special outcomes without losing the exact disposition", () => {
  assert.deepEqual(workflow.trackerOutcome("拖回/再拍", 0), {finalOutcome:"拖回",returnDisposition:"拖回/再拍"});
  assert.deepEqual(workflow.trackerOutcome("寄存", 0), {finalOutcome:"待拍",returnDisposition:"寄存"});
  assert.deepEqual(workflow.trackerOutcome("", 0), {finalOutcome:"待拍",returnDisposition:""});
});

test("blank unsold records are exposed as pending auction", () => {
  assert.equal(workflow.recordStatus({finalOutcome:"",finalPrice:0}), "待拍");
  assert.equal(workflow.recordStatus({returnDisposition:"寄存",finalOutcome:"待拍",finalPrice:0}), "寄存");
});

test("return records remain settlement eligible with zero transaction gross", () => {
  const record = {finalOutcome:"成交",finalPrice:860,returnDisposition:"拖回/再拍"};
  assert.equal(workflow.isReturnRecord(record), true);
  assert.equal(workflow.settlementGross(record), 0);
  assert.equal(workflow.isSettlementEligible(record), true);
});

test("shipping bucket exposes shipped and unshipped filters", () => {
  assert.equal(workflow.shippingBucket({outboundTrackingNumber:"SF123"}), "shipped");
  assert.equal(workflow.shippingBucket({mxiqiShippingStatus:"filled"}), "shipped");
  assert.equal(workflow.shippingBucket({}), "unshipped");
});

test("payment state is exposed before the final outcome and becomes overdue after the deadline", () => {
  const record = {finalOutcome:"成交",finalPrice:860,paymentStatus:"待付款",paymentDueAt:"2026-07-29T20:00:00+08:00"};
  assert.equal(workflow.recordStatus(record, new Date("2026-07-29T19:00:00+08:00")), "待付款");
  assert.equal(workflow.recordStatus(record, new Date("2026-07-29T21:00:00+08:00")), "超时未付款");
});

test("return disposition takes priority over payment state", () => {
  const record = {finalOutcome:"成交",finalPrice:860,paymentStatus:"待付款",paymentDueAt:"2026-07-20T20:00:00+08:00",returnDisposition:"拖回/再拍"};
  assert.equal(workflow.recordStatus(record, new Date("2026-07-29T21:00:00+08:00")), "拖回/再拍");
});
