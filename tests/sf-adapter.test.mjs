import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSfOrder,
  cancelSfOrder,
  createSfDigest,
  createSfOrder,
  createSfWaybillPdf,
  findSfOrder,
  nextPickupTime,
  searchSfOrder,
  sfConfiguration,
} from "../logistics-gateway/sf-adapter.mjs";

const completeEnv = {
  SF_API_BASE:"https://sf.example.test/std/service",
  SF_ENVIRONMENT:"sandbox",
  SF_CLIENT_CODE:"client-code",
  SF_CHECK_WORD:"check-word",
  SF_MONTHLY_CARD:"monthly-card",
  SF_EXPRESS_TYPE_ID:"2",
  SF_PAY_METHOD:"1",
};

const request = {
  carrier:"sf",
  clientReference:"ORDER-001",
  sender:{name:"寄件人",phone:"15200000000",address:"北京市朝阳区测试路1号"},
  receiver:{name:"收件人",phone:"13800000000",province:"上海市",city:"上海市",district:"浦东新区",address:"测试路2号"},
  parcel:{count:1,itemCount:2,weightKg:0.8,goodsName:"章牌",lots:[1,2]},
};

test("creates the official SF digest byte-for-byte", () => {
  assert.equal(createSfDigest('{"orderId":"TEST001"}', 1722484800, "secret123"), "J/YTUpgNnH5W8+RlVqVHRg==");
});

test("detects incomplete SF application configuration", () => {
  const status = sfConfiguration({});
  assert.equal(status.configured, false);
  assert.ok(status.missing.includes("顾客编码"));
  assert.ok(status.missing.includes("校验码"));
  assert.equal(status.monthlyCard, "7551234567");
});

test("production refuses live orders until contract fields and explicit confirmation exist", () => {
  const status = sfConfiguration({SF_ENVIRONMENT:"production",SF_CLIENT_CODE:"client",SF_CHECK_WORD:"secret"});
  assert.equal(status.configured, false);
  assert.ok(status.missing.includes("月结卡号"));
  assert.ok(status.missing.includes("顺丰小件协议产品编码"));
  assert.ok(status.missing.includes("生产下单确认开关"));
});

test("pickup follows the agreed whole-hour examples", () => {
  assert.equal(nextPickupTime(new Date("2026-08-01T04:00:00.000Z")), "2026-08-01 18:00:00");
  assert.equal(nextPickupTime(new Date("2026-08-01T10:00:00.000Z")), "2026-08-02 10:00:00");
});

test("builds the contracted SF order without browser-held account fields", () => {
  const order = buildSfOrder(request, sfConfiguration(completeEnv), new Date("2026-08-01T00:00:00.000Z"));
  assert.equal(order.orderId, "ORDER-001");
  assert.equal(order.monthlyCard, "monthly-card");
  assert.equal(order.payMethod, 1);
  assert.equal(order.expressTypeId, 2);
  assert.equal(order.totalWeight, 0.8);
  assert.equal(order.cargoDesc, "章牌");
  assert.equal(order.contactInfoList[1].country, "CN");
  assert.equal(order.sendStartTm, "2026-08-01 14:00:00");
  assert.equal("serviceList" in order, false);
  assert.equal("declaredValue" in order, false);
});

test("submits the official form and returns the real waybill", async () => {
  let captured;
  const receipt = await createSfOrder(request, {
    env:completeEnv,
    now:new Date("2026-08-01T00:00:00.000Z"),
    fetchImpl:async (url, options) => {
      captured = {url,options,form:new URLSearchParams(options.body)};
      return {
        ok:true,
        status:200,
        text:async () => JSON.stringify({
          apiResultCode:"A1000",
          apiResultData:JSON.stringify({
            success:true,errorCode:"S0000",
            msgData:{orderId:"ORDER-001",waybillNoInfoList:[{waybillNo:"SF1234567890123"}]},
          }),
        }),
      };
    },
  });
  assert.equal(captured.url, completeEnv.SF_API_BASE);
  assert.equal(captured.form.get("serviceCode"), "EXP_RECE_CREATE_ORDER");
  assert.equal(captured.form.get("partnerID"), completeEnv.SF_CLIENT_CODE);
  assert.ok(captured.form.get("msgDigest"));
  assert.equal(receipt.waybill, "SF1234567890123");
  assert.equal(receipt.logisticsOrderId, "ORDER-001");
});

