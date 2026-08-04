import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

const excelContext = vm.createContext({});
excelContext.globalThis = excelContext;
excelContext.self = excelContext;
excelContext.window = excelContext;
vm.runInContext(await fs.readFile(new URL("../vendor/exceljs.min.js", import.meta.url), "utf8"), excelContext);
const ExcelJS = excelContext.ExcelJS;
const excelRow = (values) => vm.runInContext(`JSON.parse(${JSON.stringify(JSON.stringify(values))})`, excelContext);
await import("../matching-core.js");

const { parseAssetWorkbook, rematchAssets, groupAssetsByBuyer, parseConsignorLabel } = globalThis.MxiqiAssets;

test("extracts embedded phone and birthday metadata without polluting the consignor nickname", () => {
  const parsed = parseConsignorLabel("测试昵称，生日，13900000001", "", "260803 周一，77期");
  assert.deepEqual(parsed, {
    wechat:"测试昵称",
    phone:"13900000001",
    birthdayMarked:true,
    birthdayMonth:8,
  });
});

test("imports consignment and intentionally skips the second grading sheet", () => {
  const workbook = new ExcelJS.Workbook();
  const consignment = workbook.addWorksheet("寄存");
  consignment.addRow(excelRow(["寄存", "用户", "寄存订单号", "订单日期", "收货地址", "拍品", null, "状态"]));
  consignment.addRow(excelRow([null, "体验客户 13900000001", "DEMO-C-001", 46228, "上海市 浦东新区 世纪大道100号 张三 13900000001", "Lot.8 演示纪念币", null, "在库"]));
  const grading = workbook.addWorksheet("送评");
  grading.addRow(excelRow(["微信名称/联系方式", "送评物品", "图片", "档", "送评单号", "送评日期", "是否出分", "是否返还", null]));
  grading.addRow(excelRow(["体验客户", "演示银币", null, "65", "DEMO-G-001", "0725", "出分", "返还", "上拍"]));

  const parsed = parseAssetWorkbook(workbook, "演示寄存.xlsx");
  assert.deepEqual(parsed.kinds, ["consignment"]);
  assert.equal(parsed.assets.length, 1);
  assert.equal(parsed.assets[0].personRole, "buyer");
  assert.equal(parsed.assets[0].buyerPhone, "13900000001");
  assert.equal(parsed.assets[0].buyerName, "体验客户");
  assert.equal(parsed.assets[0].recipientName, "张三");
  assert.match(parsed.assets[0].recipientRaw, /世纪大道100号/);
  assert.equal(parsed.assets[0].sellerPhone, undefined);
  assert.equal(parsed.assets[0].orderDate, "2026-07-25");
});

test("replaces unsupported DISPIMG formulas and groups consignment by buyer", () => {
  const workbook = new ExcelJS.Workbook();
  const consignment = workbook.addWorksheet("寄存");
  consignment.addRow(excelRow(["寄存", "用户", "寄存订单号", "订单日期", "收货地址", "拍品", null, "状态"]));
  consignment.addRow(excelRow([null, "买家甲 13900000001", "DEMO-C-001", "2026-07-20", "上海市 张三 13900000001", '=DISPIMG("ID_1",1)', null, "在库"]));
  consignment.addRow(excelRow([null, "买家甲 13900000001", "DEMO-C-002", "2026-07-21", "上海市 张三 13900000001", "Lot.9 第二件拍品", null, "在库"]));

  const parsed = parseAssetWorkbook(workbook, "寄存记录.xlsx");
  assert.equal(parsed.assets.length, 2);
  assert.match(parsed.assets[0].itemName, /图片拍品/);
  assert.doesNotMatch(parsed.assets[0].itemName, /DISPIMG/);
  const groups = groupAssetsByBuyer(parsed.assets);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].buyerName, "买家甲");
  assert.equal(groups[0].assets.length, 2);
});

test("completed consignment groups move behind pending groups", () => {
  const groups = groupAssetsByBuyer([
    {id:"done",assetType:"consignment",personRole:"buyer",buyerName:"甲",buyerPhone:"13900000001",storageShippingStatus:"completed"},
    {id:"pending",assetType:"consignment",personRole:"buyer",buyerName:"乙",buyerPhone:"13900000002"},
  ]);
  assert.equal(groups[0].buyerName, "乙");
  assert.equal(groups[1].completed, true);
});

