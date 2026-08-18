import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const extensionRoot = path.join(root, "mxiqi-connector-extension");
const parser = require(path.join(extensionRoot, "mxiqi-parser.js"));

test("commission logic uses the current cache-busted asset in the page and service worker", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  const htmlVersion = html.match(/commission-core\.js\?v=(\d+)/)?.[1];
  const workerVersion = serviceWorker.match(/commission-core\.js\?v=(\d+)/)?.[1];
  const workflowHtmlVersion = html.match(/workflow-core\.js\?v=(\d+)/)?.[1];
  const workflowWorkerVersion = serviceWorker.match(/workflow-core\.js\?v=(\d+)/)?.[1];

  assert.equal(htmlVersion, "59");
  assert.equal(workerVersion, htmlVersion);
  assert.equal(workflowHtmlVersion, "51");
  assert.equal(workflowWorkerVersion, workflowHtmlVersion);
  assert.match(serviceWorker, /CACHE_NAME = "mxiqi-ops-demo-v74"/);
});

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
  assert.equal(parser.auctionDate("ANACS-AU58 · 260730 周四，76期"), "2026-07-30");
  assert.equal(parser.auctionDate("第76期 · 2026年7月30日 20:00"), "2026-07-30");
});

test("extension is restricted to the public dashboard and mxiqi", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(extensionRoot, "manifest.json"), "utf8"));
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.host_permissions, ["https://www.mxiqi.com/*"]);
  assert.ok(manifest.externally_connectable.matches.includes("https://carolinenn1102.github.io/mxiqi-auction-ops-public-demo/*"));
  assert.ok(manifest.externally_connectable.matches.includes("http://118.31.121.156/*"));
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
  assert.match(background, /url\.origin === "http:\/\/118\.31\.121\.156"/);
  assert.match(app, /passwordInput\.value\s*=\s*""/);
  assert.doesNotMatch(app, /localStorage\.setItem\([^)]*password/i);
});

test("connector supports exact historical order-number lookup", () => {
  const bridge = fs.readFileSync(path.join(root, "connector-bridge.js"), "utf8");
  const background = fs.readFileSync(path.join(extensionRoot, "background.js"), "utf8");
  const content = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");
  assert.match(bridge, /syncOrdersByNumbers/);
  assert.match(background, /scrapeOrdersByNumbers/);
  assert.match(content, /org\.order\.list\/all\?keywords=/);
  assert.match(content, /record\.mxiqiOrderId/);
});

test("connector supports the Mxiqi wait-confirm settlement scope", () => {
  const content = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");
  assert.match(content, /\["waitconfirm","waitpay"\]\.includes\(scope\)/);
  assert.match(content, /\["waitconfirm","waitpay","waitexpress"\]\.includes\(safeScope\) \? 20/);
  assert.match(content, /org\.order\.list\/\$\{safeScope\}/);
});

test("connector supports the Mxiqi wait-pay scope and reports its version", () => {
  const content = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");
  const background = fs.readFileSync(path.join(extensionRoot, "background.js"), "utf8");
  const manifest = JSON.parse(fs.readFileSync(path.join(extensionRoot, "manifest.json"), "utf8"));
  assert.match(content, /"waitconfirm","waitpay"/);
  assert.match(content, /org\.order\.list\/\$\{safeScope\}/);
  assert.match(background, /chrome\.runtime\.getManifest\(\)\.version/);
  assert.equal(manifest.version, "1.9.3");
  assert.match(background, /capabilities:\s*\["login", "syncOrders", "syncOrdersByNumbers", "syncAuctionDeals", "openCarrierPortal"\]/);
});

test("auction settlement sync automatically locates the period catalog", () => {
  const background = fs.readFileSync(path.join(extensionRoot, "background.js"), "utf8");
  const content = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");
  assert.match(background, /sendToAllMxiqiTabs/);
  assert.match(background, /for \(let tab of tabs\)/);
  assert.match(content, /org\.auction\.list/);
  assert.match(content, /org\.auction\.dataReport/);
  assert.match(content, /org\\\.auction\\\.catalog/);
  assert.match(content, /findAuctionDataLink/);
  assert.match(content, /waitForAuctionDataLink/);
  assert.match(content, /const currentMatches = !isAuctionList && currentPeriod === normalizedPeriod/);
  assert.match(background, /scrapeAuctionDealsFromLiveList/);
  assert.match(background, /chrome\.tabs\.create\(\{url:"https:\/\/www\.mxiqi\.com\/org\.auction\.list",active:false\}\)/);
  assert.match(background, /chrome\.tabs\.remove\(tab\.id\)/);
});

