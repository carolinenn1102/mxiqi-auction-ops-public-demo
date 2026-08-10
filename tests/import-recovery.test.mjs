import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const appSource = await fs.readFile(new URL("../app.js", import.meta.url), "utf8");
const indexSource = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
const workerSource = await fs.readFile(new URL("../sw.js", import.meta.url), "utf8");

test("imports are transactional and restore the previous browser data when rendering fails", () => {
  const start = appSource.indexOf("function upsert(records,");
  const end = appSource.indexOf("function removeDefaultDemoRecords", start);
  const upsertSource = appSource.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(upsertSource, /const beforeState = captureMutableState\(\)/);
  assert.match(upsertSource, /const beforeStorage = captureStorageSnapshot\(\)/);
  assert.ok(upsertSource.indexOf("render();") < upsertSource.indexOf("save();"));
  assert.match(upsertSource, /restoreMutableState\(beforeState\)/);
  assert.match(upsertSource, /restoreStorageSnapshot\(beforeStorage\)/);
  assert.match(upsertSource, /saveRecoveryCopy\("import-rollback"/);
});

test("startup sanitizes persisted records and quarantines records that still cannot render", () => {
  assert.match(appSource, /const startupSanitizedCount = sanitizeLoadedState\(\)/);
  assert.match(appSource, /saveRecoveryCopy\("startup-render-recovery"/);
  assert.match(appSource, /检测到异常导入数据，已自动隔离/);
});

test("the recovery release uses one cache-busting version everywhere", () => {
  assert.match(indexSource, /app\.js\?v=61/);
  assert.match(appSource, /sw\.js\?v=61/);
  assert.match(workerSource, /mxiqi-ops-demo-v61/);
});
