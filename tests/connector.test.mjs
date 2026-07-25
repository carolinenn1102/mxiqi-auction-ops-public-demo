import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const extensionRoot = path.join(root, "mxiqi-connector-extension");
const parser = require(path.join(extensionRoot, "mxiqi-parser.js"));

test("normalizes platform order states", () => {
  assert.deepEqual(parser.normalizeOrderStatus("待发货"), {
    paymentStatus: "已付款",
    finalOutcome: "成交",
    addressStatus: "pending_review",
    mxiqiShippingStatus: "pending",
  });
  assert.equal(parser.normalizeOrderStatus("待付款").paymentStatus, "待付款");
  assert.equal(parser.normalizeOrderStatus("已发货").mxiqiShippingStatus, "filled");
});

test("extracts normalized phone and date", () => {
  assert.equal(parser.phoneFrom("收件人 138 0000 0001"), "13800000001");
  assert.equal(parser.orderDate("20260723220402613096"), "2026-07-23");
  assert.equal(parser.money("佣金 ¥1,056.50"), 1056.5);
});

test("extension is restricted to the public dashboard and mxiqi", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(extensionRoot, "manifest.json"), "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.host_permissions, ["https://www.mxiqi.com/*"]);
  assert.ok(manifest.externally_connectable.matches.includes("https://carolinenn1102.github.io/mxiqi-auction-ops-public-demo/*"));
  assert.ok(!JSON.stringify(manifest).includes("<all_urls>"));
});

test("connector source contains no account credential fields or client secrets", () => {
  const sourceFiles = [
    path.join(root, "connector-bridge.js"),
    path.join(extensionRoot, "background.js"),
    path.join(extensionRoot, "content.js"),
    path.join(extensionRoot, "mxiqi-parser.js"),
    path.join(extensionRoot, "manifest.json"),
  ];
  const source = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  assert.doesNotMatch(source, /accountPassword|savedPassword|clientSecret/i);
  assert.doesNotMatch(source, /password\s*[:=]\s*["'][^"']+/i);
});

test("project login is relayed without persistence", () => {
  const bridge = fs.readFileSync(path.join(root, "connector-bridge.js"), "utf8");
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const background = fs.readFileSync(path.join(extensionRoot, "background.js"), "utf8");
  assert.match(bridge, /login:\s*\(\{mobile,\s*password\}\)/);
  assert.match(background, /loginWithCredentials/);
  assert.match(background, /url\.hostname === "127\.0\.0\.1"/);
  assert.match(app, /passwordInput\.value\s*=\s*""/);
  assert.doesNotMatch(app, /localStorage\.setItem\([^)]*password/i);
});