test("queries an existing order by the official customer order number", async () => {
  let captured;
  const receipt = await searchSfOrder("ORDER-001", {
    env:completeEnv,
    now:new Date("2026-08-01T00:00:00.000Z"),
    fetchImpl:async (url, options) => {
      captured = {url,form:new URLSearchParams(options.body)};
      return {
        ok:true,
        status:200,
        text:async () => JSON.stringify({
          apiResultCode:"A1000",
          apiResultData:JSON.stringify({
            success:true,errorCode:"S0000",
            msgData:{orderId:"ORDER-001",filterResult:2,waybillNoInfoList:[{waybillNo:"SF1234567890123"}]},
          }),
        }),
      };
    },
  });
  assert.equal(captured.url, completeEnv.SF_API_BASE);
  assert.equal(captured.form.get("serviceCode"), "EXP_RECE_SEARCH_ORDER_RESP");
  assert.deepEqual(JSON.parse(captured.form.get("msgData")), {orderId:"ORDER-001",searchType:"1",language:"zh_CN"});
  assert.equal(receipt.waybill, "SF1234567890123");
  assert.equal(receipt.providerStatus, "2");
});

test("cancels an existing order through the official update service", async () => {
  let captured;
  const receipt = await cancelSfOrder("ORDER-001", {
    env:completeEnv,
    now:new Date("2026-08-01T00:00:00.000Z"),
    fetchImpl:async (url, options) => {
      captured = {url,form:new URLSearchParams(options.body)};
      return {
        ok:true,
        status:200,
        text:async () => JSON.stringify({
          apiResultCode:"A1000",
          apiResultData:JSON.stringify({
            success:true,errorCode:"S0000",
            msgData:{orderId:"ORDER-001",resStatus:2,waybillNoInfoList:[{waybillNo:"SF1234567890123"}]},
          }),
        }),
      };
    },
  });
  assert.equal(captured.url, completeEnv.SF_API_BASE);
  assert.equal(captured.form.get("serviceCode"), "EXP_RECE_UPDATE_ORDER");
  assert.deepEqual(JSON.parse(captured.form.get("msgData")), {
    dealType:2,
    language:"zh-CN",
    orderId:"ORDER-001",
    totalWeight:1,
    waybillNoInfoList:[],
  });
  assert.equal(receipt.waybill, "SF1234567890123");
  assert.equal(receipt.cancelled, true);
});

test("creates a PDF waybill through the official cloud print service", async () => {
  let captured;
  const result = await createSfWaybillPdf("SF1234567890123", {
    env:completeEnv,
    now:new Date("2026-08-01T00:00:00.000Z"),
    fetchImpl:async (url, options) => {
      captured = {url,form:new URLSearchParams(options.body)};
      return {
        ok:true,
        status:200,
        text:async () => JSON.stringify({
          apiResultCode:"A1000",
          apiResultData:JSON.stringify({
            success:true,
            requestId:"PRINT-001",
            obj:{templateCode:"fm_210_standard_client-code",files:[{waybillNo:"SF1234567890123",url:"https://sf.example.test/label.pdf",token:"token"}]},
          }),
        }),
      };
    },
  });
  assert.equal(captured.url, completeEnv.SF_API_BASE);
  assert.equal(captured.form.get("serviceCode"), "COM_RECE_CLOUD_PRINT_WAYBILLS");
  assert.deepEqual(JSON.parse(captured.form.get("msgData")), {
    templateCode:"fm_210_standard_client-code",
    version:"2.0",
    fileType:"pdf",
    sync:true,
    documents:[{masterWaybillNo:"SF1234567890123"}],
  });
  assert.equal(result.requestId, "PRINT-001");
  assert.equal(result.files[0].url, "https://sf.example.test/label.pdf");
});

test("treats an explicit no-order query response as safe to create", async () => {
  const receipt = await findSfOrder("ORDER-NOT-YET-CREATED", {
    env:completeEnv,
    now:new Date("2026-08-01T00:00:00.000Z"),
    fetchImpl:async () => ({
      ok:true,
      status:200,
      text:async () => JSON.stringify({
        apiResultCode:"A1000",
        apiResultData:JSON.stringify({
          success:false,
          errorCode:"E0001",
          errorMsg:"没有查询到订单",
        }),
      }),
    }),
  });
  assert.equal(receipt, null);
});

test("accepts the production no-order wording as a safe first-order lookup", async () => {
  const receipt = await findSfOrder("ORDER-NOT-YET-CREATED", {
    env:completeEnv,
    now:new Date("2026-08-01T00:00:00.000Z"),
    fetchImpl:async () => ({
      ok:true,
      status:200,
      text:async () => JSON.stringify({
        apiResultCode:"A1000",
        apiResultData:JSON.stringify({
          success:false,
          errorCode:"E0001",
          errorMsg:"找不到该订单",
        }),
      }),
    }),
  });
  assert.equal(receipt, null);
});

test("does not turn an authorization error into a duplicate order", async () => {
  await assert.rejects(
    () => findSfOrder("ORDER-001", {
      env:completeEnv,
      fetchImpl:async () => ({
        ok:true,
        status:200,
        text:async () => JSON.stringify({
          apiResultCode:"A1000",
          apiResultData:JSON.stringify({success:false,errorCode:"E9999",errorMsg:"应用无权访问接口"}),
        }),
      }),
    }),
    /应用无权访问接口/,
  );
});
