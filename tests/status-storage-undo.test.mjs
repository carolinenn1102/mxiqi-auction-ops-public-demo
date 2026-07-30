import assert from "node:assert/strict";
import test from "node:test";
import {readFile} from "node:fs/promises";

const root = new URL("../", import.meta.url);
const [html, app, styles] = await Promise.all([
  readFile(new URL("index.html", root), "utf8"),
  readFile(new URL("app.js", root), "utf8"),
  readFile(new URL("styles.css", root), "utf8"),
]);

test("dashboard exposes pending-auction and storage states", () => {
  assert.match(html, /id="filter-status"[\s\S]*?<option>待拍<\/option>/);
  assert.match(html, /id="filter-status"[\s\S]*?<option>寄存<\/option>/);
  assert.match(html, /name="returnDisposition"[\s\S]*?<option>寄存<\/option>/);
  assert.match(app, /function syncStoredAssetsFromRecords\(/);
  assert.match(app, /recordStorageId/);
  assert.match(app, /record\.returnDisposition !== "寄存"/);
  assert.match(app, /if \(isStorageRecord\(record\)\)[\s\S]*?record\.commissionAmount = 0;[\s\S]*?record\.settlementAmount = 0;/);
  assert.match(app, /!record\.settled \|\| isStorageRecord\(record\)/);
});

test("tracker import preserves phone aliases and special outcomes", () => {
  assert.match(app, /trackerOutcome\(outcome, price\)/);
  assert.match(app, /"送拍人手机号","手机号","电话"/);
  assert.match(app, /returnDisposition:normalizedOutcome\.returnDisposition/);
});

test("operation log exposes selectable rollback history", () => {
  assert.match(html, /id="undo-target"/);
  assert.match(html, /id="undo-operation"/);
  assert.match(app, /function captureHistorySnapshot\(/);
  assert.match(app, /function restoreHistoryEntry\(/);
  assert.match(app, /function ensureLegacyImportUndo\(/);
  assert.match(styles, /\.undo-panel/);
});

test("consignment backfill reports progress inside its dialog", () => {
  assert.match(html, /id="asset-sync-status"/);
  assert.match(app, /function setAssetSyncStatus\(/);
  assert.match(app, /正在逐个搜索/);
  assert.match(app, /回补完成/);
});

test("consignment inventory is buyer-first, expandable, and supports group shipment", () => {
  assert.match(html, /<th>买家 \/ 收件地址<\/th>/);
  assert.match(html, /<th>拍场期数与时间<\/th>/);
  assert.match(app, /groupAssetsByBuyer\(visible\)/);
  assert.match(app, /data-asset-group-toggle/);
  assert.match(app, /data-asset-group-ship/);
  assert.match(app, /storageShippingStatus = "completed"/);
  assert.match(styles, /\.asset-group-row\.completed/);
});

test("record editor exposes the full buyer shipping address", () => {
  assert.match(html, /name="recipientRaw"[^>]*placeholder="姓名 手机号 省市区详细地址"/);
  assert.match(app, /recipientRaw = String\(data\.get\("recipientRaw"\)/);
});

test("combined package missing-data entry synchronizes only shared fields", () => {
  assert.match(app, /data-package-edit=/);
  assert.match(html, /id="shipping-common-badge"/);
  assert.match(html, /买家账号（整包同步）/);
  assert.match(html, /拍场项目（整包同步）/);
  assert.match(app, /PACKAGE_SHARED_FIELDS/);
  assert.match(app, /MxiqiPackages\.applySharedFields\(records/);
  assert.match(app, /Lot、拍品名称、送拍人和寄入快递仍按单件保留/);
});

test("combined package synchronizes exact return dispositions and reauction routing", () => {
  assert.match(html, /id="shipping-return-disposition"[\s\S]*?<option>拖回\/发回<\/option>[\s\S]*?<option>拖回\/再拍<\/option>[\s\S]*?<option>拖回\/等待<\/option>/);
  assert.match(app, /PACKAGE_SHARED_FIELDS[^\n]*"returnDisposition"/);
  assert.match(app, /name === "returnDisposition"[\s\S]*?MxiqiWorkflow\.trackerOutcome\(value, item\.finalPrice\)/);
  assert.match(app, /item\.returnDisposition = outcome\.returnDisposition/);
  assert.match(app, /state\.stage === "reauction" && record\.returnDisposition === "拖回\/再拍"/);
});

test("reauction records can be moved to a manually selected auction period", () => {
  assert.match(html, /name="auctionPeriodOverride"[^>]*list="auction-period-options"/);
  assert.match(html, /name="returnDisposition"[\s\S]*?<option>上拍<\/option>/);
  assert.match(app, /MxiqiWorkflow\.relistRecord\(record\)/);
  assert.match(app, /MxiqiWorkflow\.relistRecord\(item\)/);
  assert.match(app, /record\.relisted && record\.finalOutcome === "待拍"/);
});

test("preauction check groups sellers and renders only four checklist columns", () => {
  assert.match(html, /id="open-preauction-check"[^>]*data-stage="preauction"/);
  assert.match(html, /id="preauction-seller-list"/);
  assert.match(app, /function renderPreauctionSummary\(/);
  assert.match(app, /data-preauction-seller=/);
  assert.match(app, /<th>送拍人<\/th><th>Lot<\/th><th>拍品名称<\/th><th>拍卖期数<\/th>/);
  assert.match(app, /visible\.map\(renderPreauctionRow\)/);
  assert.match(styles, /\.preauction-summary/);
});
