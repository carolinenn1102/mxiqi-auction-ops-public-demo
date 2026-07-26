import test from "node:test";
import assert from "node:assert/strict";
import workflow from "../workflow-core.js";

test("extracts the auction period from the Mxiqi project title", () => {
  assert.equal(workflow.auctionPeriod({projectName:'甄臻铺“甄品场”-世界币章拍卖（第75期）'}), "第75期");
  assert.equal(workflow.auctionPeriod({projectName:"长期征集拍品"}), "期数待补");
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
