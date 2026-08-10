import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {createOrderStore} from "../logistics-gateway/order-store.mjs";

test("records cancellation and makes the cancelled order discoverable", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mxiqi-order-store-"));
  context.after(() => fs.rmSync(root, {recursive:true, force:true}));
  const store = createOrderStore(root);
  store.write("key-1", {
    carrier:"sf",
    logisticsOrderId:"ORDER-001",
    waybill:"SF1234567890123",
    providerStatus:"2",
  });

  const cancelledAt = new Date("2026-08-10T15:00:00.000Z");
  const updated = store.markCancelled("ORDER-001", {alreadyCancelled:true}, cancelledAt);

  assert.equal(updated.cancelled, true);
  assert.equal(updated.alreadyCancelled, true);
  assert.equal(updated.providerStatus, "cancelled");
  assert.equal(updated.cancelledAt, cancelledAt.toISOString());
  assert.equal(store.findByLogisticsOrderId("ORDER-001").value.cancelled, true);
  assert.equal(store.read("key-1").waybill, "SF1234567890123");
});

test("does not alter an unrelated stored order", (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mxiqi-order-store-"));
  context.after(() => fs.rmSync(root, {recursive:true, force:true}));
  const store = createOrderStore(root);
  store.write("key-1", {logisticsOrderId:"ORDER-001", cancelled:false});

  assert.equal(store.markCancelled("ORDER-002"), null);
  assert.equal(store.read("key-1").cancelled, false);
});
