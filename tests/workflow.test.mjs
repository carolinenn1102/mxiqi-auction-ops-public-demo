import test from "node:test";
import assert from "node:assert/strict";
import workflow from "../workflow-core.js";

test("extracts the auction period from the Mxiqi project title", () => {
  assert.equal(workflow.auctionPeriod({projectName:'甄臻铺“甄品场”-世界币章拍卖（第75期）'}), "第75期");
  assert.equal(workflow.auctionPeriod({projectName:"ANACS-AU58 1923年美国和平银币",auctionAt:"260730 周四, 76期"}), "第76期");
  assert.equal(workflow.auctionPeriod({projectName:"长期征集拍品"}), "期数待补");
});

test("normalizes the compact auction period used by the 0806 tracker", () => {
  assert.equal(workflow.trackerAuctionPeriod("260806 周四，77期"), "第78期");
  assert.equal(workflow.correctKnown0806AuctionText("260806 周四，77期"), "260806 周四，78期");
  assert.equal(workflow.trackerAuctionPeriod("第 77 期"), "第77期");
  assert.equal(workflow.trackerAuctionPeriod("260806 周四"), "");
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

test("closed auctions with blank results wait for catalog sync instead of looking unauctioned", () => {
  const now = new Date(2026, 7, 5, 12, 0, 0);
  const closed = {auctionAt:"260803 周一，77期",finalOutcome:"待拍",finalPrice:0};
  const upcoming = {auctionAt:"260806 周四，78期",finalOutcome:"待拍",finalPrice:0};
  assert.equal(workflow.isAuctionResultPending(closed, now), true);
  assert.equal(workflow.recordStatus(closed, now), "成交结果待同步");
  assert.equal(workflow.isAuctionResultPending(upcoming, now), false);
  assert.equal(workflow.recordStatus(upcoming, now), "待拍");
  assert.equal(workflow.recordStatus({...closed,finalOutcome:"成交",finalPrice:800}, now), "成交");
  assert.equal(workflow.recordStatus({...closed,finalOutcome:"流拍"}, now), "流拍");
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
  assert.equal(workflow.sameAuctionLot(
    {lot:48,auctionPeriodOverride:"第76期",auctionAt:"2026-07-30"},
    {lot:48,auctionPeriodOverride:"第76期",auctionAt:"2026-08-03"},
  ), false);
});

test("repairs the known 0806 period collision and clears the leaked period-77 settlement", () => {
  const result = workflow.repairKnown0806Import([{
    id:"polluted",lot:8,itemName:"1917年英属埃及银币",sellerWechat:"野",sellerPhone:"13845470978",
    auctionAt:"260806 周四，77期",auctionPeriodOverride:"第77期",platformItemKey:"auction-result:312210:8",
    source:"mxiqi_connector",finalOutcome:"成交",finalPrice:369,paymentStatus:"已付款",buyerName:"错误买家",
    birthdayMonth:8,commissionAmount:-7.38,settlementAmount:376.38,promotion:"生日 · -2%",settled:false,
  }], "2026-08-06T16:00:00.000Z");
  const repaired = result.records[0];
  assert.equal(result.periodCorrected, 1);
  assert.equal(result.settlementCleared, 1);
  assert.equal(result.birthdayPending, 1);
  assert.equal(repaired.auctionPeriodOverride, "第78期");
  assert.equal(repaired.auctionAt, "260806 周四，78期");
  assert.equal(repaired.finalPrice, 0);
  assert.equal(repaired.finalOutcome, undefined);
  assert.equal(repaired.paymentStatus, undefined);
  assert.equal(repaired.buyerName, undefined);
  assert.equal(repaired.birthdayMonth, 0);
  assert.equal(repaired.birthdayPending, true);
  assert.equal(repaired.sellerWechat, "野");
});

test("website order records backfill paid buyer details without losing the imported consignor", () => {
  const result = workflow.mergePlatformOrderRecords([{
    id:"local-8",lot:8,itemName:"1917年英属埃及银币",auctionAt:"260806 周四，78期",
    auctionPeriodOverride:"第78期",sellerWechat:"野",sellerPhone:"13845470978",birthdayPending:true,
  }], [{
    lot:8,itemName:"1917年英属埃及银币",auctionAt:"2026-08-06",auctionPeriodOverride:"第78期",
    platformItemKey:"order-8:8:0",mxiqiOrderId:"order-8",source:"mxiqi_connector",
    finalOutcome:"成交",finalPrice:880,paymentStatus:"已付款",buyerName:"网页买家",buyerPhone:"13900000008",
    recipientName:"收件人",recipientPhone:"13900000008",
  }], "2026-08-06T16:00:00.000Z");
  const merged = result.records[0];
  assert.equal(result.matched, 1);
  assert.equal(result.added, 0);
  assert.equal(merged.id, "local-8");
  assert.equal(merged.sellerWechat, "野");
  assert.equal(merged.birthdayPending, true);
  assert.equal(merged.buyerName, "网页买家");
  assert.equal(merged.paymentStatus, "已付款");
});

test("blank import cells never overwrite existing non-blank business data", () => {
  const existing = {
    id:"existing",
    lot:8,
    itemName:"已有拍品",
    projectName:"第77期",
    received:"是",
    finalOutcome:"成交",
    finalPrice:2500,
    settled:true,
    sellerWechat:"已有送拍人",
    sellerPhone:"13900000001",
  };
  const merged = workflow.mergeImportedRecord(existing, {
    lot:8,
    itemName:"更新后的拍品标题",
    projectName:"第77期",
    received:"",
    finalOutcome:null,
    finalPrice:undefined,
    settled:undefined,
    sellerWechat:"",
    sellerPhone:"",
  });
  assert.equal(merged.itemName, "更新后的拍品标题");
  assert.equal(merged.received, "是");
  assert.equal(merged.finalOutcome, "成交");
  assert.equal(merged.finalPrice, 2500);
  assert.equal(merged.settled, true);
  assert.equal(merged.sellerWechat, "已有送拍人");
  assert.equal(merged.sellerPhone, "13900000001");
});

test("manual paid normal flow clears a cancelled unpaid-return blocker", () => {
  const existing = {
    id:"cancelled",
    lot:19,
    itemName:"已取消平台订单",
    projectName:"第77期",
    finalOutcome:"成交",
    finalPrice:1428,
    paymentStatus:"待付款",
    paymentDueAt:"2026-08-04T20:00",
    unpaidReturn:true,
    unpaidReturnDetectedAt:"2026-08-04T21:00:00.000Z",
    returnDisposition:"拖回/等待",
  };
  const resolved = workflow.applyManualPaymentResolution({
    ...existing,
    paymentStatus:"已付款",
    returnDisposition:"",
  }, existing, "2026-08-05T01:00:00.000Z");
  assert.equal(resolved.paymentStatusManual, true);
  assert.equal(resolved.unpaidReturn, false);
  assert.equal(resolved.unpaidReturnDetectedAt, "");
  assert.equal(resolved.paymentDueAt, "");
  assert.equal(workflow.settlementBlocker(resolved), "");
  assert.equal(workflow.settlementReadiness([resolved], "第77期").ready, true);
});

test("platform imports do not overwrite an explicit manual payment resolution", () => {
  const existing = {
    id:"manual-paid",
    finalOutcome:"成交",
    finalPrice:1428,
    paymentStatus:"已付款",
    paymentStatusManual:true,
    paymentStatusManualAt:"2026-08-05T01:00:00.000Z",
    unpaidReturn:false,
    returnDisposition:"",
  };
  const merged = workflow.mergeImportedRecord(existing, {
    paymentStatus:"待付款",
    unpaidReturn:true,
    returnDisposition:"拖回/等待",
  });
  assert.equal(merged.paymentStatus, "已付款");
  assert.equal(merged.unpaidReturn, false);
  assert.equal(merged.returnDisposition, "");
});

test("settlement sync keeps a manual paid normal-flow order eligible", () => {
  const records = [{
    id:"manual-paid-sync",
    lot:19,
    itemName:"人工确认付款拍品",
    projectName:"第77期",
    finalOutcome:"成交",
    finalPrice:1428,
    paymentStatus:"已付款",
    paymentStatusManual:true,
    paymentStatusManualAt:"2026-08-05T01:00:00.000Z",
    unpaidReturn:false,
    returnDisposition:"",
  }];
  const deals = [{
    lot:19,
    itemName:"人工确认付款拍品",
    auctionPeriodOverride:"第77期",
    finalOutcome:"成交",
    finalPrice:1428,
    paymentStatus:"待付款",
  }];
  const pending = [{
    lot:19,
    itemName:"人工确认付款拍品",
    auctionPeriodOverride:"第77期",
    paymentStatus:"待付款",
  }];
  const result = workflow.applyAuctionSettlementResults(
    records,
    deals,
    pending,
    "第77期",
    "2026-08-05T02:00:00.000Z",
  );
  const record = result.records[0];
  assert.equal(result.unpaid, 0);
  assert.equal(record.paymentStatus, "已付款");
  assert.equal(record.unpaidReturn, false);
  assert.equal(record.returnDisposition, "");
  assert.equal(workflow.settlementBlocker(record), "");
  assert.equal(workflow.settlementReadiness([record], "第77期").ready, true);
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

test("period settlement matching keeps unpaid items in normal flow until the operator chooses", () => {
  const records = [
    {id:"p75",lot:48,itemName:"同名拍品",projectName:"第75期",sellerWechat:"甲"},
    {id:"p76",lot:48,itemName:"同名拍品",projectName:"第76期",sellerWechat:"乙"},
  ];
  const deals = [{lot:48,itemName:"同名拍品",auctionPeriodOverride:"第75期",finalPrice:49288,finalOutcome:"成交",paymentStatus:"已付款"}];
  const pending = [{lot:48,itemName:"同名拍品",projectName:"第75期",paymentStatus:"待付款"}];
  const result = workflow.applyAuctionSettlementResults(records,deals,pending,"第75期","2026-07-29T12:00:00.000Z");
  assert.equal(result.unpaid, 1);
  assert.equal(result.records.find((item) => item.id === "p75").unpaidReturn, false);
  assert.equal(result.records.find((item) => item.id === "p75").returnDisposition, "");
  assert.equal(result.records.find((item) => item.id === "p75").finalOutcome, "成交");
  assert.equal(workflow.recordStatus(result.records.find((item) => item.id === "p75")), "待付款");
  assert.equal(workflow.settlementGross(result.records.find((item) => item.id === "p75")), 49288);
  assert.equal(result.records.find((item) => item.id === "p76").unpaidReturn, undefined);
});

test("settlement sync preserves return dispositions already handled by the operator", () => {
  for (const returnDisposition of ["拖回/发回", "拖回/再拍"]) {
    const records = [{
      id:`handled-${returnDisposition}`,lot:48,itemName:"已处理拍品",projectName:"第76期",
      finalOutcome:"拖回",finalPrice:49288,paymentStatus:"待付款",unpaidReturn:true,returnDisposition,
      returnDispositionConfirmedAt:"2026-07-30T10:00:00.000Z",
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

test("unconfirmed return choices are never treated as an operator decision", () => {
  const unconfirmed = {
    id:"auto-return",lot:6,itemName:"拍品",projectName:"第78期",finalOutcome:"拖回",
    finalPrice:1000,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/发回",
  };
  assert.equal(workflow.recordStatus(unconfirmed), "拖回/等待");
  assert.equal(workflow.settlementBlocker(unconfirmed), "拖回待选择处理方式");
  const reviewed = workflow.requireManualReturnReview([unconfirmed], "2026-08-07T09:00:00.000Z");
  assert.equal(reviewed.reviewRequired, 1);
  assert.equal(reviewed.records[0].returnDisposition, "拖回/等待");
  assert.equal(reviewed.records[0].returnDispositionConfirmedAt, "");
});

test("settlement sync resets an unconfirmed send-back choice to normal flow", () => {
  const records = [{
    id:"auto-return",lot:6,itemName:"拍品",projectName:"第78期",finalOutcome:"拖回",
    finalPrice:1000,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/发回",
  }];
  const deals = [{lot:6,itemName:"拍品",auctionPeriodOverride:"第78期",finalPrice:1000,finalOutcome:"成交"}];
  const pending = [{lot:6,itemName:"拍品",auctionPeriodOverride:"第78期",paymentStatus:"待付款"}];
  const result = workflow.applyAuctionSettlementResults(records,deals,pending,"第78期","2026-08-07T09:00:00.000Z");
  assert.equal(result.records[0].returnDisposition, "");
  assert.equal(result.records[0].finalOutcome, "成交");
  assert.equal(result.records[0].unpaidReturn, false);
  assert.equal(result.records[0].returnDispositionConfirmedAt, "");
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
    returnDispositionConfirmedAt:"2026-07-30T10:00:00.000Z",
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
    {id:"sent",lot:1,itemName:"拖回发回",projectName:"第76期",finalOutcome:"拖回",finalPrice:500,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/发回",returnDispositionConfirmedAt:"2026-07-30T10:00:00.000Z"},
    {id:"relist",lot:2,itemName:"拖回再拍",projectName:"第76期",finalOutcome:"拖回",finalPrice:600,paymentStatus:"待付款",unpaidReturn:true,returnDisposition:"拖回/再拍",returnDispositionConfirmedAt:"2026-07-30T10:00:00.000Z"},
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
  const record = {finalOutcome:"成交",finalPrice:860,paymentStatus:"待付款",paymentDueAt:"2026-07-20T20:00:00+08:00",returnDisposition:"拖回/再拍",returnDispositionConfirmedAt:"2026-07-21T09:00:00.000Z"};
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