test("imports only the current inventory sheet", () => {
  const workbook = new ExcelJS.Workbook();
  const current = workbook.addWorksheet("整体");
  current.addRow(excelRow(["来源", "拍场号", "Lot号", "名称", "年份", "编号", "分数/裸币", "外拍价格", "到手价格", "备注", "状态", "售出渠道/价格（未扣手续费，运费）"]));
  current.addRow(excelRow(["HA", "DEMO-A", 12, "演示库存银币", 1888, "DEMO-ID-1", 64, 80, 620, null, "在库", null]));
  const sold = workbook.addWorksheet("已售出");
  sold.addRow(excelRow(["来源", "拍场号", "Lot号", "名称", "年份", "编号", "分数/裸币", "外拍价格", "到手价格"]));
  sold.addRow(excelRow(["HA", "DEMO-B", 13, "已售出演示银币", 1889, "DEMO-ID-2", 64, 90, 700]));

  const parsed = parseAssetWorkbook(workbook, "演示外拍.xlsx");
  assert.deepEqual(parsed.kinds, ["inventory"]);
  assert.equal(parsed.assets.length, 1);
  assert.equal(parsed.assets[0].sourceSheet, "整体");
  assert.equal(parsed.assets[0].gradingId, "DEMO-ID-1");
});

test("uses phone first and routes ambiguous candidates to manual review", () => {
  const asset = {
    id: "a1",
    assetKey: "a1",
    itemName: "没有名称相似度的寄存物品",
    sellerPhone: "13900000001",
    sellerWechat: "体验客户",
    matchStatus: "unmatched",
    matchedRecordId: "",
  };
  const unique = rematchAssets([asset], [
    { id: "r1", lot: 1, itemName: "旧订单", sellerWechat: "体验客户", sellerPhone: "13900000001" },
  ])[0];
  assert.equal(unique.matchStatus, "auto");
  assert.equal(unique.matchedRecordId, "r1");
  assert.match(unique.matchReason, /手机号一致/);

  const ambiguous = rematchAssets([asset], [
    { id: "r1", lot: 1, itemName: "甲", sellerWechat: "其它", sellerPhone: "13900000001" },
    { id: "r2", lot: 2, itemName: "乙", sellerWechat: "其它", sellerPhone: "13900000001" },
  ])[0];
  assert.equal(ambiguous.matchStatus, "review");
});

test("never treats the buyer phone as the consignor phone", () => {
  const asset = {
    id: "a1",
    assetKey: "a1",
    itemName: "寄存物品",
    sellerPhone: "13900000001",
    sellerWechat: "送拍人甲",
    matchStatus: "unmatched",
    matchedRecordId: "",
  };
  const result = rematchAssets([asset], [
    { id: "r1", lot: 1, itemName: "完全不同", buyerPhone: "13900000001", sellerWechat: "送拍人乙" },
  ])[0];
  assert.equal(result.matchStatus, "unmatched");
});

test("matches a consignment order number to a synchronized Mxiqi order", () => {
  const result = rematchAssets([{
    id: "a1",
    assetKey: "a1",
    itemName: "截图拍品",
    consignmentOrderNo: "20260521220802456582",
    matchStatus: "unmatched",
    matchedRecordId: "",
  }], [
    { id: "r1", lot: 8, itemName: "麦稀奇拍品", mxiqiOrderId: "20260521220802456582" },
  ])[0];
  assert.equal(result.matchStatus, "auto");
  assert.equal(result.matchedRecordId, "r1");
  assert.match(result.matchReason, /寄存订单号一致/);
});

test("preserves a valid manual match when rematching", () => {
  const result = rematchAssets([{
    id: "a1",
    assetKey: "a1",
    itemName: "寄存物品",
    matchStatus: "manual",
    matchedRecordId: "r2",
    matchReason: "人工确认",
  }], [
    { id: "r1", lot: 1, itemName: "寄存物品" },
    { id: "r2", lot: 2, itemName: "其它" },
  ])[0];
  assert.equal(result.matchStatus, "manual");
  assert.equal(result.matchedRecordId, "r2");
});
