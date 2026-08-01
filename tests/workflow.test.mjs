import test from "node:test";
import assert from "node:assert/strict";
import workflow from "../workflow-core.js";

test("extracts the auction period from the Mxiqi project title", () => {
  assert.equal(workflow.auctionPeriod({projectName:'甄臻铺“甄品场”-世界币章拍卖（第75期）'}), "第75期");
  assert.equal(workflow.auctionPeriod({projectName:"ANACS-AU58 1923年美国和平银币",auctionAt:"260730 周四, 76期"}), "第76期");
  assert.equal(workflow.auctionPeriod({projectName:"长期征集拍品"}), "期数待补");
});

test("manual auction period overrides platform text for a relisted item", () => {
  assert.equal(workflow.auctionPeriod({auctionPeriodOverride:"76",projectName:"第75期"}), "第76期");
  assert.equal(workflow.auctionPeriod({auctionPeriodOverride:"第 81 期",projectName:"第75期"}), "第81期");
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

test("relisting preserves the previous return settlement and resets the new auction round", () => {
  const relisted = workflow.relistRecord({finalOutcome:"成交",returnDisposition:"拖回/再拍",finalPrice:1160,paymentStatus:"已付款",settled:true,commissionAmount:8,settlementAmount:-8,settlementNote:"已扣拖回费"}, "2026-07-29T10:00:00.000Z");
  assert.deepEqual(relisted.priorReturnSettlement, {finalOutcome:"成交",returnDisposition:"拖回/再拍",finalPrice:1160,settled:true,settledAt:"",commissionAmount:8,settlementAmount:-8,promotion:"",settlementNote:"已扣拖回费",unpaidReturn:false,unpaidReturnDetectedAt:"",buyerName:"",buyerPhone:"",recipientName:"",recipientPhone:"",recipientRaw:"",mxiqiOrderId:"",outboundTrackingNumber:""});
  assert.equal(relisted.finalOutcome, "待拍");
  assert.equal(relisted.returnDisposition, "");
  assert.equal(relisted.finalPrice, 0);
  assert.equal(relisted.paymentStatus, "");
  assert.equal(relisted.settled, false);
  assert.equal(workflow.recordStatus(relisted), "上拍");
  assert.equal(workflow.isSettlementEligible(relisted), false);
});

test("same Lot is unique only inside the same auction period", () => {
  assert.equal(workflow.sameAuctionLot({lot:48,projectName:"第75期"},{lot:48,auctionPeriodOverride:"75"}), true);
  assert.equal(workflow.sameAuctionLot({lot:48,projectName:"第75期"},{lot:48,auctionPeriodOverride:"第76期"}), false);
});

test("hidden local and connector copies of the same auction Lot are merged", () => {
  const records = [
    {
      id:"local-57",lot:57,itemName:"拍品",projectName:"第76期",
      sellerWechat:"送拍人",returnDisposition:"拖回/再拍",platformItemKey:"",
    },
    {
      id:"connector-57",lot:57,itemName:"拍品",auctionPeriodOverride:"第76期",
      sellerWechat:"待补送拍人",platformItemKey:"order-57:57:0",mxiqiOrderId:"order-57",
    },
    {id:"other-period",lot:57,itemName:"另一场拍品",projectName:"第75期"},
  ];
  const result = workflow.deduplicateAuctionLots(records);
  assert.equal(result.removed, 1);
  assert.equal(result.records.length, 2);
  assert.equal(result.idMap["connector-57"], "local-57");
  const merged = result.records.find((item) => item.id === "local-57");
  assert.equal(merged.returnDisposition, "拖回/再拍");
  assert.equal(merged.sellerWechat, "送拍人");
  assert.equal(merged.platformItemKey, "order-57:57:0");
  assert.equal(merged.mxiqiOrderId, "order-57");
});

test("period settlement matching handles unpaid first and keeps the fixed return marker", () => {
  const records = [
    {id:"p75",lot:48,itemName:"同名拍品",projectName:"第75期",sellerWechat:"甲"},
    {id:"p76",lot:48,itemName:"同名拍品",projectName:"第76期",sellerWechat:"乙"},
  ];
  const deals = [{lot:48,itemName:"同名拍品",auctionPeriodOverride:"第75期",finalPrice:49288,finalOutcome:"成交",paymentStatus:"已付款"}];
  const pending = [{lot:48,itemName:"同名拍品",projectName:"第75期",paymentStatus:"待付款"}];
  const result = workflow.applyAuctionSettlementResults(records,deals,pending,"第75期","2026-07-29T12:00:00.000Z");
  assert.equal(result.unpaid, 1);
  assert.equal(result.records.find((item) => item.id === "p75").unpaidReturn, true);
  assert.equal(result.records.find((item) => item.id === "p75").returnDisposition, "拖回/等待");
  assert.equal(workflow.settlementGross(result.records.find((item) => item.id === "p75")), 0);
  assert.equal(result.records.find((item) => item.id === "p76").unpaidReturn, undefined);
});

test("settlement sync preserves return dispositions already handled by the operator", () => {
  for (const returnDisposition of ["拖回/发回", "拖回/再拍"]) {
    const records = [{
      id:`handled-${returnDisposition}`,lot:48,itemName:"已处理拍品",projectName:"第76期",
      finalOutcome:"拖回",finalPrice:49288,paymentStatus:"待付款",unpaidReturn:true,returnDisposition,
    }];
    const deals = [{
      lot:48,itemName:"已处理拍品",auctionPeriodOverride:"第76期",
      finalPrice:49288,finalOutcome:"成交",paymentStatus:"已付款",
    }];
    const result = workflow.applyAuctionSettlementResults(records,deals,[],"第76期","2026-07-30T12:00:00.000Z");
    const record = result.records[0];
    assert.equal(record.returnDisposition, returnDisposition);
    assert.equal(record.finalOutcome, "拖回");
    assert.equal(record.paymentStatus, "已付款");
    assert.equal(record.unpaidReturn, false);
    assert.equal(workflow.settlementGross(record), 0);
    assert.equal(workflow.recordStatus(record), returnDisposition);
  }
});

test("settlement sync only clears the automatic waiting marker after payment", () => {
  const records = [{
    id:"waiting",lot:48,itemName:"待付款拍品",projectName:"第76期",
    finalOutcome:"拖回",finalPrice:882,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/等待",
  }];
  const deals = [{
    lot:48,itemName:"待付款拍品",auctionPeriodOverride:"第76期",
    finalPrice:882,finalOutcome:"成交",paymentStatus:"已付款",
  }];
  const result = workflow.applyAuctionSettlementResults(records,deals,[],"第76期","2026-07-30T12:00:00.000Z");
  assert.equal(result.records[0].returnDisposition, "");
  assert.equal(result.records[0].finalOutcome, "成交");
  assert.equal(result.records[0].paymentStatus, "已付款");
});

test("handled return dispositions overwritten by an old sync can be restored from history", () => {
  const current = [{
    id:"lot-48",lot:48,itemName:"拍品",projectName:"第76期",source:"mxiqi_connector",
    sourceUpdatedAt:"2026-07-31T12:00:00.000Z",finalOutcome:"成交",finalPrice:49288,
    paymentStatus:"已付款",returnDisposition:"",settled:false,
  }];
  const history = [{records:[{
    id:"lot-48",lot:48,itemName:"拍品",projectName:"第76期",finalOutcome:"拖回",
    finalPrice:49288,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/再拍",
  }]}];
  const result = workflow.restoreHandledReturnDispositions(current,history,"2026-08-01T00:00:00.000Z");
  assert.equal(result.restored, 1);
  assert.equal(result.records[0].returnDisposition, "拖回/再拍");
  assert.equal(result.records[0].finalOutcome, "拖回");
  assert.equal(result.records[0].paymentStatus, "已付款");
  assert.equal(workflow.settlementGross(result.records[0]), 0);
});

test("settlement sync never replaces an existing consignor with blank platform fields", () => {
  const records = [{
    id:"p76-lot21",lot:21,itemName:"拍品",projectName:"第76期",
    sellerWechat:"Ryan-",sellerPhone:"17751263710",birthdayMonth:7,contactedAt:"2026-07-20",
  }];
  const deals = [{
    lot:21,itemName:"拍品",auctionPeriodOverride:"第76期",finalPrice:1160,
    finalOutcome:"成交",paymentStatus:"已付款",sellerWechat:"",sellerPhone:"",birthdayMonth:0,
  }];
  const result = workflow.applyAuctionSettlementResults(records,deals,[],"第76期","2026-07-30T12:00:00.000Z");
  const record = result.records[0];
  assert.equal(record.sellerWechat, "Ryan-");
  assert.equal(record.sellerPhone, "17751263710");
  assert.equal(record.birthdayMonth, 7);
  assert.equal(record.contactedAt, "2026-07-20");
  assert.equal(record.finalPrice, 1160);
});

test("missing consignors can be restored from local history by period and Lot", () => {
  const current = [{id:"now",lot:21,itemName:"拍品",projectName:"第76期",sellerWechat:"",sellerPhone:""}];
  const history = [{records:[{id:"old",lot:21,itemName:"拍品旧标题",projectName:"第76期",sellerWechat:"Ryan-",sellerPhone:"17751263710"}]}];
  const restored = workflow.restoreConsignorIdentities(current,history,{"Ryan-":{birthdayMonth:7}});
  assert.equal(restored.restored, 1);
  assert.equal(restored.records[0].sellerWechat, "Ryan-");
  assert.equal(restored.records[0].sellerPhone, "17751263710");
  assert.equal(restored.records[0].birthdayMonth, 7);
});

test("unpaid return remains a return after choosing any later disposition", () => {
  ["拖回/发回","拖回/再拍","拖回/等待"].forEach((returnDisposition) => {
    assert.equal(workflow.isReturnRecord({unpaidReturn:true,returnDisposition,finalOutcome:"成交",finalPrice:100}), true);
  });
  const stored = {unpaidReturn:true,returnDisposition:"寄存",finalOutcome:"待拍",finalPrice:100};
  assert.equal(workflow.isStorageRecord(stored), true);
  assert.equal(workflow.isReturnRecord(stored), false);
  assert.equal(workflow.settlementGross(stored), 0);
  assert.equal(workflow.isSettlementEligible(stored), false);
});

test("period settlement waits for unpaid and unresolved returns", () => {
  const records = [
    {id:"paid",lot:1,itemName:"已付款",projectName:"第76期",finalOutcome:"成交",finalPrice:100,paymentStatus:"已付款"},
    {id:"unpaid",lot:2,itemName:"待付款",projectName:"第76期",finalOutcome:"成交",finalPrice:200,paymentStatus:"待付款"},
    {id:"waiting",lot:3,itemName:"拖回待处理",projectName:"第76期",finalOutcome:"拖回",finalPrice:0,returnDisposition:"拖回/等待"},
    {id:"other",lot:4,itemName:"其他期",projectName:"第75期",finalOutcome:"成交",finalPrice:300,paymentStatus:"待付款"},
  ];
  const gate = workflow.settlementReadiness(records, "第76期");
  assert.equal(gate.ready, false);
  assert.equal(gate.pendingPayment, 1);
  assert.equal(gate.pendingReturn, 1);
  assert.deepEqual(gate.blockers.map((item) => [item.lot,item.reason]), [[2,"待付款"],[3,"拖回/等待"]]);
});

test("resolved returns and paid split orders can settle", () => {
  const records = [
    {id:"sent",lot:1,itemName:"拖回发回",projectName:"第76期",finalOutcome:"拖回",finalPrice:500,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/发回"},
    {id:"relist",lot:2,itemName:"拖回再拍",projectName:"第76期",finalOutcome:"拖回",finalPrice:600,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/再拍"},
    {id:"stored",lot:3,itemName:"拖回寄存",projectName:"第76期",finalOutcome:"拖回",finalPrice:700,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"寄存"},
    {id:"split",lot:4,itemName:"已付款拆单",projectName:"第76期",finalOutcome:"成交",finalPrice:800,paymentStatus:"已付款",returnDisposition:"拆单"},
  ];
  assert.equal(workflow.settlementReadiness(records, "76").ready, true);
  assert.equal(workflow.settlementReadiness(records, "").ready, false);
  assert.equal(workflow.settlementBlocker({...records[3],paymentStatus:"待付款"}), "拆单待付款");
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

test("a complete wait-pay refresh removes departed orders from the pending count", () => {
  const oldRecord = {id:"r1",source:"mxiqi_connector",platformItemKey:"o1:1:0",paymentStatus:"待付款",finalOutcome:"成交",finalPrice:100};
  const result = workflow.reconcileAuthoritativeScope([oldRecord], [], "waitpay", true, "2026-07-29T08:00:00.000Z");
  assert.equal(result.departed, 1);
  assert.equal(result.records[0].paymentStatus, "已付款");
  assert.equal(result.records[0].mxiqiOrderStatus, "已离开待付款");
});

test("a complete wait-shipping refresh marks absent orders as shipped", () => {
  const oldRecord = {id:"r1",source:"mxiqi_connector",platformItemKey:"o1:1:0",paymentStatus:"已付款",finalOutcome:"成交",finalPrice:100,mxiqiShippingStatus:"pending"};
  const result = workflow.reconcileAuthoritativeScope([oldRecord], [], "waitexpress", true, "2026-07-29T08:00:00.000Z");
  assert.equal(result.departed, 1);
  assert.equal(result.records[0].mxiqiShippingStatus, "filled");
  assert.equal(workflow.shippingBucket(result.records[0]), "shipped");
});

test("partial platform refresh never clears absent local states", () => {
  const oldRecord = {id:"r1",source:"mxiqi_connector",platformItemKey:"o1:1:0",paymentStatus:"待付款",finalOutcome:"成交",finalPrice:100};
  const result = workflow.reconcileAuthoritativeScope([oldRecord], [], "waitpay", false);
  assert.equal(result.departed, 0);
  assert.equal(result.records[0].paymentStatus, "待付款");
});