test("auction lifecycle protects preview and live bids from settlement parsing", () => {
  assert.equal(parser.auctionLifecycle("预展中，将于2026-08-06 20:00开始"), "preview");
  assert.equal(parser.auctionLifecycle("竞拍中"), "live");
  assert.equal(parser.auctionLifecycle("第77期 已结束"), "ended");

  const previewDocument = {
    title:"第78期成交目录",
    body:{textContent:"预展中，将于2026-08-06 20:00开始"},
    querySelector:() => null,
    querySelectorAll:() => [],
  };
  const parsed = parser.parseAuctionResultDocument(previewDocument, {period:"第78期",entryKey:"313050"});
  assert.equal(parsed.lifecycle, "preview");
  assert.deepEqual(parsed.records, []);

  const content = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");
  assert.match(content, /为防止把预出价误判为成交，已停止同步/);
  assert.match(content, /assertAuctionEnded\(normalizedPeriod, parsed\.lifecycle\)/);
});

test("connector parses auction deal rows and exposes period settlement sync", () => {
  const bridge = fs.readFileSync(path.join(root, "connector-bridge.js"), "utf8");
  const content = fs.readFileSync(path.join(extensionRoot, "content.js"), "utf8");
  const records = parser.parseAuctionResultRows([
    {text:"Lot.48 PCGS-AU55 孙中山像开国纪念壹圆\n成交价：¥49,288.00",title:"PCGS-AU55 孙中山像开国纪念壹圆",href:"/auction.item.info/48"},
  ],{period:"第75期",projectName:"世界币章拍卖（第75期）",entryKey:"75"});
  assert.equal(records.length, 1);
  assert.equal(records[0].lot, 48);
  assert.equal(records[0].finalPrice, 49288);
  assert.equal(records[0].auctionPeriodOverride, "第75期");
  assert.match(bridge, /syncAuctionDeals/);
  assert.match(content, /成交目录/);
});

test("connector parses the real Mxiqi catalog table columns", () => {
  const records = parser.parseAuctionCatalogRows([
    {cells:["Lot.48","PCGS-AU55 孙中山像开国纪念壹圆","","0","0","49,288","2,464.40","51,752.40","","","","",""]},
    {cells:["Lot.14","未成交拍品","","0","0","0","0","0","","","","",""]},
  ],{period:"第75期",projectName:"世界币章拍卖（第75期）",entryKey:"309456"});
  assert.equal(records.length, 2);
  assert.equal(records[0].lot, 48);
  assert.equal(records[0].finalPrice, 49288);
  assert.equal(records[0].finalOutcome, "成交");
  assert.equal(records[1].finalPrice, 0);
  assert.equal(records[1].finalOutcome, "流拍");
});

test("dashboard keeps duplicate Lots separate by auction period and exports full preauction image", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(app, /MxiqiWorkflow\.sameAuctionLot\(item, record\)/);
  assert.match(app, /applyAuctionSettlementResults/);
  assert.match(app, /未付款拖回扣费/);
  assert.match(html, /id="export-preauction-image"/);
});

test("checklist images include consignor phones, branding, and settlement reconciliation", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const serviceWorker = fs.readFileSync(path.join(root, "sw.js"), "utf8");
  assert.match(html, /id="export-settlement-checklist-image"[^>]*>结款对账</);
  assert.match(app, /label:"送拍人手机号"/);
  assert.match(app, /record\.sellerPhone \|\| "手机号待补"/);
  assert.match(app, /fillText\(`\$\{period\}结款对账单`/);
  assert.match(app, /zhenzhenpu-logo\.jpg/);
  assert.match(serviceWorker, /zhenzhenpu-logo\.jpg/);
});

test("settlement reconciliation image exposes financial columns and payable total", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(app, /label:"送拍人 \/ 手机号"/);
  assert.match(app, /label:"送拍项目（拍品标题）"/);
  assert.match(app, /label:"上拍时间"/);
  assert.match(app, /label:"拍场 Lot 号"/);
  assert.match(app, /label:"拍出价格 \/ 处理"/);
  assert.match(app, /label:"送拍佣金 \/ 调整"/);
  assert.match(app, /label:"结款金额"/);
  assert.match(app, /settlementPriceOrDisposition/);
  assert.match(app, /结款总金额：\$\{currency\.format\(totalSettlement\)\}/);
});

