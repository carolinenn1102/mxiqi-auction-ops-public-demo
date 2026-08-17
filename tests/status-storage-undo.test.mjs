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
  assert.match(html, /id="filter-status"[\s\S]*?<option>成交结果待同步<\/option>/);
  assert.match(html, /id="filter-status"[\s\S]*?<option>寄存<\/option>/);
  assert.match(html, /name="returnDisposition"[\s\S]*?<option>寄存<\/option>/);
  assert.match(app, /function syncStoredAssetsFromRecords\(/);
  assert.match(app, /recordStorageId/);
  assert.match(app, /record\.returnDisposition !== "寄存"/);
  assert.match(app, /if \(isStorageRecord\(record\) && gross <= 0\)[\s\S]*?record\.commissionAmount = 0;[\s\S]*?record\.settlementAmount = 0;[\s\S]*?未付款寄存 · 结算金额为零/);
  const storageRecalculation = app.slice(app.indexOf("if (isStorageRecord(record) && gross <= 0)"), app.indexOf("if (record.settled && !force)"));
  assert.doesNotMatch(storageRecalculation, /record\.settled/);
  assert.match(app, /修复寄存拍品结算/);
});

test("closed auctions expose an explicit result-sync action instead of looking pending", () => {
  assert.match(app, /MxiqiWorkflow\.isAuctionResultPending\(record\)/);
  assert.match(app, /成交结果待同步/);
  assert.match(app, /data-action="sync-result"/);
  assert.match(app, /await runSettlementSync\(\)/);
});

test("tracker import preserves phone aliases and special outcomes", () => {
  assert.match(app, /trackerOutcome\(outcome, price\)/);
  assert.match(app, /parseConsignorLabel\(/);
  assert.match(app, /"送拍人手机号",\s*"手机号",\s*"电话"/);
  assert.match(app, /birthdayMonth:seller\.birthdayMonth/);
  assert.match(app, /returnDisposition:normalizedOutcome\?\.returnDisposition/);
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
  assert.match(html, /data-asset-filter="all"><span>当前库存<\/span>/);
  assert.match(html, /<th>买家 \/ 收件地址<\/th>/);
  assert.match(html, /<th>拍场期数与时间<\/th>/);
  assert.match(app, /groupAssetsByBuyer\(visible, state\.records\)/);
  assert.match(app, /data-asset-group-toggle/);
  assert.match(app, /data-asset-group-ship/);
  assert.match(app, /storageShippingStatus = "completed"/);
  assert.match(app, /MxiqiAssets\.currentInventoryAssets\(state\.assets, state\.records\)/);
  assert.match(app, /已匹配发货/);
  assert.match(app, /已手动处理发货/);
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

test("manual paid records and uploaded reauction matches are wired into the dashboard", () => {
  assert.match(app, /applyManualPaymentResolution\(record, existing\)/);
  assert.match(app, /upsert\(records, \{matchReauction:true,skipReauctionReview:compareReauction\}\)/);
  assert.match(app, /reauctionReviewSkipped/);
  assert.match(app, /reauction-compare-review/);
  assert.match(app, /suggestReauctionMatch\(/);
  assert.match(app, /reauctionMatchedAt/);
  assert.match(app, /再拍库匹配/);
  assert.match(app, /auctionPeriodOverride:MxiqiWorkflow\.trackerAuctionPeriod\(auctionAt\)/);
  assert.match(app, /再拍待确认/);
  assert.match(app, /成交结果空白/);
  assert.match(styles, /\.reauction-match-note\.review/);
});

test("the unsettled count opens a consignor-focused work queue", () => {
  assert.match(app, /settlementView: "all"/);
  assert.match(app, /state\.settlementView !== "unsettled" \|\| !record\.settled/);
  assert.match(app, /`查看 \$\{remaining\} 条未结账`/);
  assert.match(app, /state\.settlementView === "unsettled" \? "all" : "unsettled"/);
  assert.match(app, /!settlementRecords\(\)\.some\(\(record\) => !record\.settled\)\) state\.settlementView = "all"/);
  assert.match(app, /已列出 \$\{remaining\.length\} 条未结账记录，可按送拍人查看和处理/);
  assert.match(app, /未结账送拍人/);
  assert.match(styles, /\.seller-summary-item\.has-unsettled/);
  assert.match(styles, /\.btn\.unsettled-action/);
});

test("fully settled consignor groups use the green completion state", () => {
  assert.match(app, /const allSettled = settledCount === records\.length/);
  assert.match(app, /allSettled \? "settlement-queue-complete"/);
  assert.match(styles, /\.settlement-queue-complete \.settlement-queue-progress,\.settlement-queue-complete small\{color:#1d614a\}/);
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
