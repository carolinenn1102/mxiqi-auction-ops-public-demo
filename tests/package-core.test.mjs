import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const packages = require(path.resolve(import.meta.dirname, "..", "package-core.js"));
const workflow = require(path.resolve(import.meta.dirname, "..", "workflow-core.js"));

test("groups all lots from the same mxiqi order into one package", () => {
  const groups = packages.groupRecords([
    {id:"a",mxiqiOrderId:"202607260001",lot:10},
    {id:"b",mxiqiOrderId:"202607260001",lot:11},
    {id:"c",mxiqiOrderId:"202607260002",lot:12},
  ]);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].records.map((record) => record.lot), [10, 11]);
  assert.equal(groups[0].isPackage, true);
  assert.equal(groups[1].isPackage, false);
});

test("falls back to a shared waybill and keeps unrelated records separate", () => {
  const groups = packages.groupRecords([
    {id:"a",outboundTrackingNumber:"SF123",lot:20},
    {id:"b",outboundTrackingNumber:"SF123",lot:21},
    {id:"c",lot:22},
  ]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].key, "waybill:SF123");
  assert.equal(groups[1].key, "single:c");
});

test("returns a value only when every package item has the same field", () => {
  assert.equal(packages.sameValue([{buyerName:"张三"},{buyerName:"张三"}], "buyerName"), "张三");
  assert.equal(packages.sameValue([{buyerName:"张三"},{buyerName:"李四"}], "buyerName"), "");
  assert.equal(packages.sameValue([{buyerName:"张三"},{buyerName:""}], "buyerName"), "");
});

test("applies shared package fields to every lot without overwriting item-specific data", () => {
  const records = [
    {id:"a",lot:31,itemName:"拍品一",sellerWechat:"送拍人甲",buyerName:""},
    {id:"b",lot:59,itemName:"拍品二",sellerWechat:"送拍人乙",buyerName:""},
    {id:"c",lot:60,itemName:"拍品三",sellerWechat:"送拍人丙",buyerName:""},
  ];
  const updated = packages.applySharedFields(records, {buyerName:"BaronZ",buyerPhone:"15900907981"}, ["buyerName","buyerPhone"]);
  assert.equal(updated, 3);
  assert.deepEqual(records.map((record) => record.buyerName), ["BaronZ","BaronZ","BaronZ"]);
  assert.deepEqual(records.map((record) => record.lot), [31,59,60]);
  assert.deepEqual(records.map((record) => record.sellerWechat), ["送拍人甲","送拍人乙","送拍人丙"]);
});

test("routes every package lot to reauction when the shared disposition changes", () => {
  const records = [
    {id:"a",lot:44,finalPrice:1200,finalOutcome:"成交",returnDisposition:""},
    {id:"b",lot:97,finalPrice:800,finalOutcome:"成交",returnDisposition:""},
  ];
  packages.applySharedFields(records, {returnDisposition:"拖回/再拍"}, ["returnDisposition"]);
  records.forEach((record) => Object.assign(record, workflow.trackerOutcome(record.returnDisposition, record.finalPrice)));
  assert.deepEqual(records.map((record) => record.returnDisposition), ["拖回/再拍","拖回/再拍"]);
  assert.deepEqual(records.map((record) => record.finalOutcome), ["拖回","拖回"]);
  assert.equal(records.filter((record) => record.returnDisposition === "拖回/再拍").length, 2);
});