test("birthday reconciliation marks consignors and local directory keeps contact profiles", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.match(html, /id="open-customers"[^>]*>[^<]*<span>♙<\/span> 送拍人档案/);
  assert.match(html, /id="customer-dialog"/);
  assert.match(html, /name="sellerWechat"/);
  assert.match(html, /name="phone"/);
  assert.match(html, /name="birthdayMonth"/);
  assert.match(html, /name="notes"/);
  assert.match(app, /function syncCustomerDirectory\(\)/);
  assert.match(app, /state\.records\.forEach\(merge\)/);
  assert.match(app, /state\.assets\.forEach\(merge\)/);
  assert.match(app, /const birthdayDiscount = commissionPlan\(record\)\.isBirthday/);
  assert.match(app, /birthdayDiscount[\s\S]*\? "生日"[\s\S]*\? "NP优惠"/);
  assert.match(styles, /\.customer-directory-layout/);
});

test("consignor names open their customer profile from the work tables", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "styles.css"), "utf8");
  assert.match(app, /data-customer-open=/);
  assert.match(app, /openCustomerDirectory\(customerOpen\.dataset\.customerOpen\)/);
  assert.match(styles, /\.consignor-link/);
});

test("collector refresh prioritizes the selected period settlement catalog", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.match(app, /`同步\$\{pendingPeriod\}成交结果`/);
  assert.match(app, /if \(pendingPeriod && state\.connection\.status === "connected"\) void runSettlementSync\(\)/);
  assert.match(html, /优先读取该期完整成交目录/);
});

test("connected browsers automatically recover pending settlement periods", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(app, /function scheduleAutomaticSettlementRecovery/);
  assert.match(app, /function runAutomaticSettlementRecovery/);
  assert.match(app, /if \(result\.loggedIn\) scheduleAutomaticSettlementRecovery\(\)/);
  assert.match(app, /if \(key === "auction"\) scheduleAutomaticSettlementRecovery/);
  assert.match(app, /void checkRealConnection\(\{quiet:true\}\)/);
  assert.match(app, /runSettlementSync\(\{period,automatic:true,buyersOnly:/);
  assert.match(app, /\["waitpay", "waitconfirm", "waitexpress", "recent"\]/);
  assert.match(app, /function needsSettlementBuyerBackfill/);
  assert.match(app, /filter\(needsSettlementRecovery\)/);
  assert.match(app, /buyersOnly:!resultPendingBefore && buyerMissingBefore > 0/);
  assert.match(app, /if \(!buyersOnly\) \{\s*dealsResult = await MxiqiConnector\.syncAuctionDeals/);
});

test("settlement actions are gated until period unpaid and return work is complete", () => {
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const workflow = fs.readFileSync(path.join(root, "workflow-core.js"), "utf8");
  assert.match(html, /id="settlement-blockers"/);
  assert.match(app, /function requireSettlementReady/);
  assert.match(app, /先处理本期全部待付款和拖回事项/);
  assert.match(app, /if \(!requireSettlementReady\(\)\) return/);
  assert.match(workflow, /function settlementReadiness/);
  assert.match(workflow, /"拖回\/发回", "拖回\/再拍", "寄存"/);
  assert.match(workflow, /"拆单待付款"/);
});

test("dashboard exposes auction-result, wait-pay and wait-shipping sync with a dedicated reauction library", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(html, /id="sync-auction-results"[^>]*>同步拍卖结果<\/button>/);
  assert.match(html, /id="sync-unpaid-orders"/);
  assert.match(html, /id="sync-shipping-orders"/);
  assert.match(html, /value="waitpay"/);
  assert.match(html, /data-stage="reauction"/);
  assert.match(html, /<th>拍品状态<\/th>/);
  assert.match(app, /trigger === "payment"\s*\?\s*"waitpay"/);
  assert.match(app, /\["auto", "shipping"\]\.includes\(trigger\)/);
  assert.match(app, /runCollector\("shipping"\)/);
  assert.match(app, /function auctionResultSyncPeriod\(\)/);
  assert.match(app, /runSettlementSync\(\{period\}\)/);
  assert.match(app, /record\.returnDisposition === "拖回\/再拍"/);
});
