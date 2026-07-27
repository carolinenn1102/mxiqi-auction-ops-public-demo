import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
const app = await fs.readFile(new URL("../app.js", import.meta.url), "utf8");

test("inventory dialog exposes row selection and filtered select-all controls", () => {
  assert.match(html, /id="asset-select-all"/);
  assert.match(html, /id="asset-selection-count"/);
  assert.match(html, /id="asset-batch-delete"/);
  assert.match(html, /id="asset-clear-selection"/);
  assert.match(app, /data-asset-select=/);
  assert.match(app, /assetVisibleRows\(\)\.forEach/);
});

test("bulk inventory deletion is confirmed, persisted, and limited to asset records", () => {
  assert.match(app, /只会删除这里的导入记录，不会删除主工作台拍品/);
  assert.match(app, /state\.assets = state\.assets\.filter/);
  assert.match(app, /audit\("批量删除寄存库存"/);
  assert.match(app, /save\(\);\s*renderAssetPanel\(\);/);
});
