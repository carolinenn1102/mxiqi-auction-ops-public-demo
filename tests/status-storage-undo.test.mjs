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
