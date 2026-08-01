import assert from "node:assert/strict";
import test from "node:test";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const logistics = require("../logistics-core.js");

const settings = {
  sfSenderName:"甄先生",
  sfSenderPhone:"15200000000",
  sfSenderAddress:"北京市测试地址",
  sfMonthlyAccount:"7300000000",
  defaultPackageWeightKg:1,
  defaultGoodsName:"收藏品",
};

test("builds a package request without exposing credentials", () => {
  const request = logistics.buildRequest({carrier:"sf",settings,records:[{
    lot:1,mxiqiOrderId:"20260001",recipientName:"张三",recipientPhone:"13800000000",
    addressProvince:"上海市",addressCity:"上海市",addressDistrict:"浦东新区",addressDetail:"测试路1号",
  }]});
  assert.equal(request.clientReference, "20260001");
  assert.equal("monthlyAccount" in request.sender, false);
  assert.equal(request.parcel.itemCount, 1);
  assert.deepEqual(logistics.validateRequest(request), {ok:true,missing:[]});
  assert.equal("secretKey" in request, false);
});

test("uses the agreed parcel defaults when the page has no override", () => {
  const request = logistics.buildRequest({carrier:"sf",settings:{
    sfSenderName:"甄先生",sfSenderPhone:"15200000000",sfSenderAddress:"北京市测试地址",
  },records:[{
    lot:1,recipientName:"张三",recipientPhone:"13800000000",
    addressProvince:"上海市",addressCity:"上海市",addressDistrict:"浦东新区",addressDetail:"测试路1号",
  }]});
  assert.equal(request.parcel.goodsName, "章牌");
  assert.equal(request.parcel.weightKg, 0.8);
});

test("rejects incomplete shipment requests", () => {
  const request = logistics.buildRequest({carrier:"cainiao",settings:{},records:[{lot:2}]});
  const result = logistics.validateRequest(request);
  assert.equal(result.ok, false);
  assert.ok(result.missing.includes("寄件人"));
  assert.ok(result.missing.includes("收件手机号"));
});

test("accepts only a real-looking logistics receipt", () => {
  assert.deepEqual(logistics.normalizeReceipt({waybill:"SF1234567890",pickupCode:"A123",orderId:"O1"}), {
    waybill:"SF1234567890",pickupCode:"A123",logisticsOrderId:"O1",
  });
  assert.throws(() => logistics.normalizeReceipt({waybill:"DEMO"}), /真实运单号/);
});
