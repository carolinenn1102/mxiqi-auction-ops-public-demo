(() => {
  "use strict";

  const STORAGE_KEY = "mxiqi-public-demo-records-v1";
  const AUDIT_KEY = "mxiqi-public-demo-audit-v1";
  const SETTINGS_KEY = "mxiqi-public-demo-settings-v2";
  const CUSTOMERS_KEY = "mxiqi-public-demo-customers-v2";
  const COLLECTOR_KEY = "mxiqi-public-demo-collector-v1";
  const CONNECTION_KEY = "mxiqi-public-demo-connection-v1";
  const MIGRATION_KEY = "mxiqi-public-demo-schema";
  const BACKUP_META_KEY = "mxiqi-public-demo-last-backup";

  const defaultSettings = {
    defaultCommissionType: "percent",
    defaultCommissionValue: 8,
    birthdayCommissionType: "percent",
    birthdayCommissionValue: 5,
    birthdayLabel: "生日月优惠",
    sfThreshold: 1000,
  };

  const defaultCollector = {
    intervalSeconds: 60,
    idleMinutes: 10,
    lastRunAt: "",
    runCount: 0,
    lastResult: "未执行采集",
    adapter: "demo",
  };

  const defaultConnection = {
    status: "disconnected",
    mode: "demo",
    method: "password",
    connectedAt: "",
    lastCheckedAt: "",
    label: "",
  };

  const seedCustomers = {
    "林先生·上海": { birthdayMonth: 7 },
    "周女士": { birthdayMonth: 12 },
  };

  const seedRecords = [
    {id:"d101",lot:101,itemName:"PMG 67EPQ 2024年龙年纪念钞",sellerWechat:"林先生·上海",contactedAt:"2026-07-12",projectName:"纪念钞专场",coinBoxId:"HX-DEMO-101",trackingNumber:"SF-DEMO-101-0001",auctionAt:"2026-07-28 20:00",auctionHouse:"夏日钱币精选",lotLabel:"A场 / Lot 101",received:"是",finalOutcome:"成交",finalPrice:1680,paymentStatus:"已付款",commissionAmount:84,settlementAmount:1596,profit:84,promotion:"生日月优惠 · 5%",startPrice:1000,primaryCategory:"钞票",secondaryCategory:"纪念钞",settled:false,carrier:"sf",carrierOverride:"",logisticsStatus:"ready",pickupCode:"DEMO-SF-101-A7K2",logisticsNote:"公开体验模拟码",recipientRaw:"演示收件人 13800000001 上海市浦东新区世纪大道100号",recipientName:"演示收件人",recipientPhone:"13800000001",addressProvince:"上海市",addressCity:"上海市",addressDistrict:"浦东新区",addressDetail:"世纪大道100号",addressStatus:"pending_review",shippingCarrier:"sf",mxiqiShippingStatus:""},
    {id:"d102",lot:102,itemName:"袁世凯像民国三年壹圆 银元",sellerWechat:"藏泉阁",contactedAt:"2026-07-13",projectName:"机制币专场",coinBoxId:"",trackingNumber:"",auctionAt:"2026-07-28 20:00",auctionHouse:"夏日钱币精选",lotLabel:"A场 / Lot 102",received:"是",finalOutcome:"成交",finalPrice:860,paymentStatus:"待付款",paymentDueAt:"2026-07-21T20:00",returnDisposition:"拖回/等待",commissionAmount:68.8,settlementAmount:791.2,profit:68.8,promotion:"普通佣金 · 8%",startPrice:500,primaryCategory:"硬币",secondaryCategory:"银元",settled:false,carrier:"cainiao",carrierOverride:"",logisticsStatus:"simulation_ready",pickupCode:"DEMO-CN-102-P8Q2",logisticsNote:"公开体验模拟码"},
    {id:"d103",lot:103,itemName:"T46 庚申年猴票 四方联",sellerWechat:"邮缘收藏",contactedAt:"2026-07-14",projectName:"经典邮票专场",coinBoxId:"",trackingNumber:"",auctionAt:"2026-07-29 19:30",auctionHouse:"邮品臻选",lotLabel:"B场 / Lot 103",received:"待确认",finalOutcome:"待拍",finalPrice:0,commissionAmount:0,settlementAmount:0,profit:0,startPrice:2200,primaryCategory:"邮票",secondaryCategory:"JT邮票",settled:false,carrier:"pending",carrierOverride:"",logisticsStatus:"not_requested",pickupCode:"",logisticsNote:""},
    {id:"d104",lot:104,itemName:"清乾隆青花缠枝莲纹盘",sellerWechat:"周女士",contactedAt:"2026-07-15",projectName:"古器物专场",coinBoxId:"",trackingNumber:"SF-DEMO-104-0001",auctionAt:"2026-07-30 20:00",auctionHouse:"东方古美术",lotLabel:"C场 / Lot 104",received:"是",finalOutcome:"成交",finalPrice:3260,paymentStatus:"已付款",commissionAmount:260.8,settlementAmount:2999.2,profit:260.8,promotion:"普通佣金 · 8%",startPrice:1800,primaryCategory:"陶瓷",secondaryCategory:"旧藏瓷器",settled:true,settledAt:"2026-07-20T08:30:00.000Z",settlementNote:"已转账",carrier:"sf",carrierOverride:"",logisticsStatus:"simulation_ready",pickupCode:"DEMO-SF-104-K3M8",logisticsNote:"公开体验模拟码",recipientRaw:"体验客户 13800000004 北京市朝阳区建国路88号",recipientName:"体验客户",recipientPhone:"13800000004",addressProvince:"北京市",addressCity:"北京市",addressDistrict:"朝阳区",addressDetail:"建国路88号",addressStatus:"reviewed",shippingCarrier:"sf",outboundTrackingNumber:"SF-DEMO-OUT-104-0001",mxiqiShippingStatus:"filled",addressReviewedAt:"2026-07-20T09:00:00.000Z",shippingOrderedAt:"2026-07-20T09:05:00.000Z",mxiqiFilledAt:"2026-07-20T09:08:00.000Z"},
    {id:"d105",lot:105,itemName:"1980年中国奥委会纪念铜章",sellerWechat:"",contactedAt:"",projectName:"章牌杂项",coinBoxId:"",trackingNumber:"",auctionAt:"2026-07-30 20:00",auctionHouse:"东方古美术",lotLabel:"C场 / Lot 105",received:"否",finalOutcome:"成交",finalPrice:420,paymentStatus:"已付款",commissionAmount:33.6,settlementAmount:386.4,profit:33.6,promotion:"普通佣金 · 8%",startPrice:100,primaryCategory:"章牌",secondaryCategory:"纪念章",settled:false,carrier:"cainiao",carrierOverride:"",logisticsStatus:"not_requested",pickupCode:"",logisticsNote:"",recipientRaw:"小王 13800000005 南山科技园科苑路",addressStatus:"needs_correction",shippingCarrier:"cainiao",mxiqiShippingStatus:""},
  ];

  const clone = (value) => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  const state = {
    records: loadArray(STORAGE_KEY, seedRecords),
    audit: loadArray(AUDIT_KEY, []),
    settings: loadObject(SETTINGS_KEY, defaultSettings),
    customers: loadObject(CUSTOMERS_KEY, seedCustomers),
    collector: loadObject(COLLECTOR_KEY, defaultCollector),
    connection: loadObject(CONNECTION_KEY, defaultConnection),
    stage: "all",
    query: "",
    filters: {seller:"",auction:"",outcome:"",disposition:"",shipping:""},
    settlementScope: {seller:"",from:"",to:""},
    selected: new Set(),
    editingId: "",
    shippingId: "",
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const currency = new Intl.NumberFormat("zh-CN", {style:"currency",currency:"CNY",maximumFractionDigits:2});
  const editDialog = $("#edit-dialog");
  const editForm = $("#edit-form");
  const importDialog = $("#import-dialog");
  const auditDialog = $("#audit-dialog");
  const settingsDialog = $("#settings-dialog");
  const settingsForm = $("#settings-form");
  const backupDialog = $("#backup-dialog");
  const shippingDialog = $("#shipping-dialog");
  const shippingForm = $("#shipping-form");
  const connectionDialog = $("#connection-dialog");
  let pendingBackupFile = null;
  const collectorRuntime = {running:false,busy:false,nextRunAt:0,lastActivityAt:Date.now()};

  function loadArray(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : clone(fallback);
    } catch {
      return clone(fallback);
    }
  }

  function loadObject(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === "object" && !Array.isArray(value) ? {...clone(fallback), ...value} : clone(fallback);
    } catch {
      return clone(fallback);
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
    localStorage.setItem(AUDIT_KEY, JSON.stringify(state.audit.slice(0, 200)));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(state.customers));
    localStorage.setItem(COLLECTOR_KEY, JSON.stringify(state.collector));
    localStorage.setItem(CONNECTION_KEY, JSON.stringify(state.connection));
  }

  function uid() {
    return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  }

  function compact(record) {
    return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== "" && value !== undefined && value !== null));
  }

  function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function audit(action, detail) {
    state.audit.unshift({id:uid(), action, detail, time:new Date().toISOString()});
    save();
  }

  function notify(text, tone = "success") {
    $("#toast").textContent = text;
    $("#toast").className = `toast ${tone}`;
    $("#toast").hidden = false;
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => { $("#toast").hidden = true; }, 4000);
  }

  function missing(record) {
    return [
      !record.sellerWechat && "送拍人",
      !record.contactedAt && "联系时间",
      !record.trackingNumber && "快递单号",
      !record.itemName && "拍品名称",
      !record.auctionAt && "拍卖时间",
      !record.lotLabel && "拍场/Lot",
      record.received === "待确认" && "是否收到",
      !record.finalOutcome && "成交状态",
      record.finalOutcome === "成交" && Number(record.finalPrice) <= 0 && "最终价格",
    ].filter(Boolean);
  }

  function auctionMonth(record) {
    const match = String(record.auctionAt || "").match(/^\d{4}-(\d{1,2})/);
    return match ? Number(match[1]) : new Date().getMonth() + 1;
  }

  function birthdayMonthFor(record) {
    return Number(record.birthdayMonth || state.customers[record.sellerWechat]?.birthdayMonth || 0);
  }

  function formatRule(type, value) {
    return type === "fixed" ? `每件 ${currency.format(value || 0)}` : `成交价的 ${Number(value || 0)}%`;
  }

  function commissionPlan(record) {
    const birthday = birthdayMonthFor(record);
    const isBirthday = Boolean(birthday && birthday === auctionMonth(record));
    const type = isBirthday ? state.settings.birthdayCommissionType : state.settings.defaultCommissionType;
    const value = Number(isBirthday ? state.settings.birthdayCommissionValue : state.settings.defaultCommissionValue) || 0;
    const label = isBirthday ? state.settings.birthdayLabel : "普通佣金";
    const gross = Math.max(0, Number(record.finalPrice) || 0);
    const amount = roundMoney(type === "fixed" ? value : gross * value / 100);
    return {amount:Math.min(amount, gross), label:`${label} · ${type === "fixed" ? currency.format(value) : `${value}%`}`, isBirthday, type, value};
  }

  function recalculateRecord(record, force = false) {
    const gross = Math.max(0, Number(record.finalPrice) || 0);
    if (record.settled && !force) return record;
    if (!gross || record.finalOutcome === "拖回") {
      record.commissionAmount = 0;
      record.settlementAmount = 0;
      record.profit = 0;
      record.promotion = "";
      return record;
    }
    const plan = commissionPlan(record);
    record.commissionAmount = plan.amount;
    record.settlementAmount = roundMoney(gross - plan.amount);
    record.profit = plan.amount;
    record.promotion = plan.label;
    return record;
  }

  function carrierFor(record) {
    return record.carrierOverride || (Number(record.finalPrice) >= Number(state.settings.sfThreshold || 1000) ? "sf" : "cainiao");
  }

  function carrierLabel(value) {
    return value === "sf" ? "顺丰" : value === "cainiao" ? "菜鸟" : "待判断";
  }

  function logisticsLabel(value) {
    return ({not_requested:"未申请",simulation_ready:"模拟流程",ready:"人工码已就绪",failed:"申请失败"})[value] || "未申请";
  }

  function isShippingCandidate(record) {
    return record.finalOutcome === "成交" && Number(record.finalPrice) > 0 && record.paymentStatus === "已付款" && record.returnDisposition !== "拖回/发回";
  }

  function shippingStage(record) {
    if (!isShippingCandidate(record)) return "not_ready";
    if (record.mxiqiShippingStatus === "filled") return "completed";
    if (record.outboundTrackingNumber) return "mxiqi_pending";
    if (record.addressStatus === "reviewed") return "ready_to_order";
    return "needs_address";
  }

  function shippingStageLabel(record) {
    return ({not_ready:"付款后进入发货",needs_address:"地址待二审",ready_to_order:"地址已审，可下单",mxiqi_pending:"单号待回填",completed:"发货已完成"})[shippingStage(record)];
  }

  function addressStatusLabel(value) {
    return ({pending_review:"拆分完成，待二审",needs_correction:"识别不完整，需修正",reviewed:"地址已二审"})[value] || "待录入地址";
  }

  function addressValuesFromForm() {
    const data = new FormData(shippingForm);
    return {
      recipientRaw:String(data.get("recipientRaw") || "").trim(),
      recipientName:String(data.get("recipientName") || "").trim(),
      recipientPhone:String(data.get("recipientPhone") || "").replace(/\D/g, ""),
      addressProvince:String(data.get("addressProvince") || "").trim(),
      addressCity:String(data.get("addressCity") || "").trim(),
      addressDistrict:String(data.get("addressDistrict") || "").trim(),
      addressDetail:String(data.get("addressDetail") || "").trim(),
      shippingCarrier:String(data.get("shippingCarrier") || "cainiao"),
    };
  }

  function addressMissing(values) {
    return [
      !values.recipientName && "收件人",
      !/^1[3-9]\d{9}$/.test(values.recipientPhone) && "11 位手机号",
      !values.addressProvince && "省",
      !values.addressCity && "市",
      !values.addressDistrict && "区/县",
      !values.addressDetail && "详细地址",
    ].filter(Boolean);
  }

  function splitRecipientAddress(raw) {
    const source = String(raw || "").replace(/[，,；;|｜\n\r\t]+/g, " ").replace(/\s+/g, " ").trim();
    const phoneMatch = source.match(/(?:\+?86[ -]?)?(1[3-9]\d{9})/);
    const recipientPhone = phoneMatch?.[1] || "";
    const withoutPhone = source.replace(phoneMatch?.[0] || "", " ").replace(/\s+/g, " ").trim();
    const provincePattern = /(北京市|上海市|天津市|重庆市|河北省|山西省|辽宁省|吉林省|黑龙江省|江苏省|浙江省|安徽省|福建省|江西省|山东省|河南省|湖北省|湖南省|广东省|海南省|四川省|贵州省|云南省|陕西省|甘肃省|青海省|台湾省|内蒙古自治区|广西壮族自治区|西藏自治区|宁夏回族自治区|新疆维吾尔自治区|香港特别行政区|澳门特别行政区)/;
    const provinceMatch = withoutPhone.match(provincePattern);
    let recipientName = "";
    let addressProvince = "";
    let addressCity = "";
    let addressDistrict = "";
    let addressDetail = "";
    if (provinceMatch) {
      recipientName = withoutPhone.slice(0, provinceMatch.index).trim().replace(/\s+/g, "");
      addressProvince = provinceMatch[1];
      let remaining = withoutPhone.slice(Number(provinceMatch.index) + addressProvince.length).replace(/\s+/g, "");
      if (["北京市","上海市","天津市","重庆市"].includes(addressProvince)) addressCity = addressProvince;
      else {
        const cityMatch = remaining.match(/^(.{2,10}?(?:市|自治州|地区|盟))/);
        addressCity = cityMatch?.[1] || "";
        remaining = remaining.slice(addressCity.length);
      }
      const districtMatch = remaining.match(/^(.{1,10}?(?:新区|区|县|旗))/);
      addressDistrict = districtMatch?.[1] || "";
      addressDetail = remaining.slice(addressDistrict.length).trim();
    } else {
      const tokens = withoutPhone.split(" ").filter(Boolean);
      if (tokens[0] && tokens[0].length <= 8) recipientName = tokens.shift();
      addressDetail = tokens.join("");
    }
    const values = {recipientRaw:source,recipientName,recipientPhone,addressProvince,addressCity,addressDistrict,addressDetail};
    const gaps = addressMissing(values);
    return {...values,addressStatus:gaps.length ? "needs_correction" : "pending_review",addressWarnings:gaps};
  }

  function soldRecords() {
    return state.records.filter((record) => Number(record.finalPrice) > 0 && record.finalOutcome !== "拖回");
  }

  function isPaymentOverdue(record) {
    if (record.paymentStatus !== "待付款" || !record.paymentDueAt || Number(record.finalPrice) <= 0) return false;
    const deadline = new Date(record.paymentDueAt).getTime();
    return Number.isFinite(deadline) && deadline < Date.now();
  }

  function datePart(value) {
    return String(value || "").slice(0, 10);
  }

  function paymentDeadlineFromAuction(value) {
    const source = String(value || "").trim().replace(" ", "T");
    const time = new Date(source).getTime();
    if (!Number.isFinite(time)) return "";
    const deadline = new Date(time + 24 * 60 * 60 * 1000);
    return new Date(deadline.getTime() - deadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }

  function ensurePaymentTracking(record) {
    if (Number(record.finalPrice) <= 0 || record.finalOutcome !== "成交") return record;
    if (!record.paymentStatus) record.paymentStatus = record.settled ? "已付款" : "待付款";
    if (record.paymentStatus === "待付款" && !record.paymentDueAt) record.paymentDueAt = paymentDeadlineFromAuction(record.auctionAt);
    return record;
  }

  function settlementRecords() {
    return soldRecords().filter((record) => {
      const date = datePart(record.auctionAt);
      return (!state.settlementScope.seller || record.sellerWechat === state.settlementScope.seller)
        && (!state.settlementScope.from || (date && date >= state.settlementScope.from))
        && (!state.settlementScope.to || (date && date <= state.settlementScope.to));
    });
  }

  function visibleRecords() {
    const query = state.query.trim().toLowerCase();
    return state.records.filter((record) => {
      const search = !query || [record.lot,record.itemName,record.sellerWechat,record.auctionHouse,record.trackingNumber,record.pickupCode,record.outboundTrackingNumber,record.recipientName,record.recipientPhone,record.recipientRaw,record.promotion].join(" ").toLowerCase().includes(query);
      const filters = (!state.filters.seller || record.sellerWechat === state.filters.seller)
        && (!state.filters.auction || record.auctionHouse === state.filters.auction)
        && (!state.filters.outcome || record.finalOutcome === state.filters.outcome)
        && (!state.filters.disposition || (state.filters.disposition === "overdue" ? isPaymentOverdue(record) : record.returnDisposition === state.filters.disposition))
        && (!state.filters.shipping || shippingStage(record) === state.filters.shipping);
      const stage = state.stage === "all"
        || (state.stage === "missing" && missing(record).length)
        || (state.stage === "pickup" && Number(record.finalPrice) > 0 && !record.pickupCode)
        || (state.stage === "shipping" && isShippingCandidate(record))
        || (state.stage === "settlement" && settlementRecords().some((item) => item.id === record.id));
      return search && filters && stage;
    });
  }

  function setDynamicOptions(selector, values, allLabel, current) {
    const select = $(selector);
    select.innerHTML = `<option value="">${esc(allLabel)}</option>${values.map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("")}`;
    select.value = current || "";
  }

  function renderFilterOptions() {
    const sellers = [...new Set(state.records.map((record) => record.sellerWechat).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    const auctions = [...new Set(state.records.map((record) => record.auctionHouse).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
    setDynamicOptions("#filter-seller", sellers, "全部", state.filters.seller);
    setDynamicOptions("#filter-auction", auctions, "全部", state.filters.auction);
    $("#filter-outcome").value = state.filters.outcome;
    $("#filter-disposition").value = state.filters.disposition;
    $("#filter-shipping").value = state.filters.shipping;
    setDynamicOptions("#settlement-seller", sellers, "全部送拍人", state.settlementScope.seller);
    $("#settlement-from").value = state.settlementScope.from;
    $("#settlement-to").value = state.settlementScope.to;
  }

  function renderSellerSummary() {
    const periodRecords = soldRecords().filter((record) => {
      const date = datePart(record.auctionAt);
      return (!state.settlementScope.from || (date && date >= state.settlementScope.from))
        && (!state.settlementScope.to || (date && date <= state.settlementScope.to));
    });
    const grouped = new Map();
    periodRecords.forEach((record) => {
      const seller = record.sellerWechat || "待补送拍人";
      const current = grouped.get(seller) || {seller,count:0,gross:0,payable:0,pending:0};
      current.count += 1;
      current.gross += Number(record.finalPrice || 0);
      current.payable += Number(record.settlementAmount || 0);
      if (!record.settled) current.pending += 1;
      grouped.set(seller, current);
    });
    const entries = [...grouped.values()].sort((a, b) => b.payable - a.payable);
    $("#seller-summary-list").innerHTML = entries.length ? entries.map((item) => `<button class="seller-summary-item ${state.settlementScope.seller === item.seller ? "active" : ""}" data-seller-summary="${esc(item.seller === "待补送拍人" ? "" : item.seller)}"><span><b>${esc(item.seller)}</b><small>${item.count} 件 · ${item.pending} 件待结账 · 成交 ${currency.format(item.gross)}</small></span><strong>${currency.format(item.payable)}</strong></button>`).join("") : '<div class="audit-empty">当前时间段暂无成交记录</div>';
  }

  function renderSettlementSummary() {
    const sold = settlementRecords();
    const settled = sold.filter((record) => record.settled);
    const remaining = sold.length - settled.length;
    const percent = sold.length ? Math.round(settled.length * 100 / sold.length) : 0;
    $("#settlement-summary").hidden = state.stage !== "settlement";
    $("#settled-count").textContent = settled.length;
    $("#sold-count").textContent = sold.length;
    $("#settlement-progress").style.width = `${percent}%`;
    $("#settlement-gross").textContent = currency.format(sold.reduce((sum, record) => sum + Number(record.finalPrice || 0), 0));
    $("#settlement-commission").textContent = currency.format(sold.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0));
    $("#settlement-payable").textContent = currency.format(sold.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0));
    $("#settlement-hint").textContent = remaining ? `还有 ${remaining} 条待确认，全部结账后开放结算表导出。` : "本批成交记录已全部结账，可以导出结算表。";
    $("#export-settlement").disabled = !(sold.length && remaining === 0);
    $("#export-settlement").textContent = remaining ? `还有 ${remaining} 条未结账` : "导出本批结算表";
    $("#export-settlement-image").disabled = !(sold.length && remaining === 0);
    renderSellerSummary();
  }

  function nextShippingRecord() {
    const priority = {mxiqi_pending:0,ready_to_order:1,needs_address:2};
    return state.records.filter((record) => isShippingCandidate(record) && shippingStage(record) !== "completed").sort((a, b) => (priority[shippingStage(a)] ?? 9) - (priority[shippingStage(b)] ?? 9) || Number(a.lot) - Number(b.lot))[0];
  }

  function renderShippingSummary() {
    const candidates = state.records.filter(isShippingCandidate);
    const counts = {needs_address:0,ready_to_order:0,mxiqi_pending:0,completed:0};
    candidates.forEach((record) => { const stage = shippingStage(record); if (counts[stage] !== undefined) counts[stage] += 1; });
    const pending = candidates.length - counts.completed;
    $("#shipping-summary").hidden = state.stage !== "shipping";
    $("#shipping-pending-count").textContent = pending;
    $("#shipping-address-count").textContent = counts.needs_address;
    $("#shipping-order-count").textContent = counts.ready_to_order;
    $("#shipping-fill-count").textContent = counts.mxiqi_pending;
    $("#shipping-complete-count").textContent = counts.completed;
    $("#shipping-next").disabled = !pending;
    $("#shipping-next").textContent = pending ? "处理下一单" : "本批发货已完成";
  }

  function render() {
    const records = state.records;
    renderFilterOptions();
    $("#metric-total").textContent = records.length;
    $("#metric-missing").textContent = records.filter((item) => missing(item).length).length;
    $("#metric-pickup").textContent = records.filter((item) => Number(item.finalPrice) > 0 && !item.pickupCode).length;
    $("#metric-shipping").textContent = records.filter((item) => isShippingCandidate(item) && shippingStage(item) !== "completed").length;
    $("#metric-settlement").textContent = records.filter((item) => Number(item.finalPrice) > 0 && !item.settled).length;
    $("#metric-amount").textContent = `成交额 ${currency.format(records.reduce((sum, item) => sum + Number(item.finalPrice || 0), 0))}`;
    $$('[data-stage]').forEach((button) => button.classList.toggle("selected", button.dataset.stage === state.stage));
    $$('.nav-item[data-stage]').forEach((button) => button.classList.toggle("active", button.dataset.stage === state.stage));

    const visible = visibleRecords();
    $("#result-count").textContent = `${visible.length} 条结果`;
    const selectable = visible.filter((item) => Number(item.finalPrice) > 0);
    $("#select-all").checked = selectable.length > 0 && selectable.every((item) => state.selected.has(item.id));
    const selectedCount = state.selected.size;
    $("#selection-count").hidden = !selectedCount;
    $("#batch-pickup").hidden = !selectedCount || state.stage === "settlement";
    $("#batch-settle").hidden = !selectedCount || state.stage !== "settlement";
    $("#clear-selection").hidden = !selectedCount;
    $("#selection-count").textContent = `已选 ${selectedCount} 条`;
    renderShippingSummary();
    renderSettlementSummary();

    const body = $("#records-body");
    if (!visible.length) {
      body.innerHTML = '<tr><td colspan="10" class="empty-state">没有匹配的拍品，调整筛选条件试试。</td></tr>';
      return;
    }

    body.innerHTML = visible.map((record) => {
      const gaps = missing(record);
      const carrier = record.carrier || carrierFor(record);
      const settlementDetail = Number(record.finalPrice) > 0
        ? `${record.settlementAmount ? currency.format(record.settlementAmount) : "待计算"} · 佣金 ${currency.format(record.commissionAmount || 0)}`
        : "";
      const deliveryCode = record.outboundTrackingNumber || record.pickupCode || "";
      const deliveryHint = record.outboundTrackingNumber
        ? `${record.mxiqiShippingStatus === "filled" ? "麦稀奇已回填" : "出库单号待回填"} · ${addressStatusLabel(record.addressStatus)}`
        : record.pickupCode ? "模拟取件码，不可寄件" : shippingStageLabel(record);
      return `<tr class="${state.selected.has(record.id) ? "selected-row" : ""}">
        <td class="select-column"><input type="checkbox" data-select="${esc(record.id)}" ${state.selected.has(record.id) ? "checked" : ""} ${Number(record.finalPrice) <= 0 ? "disabled" : ""}></td>
        <td><div class="lot-cell"><span>${record.lot}</span><div><b>${esc(record.itemName)}</b><small>${esc(record.projectName || record.primaryCategory || "未设置项目")}</small></div></div></td>
        <td><b class="${record.sellerWechat ? "" : "muted"}">${esc(record.sellerWechat || "待补")}</b><small>${esc(record.trackingNumber || "未填快递单号")}</small></td>
        <td><b>${esc(record.auctionHouse || "待设置拍场")}</b><small>${esc(record.auctionAt || "待设置时间")}</small></td>
        <td><b class="money">${Number(record.finalPrice) > 0 ? currency.format(record.finalPrice) : "待拍"}</b><small>${esc(record.finalOutcome || "状态待确认")}${record.paymentStatus ? ` · ${esc(record.paymentStatus)}` : ""}</small>${isPaymentOverdue(record) ? '<span class="chip overdue">超时未付款</span>' : ""}${record.returnDisposition ? `<span class="chip disposition">${esc(record.returnDisposition)}</span>` : ""}</td>
        <td>${gaps.length ? `<button class="chip warning" data-action="edit" data-id="${esc(record.id)}" title="${esc(gaps.join("、"))}">缺 ${gaps.length} 项</button>` : '<span class="chip success">完整</span>'}</td>
        <td><span class="carrier ${carrier}">${carrierLabel(carrier)}</span><small>${logisticsLabel(record.logisticsStatus)} · ${esc(shippingStageLabel(record))}</small></td>
        <td>${deliveryCode ? `<code>${esc(deliveryCode)}</code>` : '<span class="muted">—</span>'}<small>${esc(deliveryHint)}</small></td>
        <td>${record.settled ? '<span class="chip success">已结账</span>' : '<span class="chip neutral">未结账</span>'}<small>${esc(settlementDetail)}</small><small>${esc(record.promotion || "")}</small></td>
        <td><div class="row-actions"><button data-action="edit" data-id="${esc(record.id)}">编辑</button><button data-action="pickup" data-id="${esc(record.id)}" ${Number(record.finalPrice) <= 0 ? "disabled" : ""}>取件</button><button data-action="manual" data-id="${esc(record.id)}">录码</button><button data-action="shipping" data-id="${esc(record.id)}" ${!isShippingCandidate(record) ? "disabled" : ""}>发货</button><button data-action="toggle-settle" data-id="${esc(record.id)}" ${Number(record.finalPrice) <= 0 ? "disabled" : ""}>${record.settled ? "撤销" : "结账"}</button></div></td>
      </tr>`;
    }).join("");
  }

  function previewCommission() {
    const data = new FormData(editForm);
    const temporary = {
      sellerWechat: String(data.get("sellerWechat") || "").trim(),
      birthdayMonth: Number(data.get("birthdayMonth") || 0),
      auctionAt: String(data.get("auctionAt") || ""),
      finalPrice: Number(data.get("finalPrice") || 0),
    };
    const plan = commissionPlan(temporary);
    const gross = Math.max(0, temporary.finalPrice);
    editForm.elements.commissionAmount.value = gross ? plan.amount : 0;
    editForm.elements.settlementAmount.value = gross ? roundMoney(gross - plan.amount) : 0;
    editForm.elements.profit.value = gross ? plan.amount : 0;
    editForm.elements.promotion.value = gross ? plan.label : "";
  }

  function openEditor(id = "") {
    state.editingId = id;
    editForm.reset();
    const record = state.records.find((item) => item.id === id) || {lot:Math.max(0, ...state.records.map((item) => Number(item.lot) || 0)) + 1,received:"待确认",settled:false};
    $("#edit-title").textContent = id ? `Lot ${record.lot}` : "新建拍品";
    [...editForm.elements].forEach((element) => {
      if (!element.name) return;
      let value = record[element.name];
      if (element.name === "birthdayMonth") value = birthdayMonthFor(record) || "";
      if (element.type === "checkbox") element.checked = Boolean(value);
      else element.value = value ?? "";
    });
    previewCommission();
    editDialog.showModal();
  }

  function setShippingStep(selector, status) {
    const step = $(selector);
    step.classList.remove("done", "current");
    if (status) step.classList.add(status);
  }

  function populateShippingForm(record) {
    ["recipientRaw","recipientName","recipientPhone","addressProvince","addressCity","addressDistrict","addressDetail","outboundTrackingNumber"].forEach((name) => {
      shippingForm.elements[name].value = record[name] || "";
    });
    shippingForm.elements.shippingCarrier.value = record.shippingCarrier || record.carrier || carrierFor(record);
  }

  function renderShippingDialog(record, populate = true) {
    if (populate) populateShippingForm(record);
    const stage = shippingStage(record);
    const addressGaps = addressMissing(record);
    const hasWaybill = Boolean(record.outboundTrackingNumber);
    const filled = record.mxiqiShippingStatus === "filled";
    $("#shipping-title").textContent = `Lot ${record.lot} · ${record.itemName}`;
    $("#shipping-payment-state").textContent = isShippingCandidate(record) ? "已付款，可进入发货" : "未付款，不可发货";
    $("#shipping-address-state").textContent = addressStatusLabel(record.addressStatus);
    $("#shipping-order-state").textContent = hasWaybill ? `${carrierLabel(record.shippingCarrier)} · 已生成单号` : record.addressStatus === "reviewed" ? "可以下单" : "等待地址二审";
    $("#shipping-fill-state").textContent = filled ? "已确认回填" : hasWaybill ? "复制后待确认" : "尚无单号";
    $("#shipping-address-badge").textContent = addressStatusLabel(record.addressStatus);
    setShippingStep("#shipping-step-payment", isShippingCandidate(record) ? "done" : "current");
    setShippingStep("#shipping-step-address", record.addressStatus === "reviewed" ? "done" : isShippingCandidate(record) ? "current" : "");
    setShippingStep("#shipping-step-order", hasWaybill ? "done" : record.addressStatus === "reviewed" ? "current" : "");
    setShippingStep("#shipping-step-fill", filled ? "done" : hasWaybill ? "current" : "");

    const message = $("#shipping-address-message");
    message.className = "address-review-message";
    if (record.addressStatus === "reviewed") {
      message.classList.add("success");
      message.textContent = "二次审核已通过。下单前仍请对照麦稀奇原始订单确认一次。";
    } else if (addressGaps.length) {
      message.classList.add("error");
      message.textContent = `还需补充或修正：${addressGaps.join("、")}。`;
    } else {
      message.textContent = "拆分结果只作参考，请逐项核对后点击“确认二次审核无误”。";
    }

    const addressLocked = hasWaybill;
    ["recipientRaw","recipientName","recipientPhone","addressProvince","addressCity","addressDistrict","addressDetail"].forEach((name) => { shippingForm.elements[name].disabled = addressLocked; });
    shippingForm.elements.shippingCarrier.disabled = hasWaybill;
    $("#shipping-split-address").disabled = addressLocked;
    $("#shipping-review-address").disabled = addressLocked;
    $("#shipping-create-order").disabled = !isShippingCandidate(record) || record.addressStatus !== "reviewed" || hasWaybill;
    $("#shipping-copy-waybill").disabled = !hasWaybill;
    $("#shipping-confirm-fill").disabled = !hasWaybill || filled;
    $("#shipping-confirm-fill").textContent = filled ? "已确认回填" : "模拟确认已回填";
    $("#shipping-order-note").textContent = filled
      ? `演示单号 ${record.outboundTrackingNumber} 已标记为麦稀奇回填完成。`
      : hasWaybill
        ? `已生成演示单号 ${record.outboundTrackingNumber}。请复制到麦稀奇，粘贴后再确认回填。`
        : !isShippingCandidate(record)
          ? "订单尚未确认付款，暂不能进入发货。"
          : record.addressStatus !== "reviewed"
            ? "未完成地址二审，暂不能下单。"
            : `地址已二审，可模拟向${carrierLabel(shippingForm.elements.shippingCarrier.value)}下单。`;
  }

  function openShipping(id) {
    const record = state.records.find((item) => item.id === id);
    if (!record) return;
    state.shippingId = id;
    shippingForm.reset();
    renderShippingDialog(record);
    shippingDialog.showModal();
  }

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(value);
    const area = document.createElement("textarea");
    area.value = value;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  function requestPickup(record) {
    const carrier = carrierFor(record);
    record.carrier = carrier;
    record.logisticsStatus = "simulation_ready";
    record.pickupCode = `DEMO-${carrier === "sf" ? "SF" : "CN"}-${record.lot}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    record.logisticsNote = "公开体验模拟码，不可用于真实寄件";
    audit("申请模拟取件", `Lot ${record.lot} · ${carrierLabel(carrier)}`);
  }

  function upsert(records) {
    for (const incoming of records) {
      const lot = Number(incoming.lot);
      if (!Number.isInteger(lot) || lot <= 0 || !incoming.itemName) continue;
      const index = state.records.findIndex((item) => Number(item.lot) === lot);
      if (index >= 0) {
        state.records[index] = {...state.records[index], ...incoming, id:state.records[index].id};
        ensurePaymentTracking(state.records[index]);
        recalculateRecord(state.records[index]);
      } else {
        const record = {...incoming,id:uid(),received:incoming.received || "待确认",settled:Boolean(incoming.settled),carrier:incoming.carrier || "pending",logisticsStatus:incoming.logisticsStatus || "not_requested",pickupCode:incoming.pickupCode || ""};
        ensurePaymentTracking(record);
        recalculateRecord(record);
        state.records.push(record);
      }
    }
    save();
    render();
  }

  function updateRulePreviews() {
    const data = new FormData(settingsForm);
    $("#default-rule-preview").textContent = `示例：成交价 ¥1,000 时，${formatRule(data.get("defaultCommissionType"), Number(data.get("defaultCommissionValue") || 0))}。`;
    $("#birthday-rule-preview").textContent = `生日月份内，${formatRule(data.get("birthdayCommissionType"), Number(data.get("birthdayCommissionValue") || 0))}，整月自动应用。`;
  }

  function openSettings() {
    [...settingsForm.elements].forEach((element) => {
      if (element.name && state.settings[element.name] !== undefined) element.value = state.settings[element.name];
    });
    updateRulePreviews();
    settingsDialog.showModal();
  }

  function connectionMethodLabel(value) {
    return ({password:"手机号 + 密码",sms:"手机验证码",wechat:"微信登录",qq:"QQ 登录"})[value] || "未选择";
  }

  function isCollectorConnected() {
    return state.connection.status === "demo_connected" || state.connection.status === "connected";
  }

  function connectionTime(value) {
    return value ? new Date(value).toLocaleString("zh-CN", {month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}) : "尚未检查";
  }

  function renderConnectionPanel() {
    const connected = isCollectorConnected();
    const isDemo = state.connection.status === "demo_connected";
    $("#connection-runtime-status").textContent = connected ? isDemo ? "演示登录已连接（非真实账号）" : "麦稀奇会话已连接" : "未连接，采集已锁定";
    $("#connection-runtime-detail").textContent = connected
      ? isDemo ? "只用于体验登录门禁和采集调度；真实麦稀奇数据源仍未连接。" : "连接器可以在授权范围内执行采集。"
      : "请先选择登录方式并在麦稀奇官方页面完成登录。";
    $("#connection-runtime-type").textContent = connected ? `${connectionMethodLabel(state.connection.method)} · ${isDemo ? "演示" : "正式"}` : "无";
    $("#connection-last-checked").textContent = connectionTime(state.connection.lastCheckedAt);
    $("#connection-light").classList.toggle("connected", connected);
    $("#connection-sidebar-status").textContent = connected ? isDemo ? "演示登录已连接" : "麦稀奇已登录" : "麦稀奇未登录";
    document.querySelector(".status-dot.connection")?.classList.toggle("connected", connected);
    $("#connection-status-text").textContent = connected ? isDemo ? "演示登录已连接" : "麦稀奇已登录" : "麦稀奇未登录";
    $("#connection-status-button").classList.toggle("connected", connected);
    $("#connection-demo-login").disabled = connected;
    $("#connection-check").disabled = false;
    $("#connection-logout").disabled = !connected;
    $$("input[name='connectionMethod']").forEach((input) => { input.disabled = connected; });
  }

  function openConnection() {
    const method = state.connection.method || "password";
    $$("input[name='connectionMethod']").forEach((input) => { input.checked = input.value === method; });
    renderConnectionPanel();
    connectionDialog.showModal();
  }

  function collectorTime(value) {
    return value ? new Date(value).toLocaleString("zh-CN", {month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}) : "尚未刷新";
  }

  function collectorCountdown() {
    if (!collectorRuntime.running || !collectorRuntime.nextRunAt) return "—";
    const seconds = Math.max(0, Math.ceil((collectorRuntime.nextRunAt - Date.now()) / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return minutes ? `${minutes}分${String(remainder).padStart(2, "0")}秒` : `${seconds} 秒`;
  }

  function renderCollectorPanel() {
    const connected = isCollectorConnected();
    const status = !connected ? "等待平台登录，采集已锁定" : collectorRuntime.busy ? "正在执行一次刷新…" : collectorRuntime.running ? `自动采集中 · 每 ${state.collector.intervalSeconds} 秒一次` : "已停止，不会自动请求";
    $("#collector-runtime-status").textContent = status;
    $("#collector-last-run").textContent = collectorTime(state.collector.lastRunAt);
    $("#collector-next-run").textContent = collectorCountdown();
    $("#collector-run-count").textContent = `${Number(state.collector.runCount || 0)} 次`;
    $("#collector-last-result").textContent = state.collector.lastResult || "未执行采集";
    $("#collector-light").className = `collector-light ${collectorRuntime.busy ? "busy" : collectorRuntime.running ? "running" : ""}`;
    $("#collector-start").disabled = collectorRuntime.running || !connected;
    $("#collector-stop").disabled = !collectorRuntime.running;
    $("#collector-refresh").disabled = collectorRuntime.busy || !connected;
    $("#collector-interval").disabled = collectorRuntime.busy;
    $("#collector-idle").disabled = collectorRuntime.busy;
    $("#collector-sidebar-status").textContent = !connected ? "等待登录后采集" : collectorRuntime.busy ? "正在刷新数据" : collectorRuntime.running ? `自动采集 ${collectorCountdown()}` : "采集已停止";
    const sidebarDot = document.querySelector(".status-dot.collector");
    sidebarDot?.classList.toggle("running", collectorRuntime.running || collectorRuntime.busy);
  }

  async function runCollector(trigger = "manual") {
    if (!isCollectorConnected()) {
      state.collector.lastResult = "未执行：请先建立麦稀奇登录连接";
      save();
      renderCollectorPanel();
      notify("请先在“平台登录”中建立连接", "error");
      return false;
    }
    if (collectorRuntime.busy) return;
    collectorRuntime.busy = true;
    renderCollectorPanel();
    try {
      await new Promise((resolve) => setTimeout(resolve, 550));
      const checked = state.records.length;
      const now = new Date().toISOString();
      state.collector.lastRunAt = now;
      state.collector.runCount = Number(state.collector.runCount || 0) + 1;
      state.collector.lastResult = `演示刷新完成：检查 ${checked} 条本机拍品，真实数据源未连接，0 条变更`;
      audit(trigger === "auto" ? "自动演示刷新" : "手动演示刷新", `检查 ${checked} 条，0 条变更`);
      save();
    } catch (error) {
      state.collector.lastResult = `刷新失败：${error.message || "未知错误"}`;
      save();
    } finally {
      collectorRuntime.busy = false;
      if (collectorRuntime.running) collectorRuntime.nextRunAt = Date.now() + Number(state.collector.intervalSeconds) * 1000;
      renderCollectorPanel();
    }
  }

  function startCollector() {
    if (!isCollectorConnected()) {
      state.collector.lastResult = "未执行：请先建立麦稀奇登录连接";
      save();
      renderCollectorPanel();
      notify("请先在“平台登录”中建立连接", "error");
      return false;
    }
    state.collector.intervalSeconds = Number($("#collector-interval").value || 60);
    state.collector.idleMinutes = Number($("#collector-idle").value || 10);
    collectorRuntime.running = true;
    collectorRuntime.lastActivityAt = Date.now();
    collectorRuntime.nextRunAt = Date.now() + state.collector.intervalSeconds * 1000;
    audit("开始自动采集", `每 ${state.collector.intervalSeconds} 秒；闲置 ${state.collector.idleMinutes} 分钟自动停止`);
    save();
    renderCollectorPanel();
    notify(`自动采集已开启，${state.collector.intervalSeconds} 秒后首次刷新`, "info");
  }

  function stopCollector(reason = "手动停止", showNotice = true) {
    if (!collectorRuntime.running && !collectorRuntime.busy) return;
    collectorRuntime.running = false;
    collectorRuntime.nextRunAt = 0;
    audit("停止自动采集", reason);
    save();
    renderCollectorPanel();
    if (showNotice) notify(reason, "info");
  }

  function collectorTick() {
    if (!collectorRuntime.running) return renderCollectorPanel();
    const idleMs = Number(state.collector.idleMinutes || 10) * 60 * 1000;
    if (Date.now() - collectorRuntime.lastActivityAt >= idleMs) {
      stopCollector(`已闲置 ${state.collector.idleMinutes} 分钟，自动采集已停止`);
      return;
    }
    if (!collectorRuntime.busy && Date.now() >= collectorRuntime.nextRunAt) void runCollector("auto");
    renderCollectorPanel();
  }

  function openCollector() {
    $("#collector-interval").value = String(state.collector.intervalSeconds || 60);
    $("#collector-idle").value = String(state.collector.idleMinutes || 10);
    renderConnectionPanel();
    renderCollectorPanel();
    $("#collector-dialog").showModal();
  }

  function updateBackupSummary() {
    const lastBackup = localStorage.getItem(BACKUP_META_KEY);
    const customerCount = Object.values(state.customers).filter((customer) => Number(customer.birthdayMonth) > 0).length;
    const shippingPending = state.records.filter((record) => isShippingCandidate(record) && shippingStage(record) !== "completed").length;
    const connectionLabel = isCollectorConnected() ? state.connection.status === "demo_connected" ? "演示登录已连接" : "平台已连接" : "平台未登录";
    $("#backup-summary").textContent = `${state.records.length} 条拍品 · ${customerCount} 位客户已设生日月 · ${shippingPending} 单待发货 · ${connectionLabel} · 采集间隔 ${state.collector.intervalSeconds} 秒${lastBackup ? ` · 上次备份 ${new Date(lastBackup).toLocaleString("zh-CN")}` : " · 尚未下载过备份"}`;
  }

  function openBackup() {
    pendingBackupFile = null;
    $("#backup-file").value = "";
    $("#restore-backup").disabled = true;
    $("#backup-file-name").textContent = "尚未选择备份文件";
    updateBackupSummary();
    backupDialog.showModal();
  }

  function downloadBlob(content, name, type) {
    const blob = content instanceof Blob ? content : new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function downloadBackup() {
    const exportedAt = new Date().toISOString();
    const backup = {schemaVersion:6,exportedAt,records:state.records,settings:state.settings,customers:state.customers,collector:state.collector,connection:state.connection,audit:state.audit};
    downloadBlob(JSON.stringify(backup, null, 2), `送拍工作台_完整备份_${exportedAt.slice(0, 10)}.json`, "application/json;charset=utf-8");
    localStorage.setItem(BACKUP_META_KEY, exportedAt);
    audit("下载完整备份", `${state.records.length} 条拍品`);
    updateBackupSummary();
    notify("完整备份已下载，请妥善保存");
  }

  async function restoreBackup() {
    if (!pendingBackupFile) return;
    try {
      const backup = JSON.parse(await pendingBackupFile.text());
      if (!backup || !Array.isArray(backup.records)) throw new Error("备份文件格式不正确");
      state.records = backup.records.map((record) => ({...record,id:record.id || uid()}));
      state.settings = backup.settings && typeof backup.settings === "object" ? {...defaultSettings, ...backup.settings} : clone(defaultSettings);
      state.customers = backup.customers && typeof backup.customers === "object" ? backup.customers : {};
      state.collector = backup.collector && typeof backup.collector === "object" ? {...defaultCollector, ...backup.collector} : clone(defaultCollector);
      const restoredConnection = backup.connection && typeof backup.connection === "object" ? {...defaultConnection, ...backup.connection} : clone(defaultConnection);
      state.connection = restoredConnection.status === "demo_connected" ? restoredConnection : clone(defaultConnection);
      state.audit = Array.isArray(backup.audit) ? backup.audit : [];
      collectorRuntime.running = false;
      collectorRuntime.busy = false;
      collectorRuntime.nextRunAt = 0;
      state.selected.clear();
      audit("恢复完整备份", `${state.records.length} 条拍品`);
      save();
      render();
      renderConnectionPanel();
      renderCollectorPanel();
      backupDialog.close();
      notify(`已恢复 ${state.records.length} 条拍品及全部规则`);
    } catch (error) {
      notify(error.message || "备份恢复失败", "error");
    }
  }

  $$('[data-stage]').forEach((button) => button.addEventListener("click", () => {
    state.stage = button.dataset.stage;
    state.selected.clear();
    render();
  }));
  $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => button.closest("dialog")?.close("cancel")));
  $("#search").addEventListener("input", (event) => { state.query = event.target.value; render(); });
  [["#filter-seller","seller"],["#filter-auction","auction"],["#filter-outcome","outcome"],["#filter-disposition","disposition"],["#filter-shipping","shipping"]].forEach(([selector, key]) => {
    $(selector).addEventListener("change", (event) => { state.filters[key] = event.target.value; state.selected.clear(); render(); });
  });
  $("#clear-filters").addEventListener("click", () => {
    state.filters = {seller:"",auction:"",outcome:"",disposition:"",shipping:""};
    state.query = "";
    $("#search").value = "";
    state.selected.clear();
    render();
  });
  $("#settlement-seller").addEventListener("change", (event) => { state.settlementScope.seller = event.target.value; state.filters.seller = ""; state.selected.clear(); render(); });
  $("#settlement-from").addEventListener("change", (event) => { state.settlementScope.from = event.target.value; state.selected.clear(); render(); });
  $("#settlement-to").addEventListener("change", (event) => { state.settlementScope.to = event.target.value; state.selected.clear(); render(); });
  $("#seller-summary-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-seller-summary]");
    if (!button) return;
    state.settlementScope.seller = button.dataset.sellerSummary;
    state.filters.seller = "";
    state.selected.clear();
    render();
  });
  $("#records-body").addEventListener("change", (event) => {
    const id = event.target.dataset.select;
    if (!id) return;
    event.target.checked ? state.selected.add(id) : state.selected.delete(id);
    render();
  });

  $("#records-body").addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const record = state.records.find((item) => item.id === button.dataset.id);
    if (!record) return;
    if (button.dataset.action === "edit") openEditor(record.id);
    if (button.dataset.action === "shipping") openShipping(record.id);
    if (button.dataset.action === "pickup") {
      requestPickup(record);
      save();
      render();
      notify(`Lot ${record.lot} 已生成明确标识的模拟码`, "info");
    }
    if (button.dataset.action === "manual") {
      const code = prompt("请输入已核验的取件码；公开体验版不会连接真实物流平台。", String(record.pickupCode || "").startsWith("DEMO-") ? "" : record.pickupCode || "");
      if (code && code.trim()) {
        record.pickupCode = code.trim();
        record.logisticsStatus = "ready";
        record.carrier = carrierFor(record);
        record.logisticsNote = "体验者人工录入";
        audit("人工录码", `Lot ${record.lot}`);
        save();
        render();
        notify("人工取件码已保存在当前浏览器");
      }
    }
    if (button.dataset.action === "toggle-settle" && Number(record.finalPrice) > 0) {
      if (record.settled) {
        record.settled = false;
        record.settledAt = "";
        audit("撤销结账", `Lot ${record.lot}`);
      } else {
        recalculateRecord(record, true);
        record.settled = true;
        record.settledAt = new Date().toISOString();
        record.settlementNote = record.settlementNote || "网页确认结账";
        audit("确认结账", `Lot ${record.lot} · ${currency.format(record.settlementAmount)}`);
      }
      save();
      render();
    }
  });

  $("#select-all").addEventListener("change", (event) => {
    visibleRecords().filter((item) => Number(item.finalPrice) > 0).forEach((item) => event.target.checked ? state.selected.add(item.id) : state.selected.delete(item.id));
    render();
  });
  $("#clear-selection").addEventListener("click", () => { state.selected.clear(); render(); });
  $("#batch-pickup").addEventListener("click", () => {
    let count = 0;
    state.records.filter((item) => state.selected.has(item.id) && Number(item.finalPrice) > 0).forEach((item) => { requestPickup(item); count += 1; });
    state.selected.clear();
    save();
    render();
    notify(`已批量处理 ${count} 条，均为 DEMO 模拟流程`, "info");
  });
  $("#batch-settle").addEventListener("click", () => {
    let count = 0;
    state.records.filter((item) => state.selected.has(item.id) && Number(item.finalPrice) > 0 && !item.settled).forEach((item) => {
      recalculateRecord(item, true);
      item.settled = true;
      item.settledAt = new Date().toISOString();
      item.settlementNote = item.settlementNote || "网页批量确认结账";
      count += 1;
    });
    state.selected.clear();
    audit("批量确认结账", `${count} 条拍品`);
    save();
    render();
    notify(`已将 ${count} 条记录标记为已结账`);
  });

  $("#shipping-next").addEventListener("click", () => {
    const record = nextShippingRecord();
    if (record) openShipping(record.id);
  });

  $("#shipping-split-address").addEventListener("click", () => {
    const record = state.records.find((item) => item.id === state.shippingId);
    if (!record || record.outboundTrackingNumber) return;
    const parsed = splitRecipientAddress(shippingForm.elements.recipientRaw.value);
    Object.assign(record, parsed, {shippingCarrier:shippingForm.elements.shippingCarrier.value || carrierFor(record),addressReviewedAt:""});
    audit("拆分收件地址", `Lot ${record.lot} · ${parsed.addressWarnings.length ? `缺 ${parsed.addressWarnings.join("、")}` : "待二次审核"}`);
    renderShippingDialog(record);
    render();
    notify(parsed.addressWarnings.length ? "地址只完成了部分拆分，请修正红色提示项" : "地址已拆分，请逐项核对并完成二次审核", parsed.addressWarnings.length ? "info" : "success");
  });

  $("#shipping-review-address").addEventListener("click", () => {
    const record = state.records.find((item) => item.id === state.shippingId);
    if (!record || record.outboundTrackingNumber) return;
    const values = addressValuesFromForm();
    const gaps = addressMissing(values);
    Object.assign(record, values, {addressStatus:gaps.length ? "needs_correction" : "reviewed",addressWarnings:gaps,addressReviewedAt:gaps.length ? "" : new Date().toISOString()});
    if (gaps.length) {
      audit("地址二审未通过", `Lot ${record.lot} · 缺 ${gaps.join("、")}`);
      renderShippingDialog(record, false);
      render();
      notify(`还不能下单，请补充：${gaps.join("、")}`, "error");
      return;
    }
    audit("确认地址二审", `Lot ${record.lot} · ${record.addressProvince}${record.addressCity}${record.addressDistrict}`);
    renderShippingDialog(record, false);
    render();
    notify("地址二次审核已通过，可以进入物流下单");
  });

  shippingForm.addEventListener("input", (event) => {
    const record = state.records.find((item) => item.id === state.shippingId);
    if (!record || record.outboundTrackingNumber || !event.target.name) return;
    if (["recipientRaw","recipientName","recipientPhone","addressProvince","addressCity","addressDistrict","addressDetail"].includes(event.target.name)) {
      record[event.target.name] = event.target.name === "recipientPhone" ? event.target.value.replace(/\D/g, "") : event.target.value;
      if (record.addressStatus === "reviewed") {
        record.addressStatus = "pending_review";
        record.addressReviewedAt = "";
      }
      save();
      renderShippingDialog(record, false);
      render();
    }
  });

  shippingForm.elements.shippingCarrier.addEventListener("change", (event) => {
    const record = state.records.find((item) => item.id === state.shippingId);
    if (!record || record.outboundTrackingNumber) return;
    record.shippingCarrier = event.target.value;
    save();
    renderShippingDialog(record, false);
    render();
  });

  $("#shipping-create-order").addEventListener("click", () => {
    const record = state.records.find((item) => item.id === state.shippingId);
    if (!record || !isShippingCandidate(record) || record.addressStatus !== "reviewed" || record.outboundTrackingNumber) return;
    record.shippingCarrier = shippingForm.elements.shippingCarrier.value || carrierFor(record);
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    record.outboundTrackingNumber = `${record.shippingCarrier === "sf" ? "SF" : "CN"}-DEMO-OUT-${record.lot}-${suffix}`;
    record.shippingOrderedAt = new Date().toISOString();
    record.mxiqiShippingStatus = "pending";
    audit("模拟物流下单", `Lot ${record.lot} · ${carrierLabel(record.shippingCarrier)} · ${record.outboundTrackingNumber}`);
    renderShippingDialog(record);
    render();
    notify("已生成明确标识的演示运单号，不会提交真实物流平台", "info");
  });

  $("#shipping-copy-waybill").addEventListener("click", async () => {
    const record = state.records.find((item) => item.id === state.shippingId);
    if (!record?.outboundTrackingNumber) return;
    try {
      await copyText(record.outboundTrackingNumber);
      record.waybillCopiedAt = new Date().toISOString();
      record.mxiqiShippingStatus = record.mxiqiShippingStatus === "filled" ? "filled" : "pending";
      audit("复制出库运单号", `Lot ${record.lot} · 待粘贴到麦稀奇`);
      renderShippingDialog(record, false);
      render();
      notify("运单号已复制；粘贴到麦稀奇后，请回来确认已回填");
    } catch {
      notify("浏览器未允许复制，请手动选择运单号", "error");
    }
  });

  $("#shipping-confirm-fill").addEventListener("click", () => {
    const record = state.records.find((item) => item.id === state.shippingId);
    if (!record?.outboundTrackingNumber || record.mxiqiShippingStatus === "filled") return;
    record.mxiqiShippingStatus = "filled";
    record.mxiqiFilledAt = new Date().toISOString();
    audit("模拟确认麦稀奇回填", `Lot ${record.lot} · ${record.outboundTrackingNumber}`);
    renderShippingDialog(record, false);
    render();
    notify("该订单已标记为回填完成；公开版没有向麦稀奇实际提交");
  });

  $("#new-record").addEventListener("click", () => openEditor());
  ["sellerWechat","birthdayMonth","auctionAt","finalPrice"].forEach((name) => editForm.elements[name].addEventListener("input", previewCommission));
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(editForm);
    const existing = state.records.find((item) => item.id === state.editingId) || {};
    const birthdayMonth = Number(data.get("birthdayMonth") || 0);
    const sellerWechat = String(data.get("sellerWechat") || "").trim();
    if (sellerWechat) state.customers[sellerWechat] = {birthdayMonth};
    const record = {
      ...existing,
      id: existing.id || uid(),
      lot: Number(data.get("lot")),
      itemName: String(data.get("itemName") || "").trim(),
      auctionHouse: String(data.get("auctionHouse") || ""),
      auctionAt: String(data.get("auctionAt") || ""),
      lotLabel: String(data.get("lotLabel") || ""),
      projectName: String(data.get("projectName") || ""),
      startPrice: Number(data.get("startPrice") || 0),
      finalPrice: Number(data.get("finalPrice") || 0),
      finalOutcome: String(data.get("finalOutcome") || ""),
      paymentStatus: String(data.get("paymentStatus") || ""),
      paymentDueAt: String(data.get("paymentDueAt") || ""),
      returnDisposition: String(data.get("returnDisposition") || ""),
      primaryCategory: String(data.get("primaryCategory") || ""),
      secondaryCategory: String(data.get("secondaryCategory") || ""),
      sellerWechat,
      birthdayMonth,
      contactedAt: String(data.get("contactedAt") || ""),
      coinBoxId: String(data.get("coinBoxId") || ""),
      trackingNumber: String(data.get("trackingNumber") || ""),
      received: String(data.get("received") || "待确认"),
      settlementNote: String(data.get("settlementNote") || ""),
      settled: data.get("settled") === "on",
      carrierOverride: String(data.get("carrierOverride") || ""),
    };
    ensurePaymentTracking(record);
    if (!Number.isInteger(record.lot) || record.lot <= 0 || !record.itemName) {
      notify("请填写有效 Lot 和拍品名称", "error");
      return;
    }
    const duplicate = state.records.find((item) => Number(item.lot) === record.lot && item.id !== record.id);
    if (duplicate) {
      notify(`Lot ${record.lot} 已存在，请直接编辑该记录`, "error");
      return;
    }
    recalculateRecord(record, true);
    if (record.settled) record.settledAt = existing.settledAt || new Date().toISOString();
    const index = state.records.findIndex((item) => item.id === record.id);
    if (index >= 0) state.records[index] = record;
    else state.records.push({...record,carrier:"pending",logisticsStatus:"not_requested",pickupCode:""});
    state.records.filter((item) => !item.settled && item.sellerWechat === sellerWechat).forEach((item) => recalculateRecord(item));
    audit("保存拍品", `Lot ${record.lot} · ${record.itemName}`);
    save();
    editDialog.close();
    render();
    notify(`Lot ${record.lot} 已保存，佣金已自动计算`);
  });

  $("#open-import").addEventListener("click", () => importDialog.showModal());
  $("#excel-file").addEventListener("change", (event) => { $("#file-name").textContent = event.target.files[0]?.name || "选择 .xlsx 文件"; });
  $("#import-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      let records = [];
      const file = $("#excel-file").files[0];
      const json = $("#json-input").value.trim();
      if (file) records = await parseWorkbook(await file.arrayBuffer());
      else if (json) {
        const parsed = JSON.parse(json);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } else throw new Error("请选择 Excel 文件或粘贴 JSON");
      const valid = records.filter((item) => Number(item.lot) > 0 && item.itemName);
      if (!valid.length) throw new Error("文件中没有可导入的数据行");
      upsert(valid);
      audit("导入数据", `${valid.length} 条拍品`);
      importDialog.close();
      $("#import-form").reset();
      $("#file-name").textContent = "选择 .xlsx 文件";
      notify(`已导入 ${valid.length} 条记录并套用佣金规则`);
    } catch (error) {
      notify(error.message || "导入失败", "error");
    }
  });

  $("#open-connection").addEventListener("click", openConnection);
  $("#connection-status-button").addEventListener("click", openConnection);
  $("#collector-open-connection").addEventListener("click", () => {
    $("#collector-dialog").close("connection");
    openConnection();
  });
  $("#connection-demo-login").addEventListener("click", () => {
    const method = document.querySelector("input[name='connectionMethod']:checked")?.value || "password";
    const now = new Date().toISOString();
    state.connection = {status:"demo_connected",mode:"demo",method,connectedAt:now,lastCheckedAt:now,label:"演示登录会话"};
    audit("建立演示登录会话", `${connectionMethodLabel(method)} · 未连接真实账号`);
    save();
    renderConnectionPanel();
    renderCollectorPanel();
    notify("演示登录已建立，采集调度已解锁；真实数据源仍未连接", "info");
  });
  $("#connection-check").addEventListener("click", () => {
    state.connection.lastCheckedAt = new Date().toISOString();
    if (!isCollectorConnected()) {
      audit("检查平台会话", "未发现正式连接器，公开网页无法读取麦稀奇跨站会话");
      save();
      renderConnectionPanel();
      notify("公开体验版无法读取麦稀奇登录 Cookie；需要正式本地连接器", "error");
      return;
    }
    audit("检查平台会话", state.connection.status === "demo_connected" ? "演示会话有效，真实数据源未连接" : "正式会话检查完成");
    save();
    renderConnectionPanel();
    notify(state.connection.status === "demo_connected" ? "演示会话有效；这不代表麦稀奇真实账号已登录" : "平台会话有效");
  });
  $("#connection-logout").addEventListener("click", () => {
    if (!isCollectorConnected()) return;
    if (collectorRuntime.running || collectorRuntime.busy) stopCollector("登录连接已退出，自动采集同步停止", false);
    state.connection = clone(defaultConnection);
    audit("退出平台连接", "采集已锁定");
    save();
    renderConnectionPanel();
    renderCollectorPanel();
    notify("已退出连接，采集功能重新锁定", "info");
  });

  $("#open-collector").addEventListener("click", openCollector);
  $("#collector-refresh").addEventListener("click", () => { collectorRuntime.lastActivityAt = Date.now(); void runCollector("manual"); });
  $("#collector-start").addEventListener("click", startCollector);
  $("#collector-stop").addEventListener("click", () => stopCollector("已手动停止自动采集"));
  [["#collector-interval","intervalSeconds"],["#collector-idle","idleMinutes"]].forEach(([selector, key]) => {
    $(selector).addEventListener("change", (event) => {
      state.collector[key] = Number(event.target.value);
      if (collectorRuntime.running && key === "intervalSeconds") collectorRuntime.nextRunAt = Date.now() + state.collector.intervalSeconds * 1000;
      collectorRuntime.lastActivityAt = Date.now();
      save();
      renderCollectorPanel();
    });
  });
  ["pointerdown","keydown","touchstart"].forEach((eventName) => document.addEventListener(eventName, () => {
    if (collectorRuntime.running) collectorRuntime.lastActivityAt = Date.now();
  }, {passive:true}));

  $("#open-settings").addEventListener("click", openSettings);
  settingsForm.addEventListener("input", updateRulePreviews);
  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(settingsForm);
    state.settings = {
      defaultCommissionType: String(data.get("defaultCommissionType")),
      defaultCommissionValue: Math.max(0, Number(data.get("defaultCommissionValue") || 0)),
      birthdayCommissionType: String(data.get("birthdayCommissionType")),
      birthdayCommissionValue: Math.max(0, Number(data.get("birthdayCommissionValue") || 0)),
      birthdayLabel: String(data.get("birthdayLabel") || "生日月优惠").trim(),
      sfThreshold: Math.max(0, Number(data.get("sfThreshold") || 0)),
    };
    state.records.filter((record) => !record.settled).forEach((record) => recalculateRecord(record));
    audit("更新佣金规则", `默认 ${formatRule(state.settings.defaultCommissionType, state.settings.defaultCommissionValue)}；生日月 ${formatRule(state.settings.birthdayCommissionType, state.settings.birthdayCommissionValue)}`);
    save();
    settingsDialog.close();
    render();
    notify("佣金规则已保存，未结账记录已重新计算");
  });

  $("#open-backup").addEventListener("click", openBackup);
  $("#download-backup").addEventListener("click", downloadBackup);
  $("#backup-file").addEventListener("change", (event) => {
    pendingBackupFile = event.target.files[0] || null;
    $("#backup-file-name").textContent = pendingBackupFile ? pendingBackupFile.name : "尚未选择备份文件";
    $("#restore-backup").disabled = !pendingBackupFile;
  });
  $("#restore-backup").addEventListener("click", restoreBackup);

  $("#open-audit").addEventListener("click", () => {
    const list = $("#audit-list");
    list.innerHTML = state.audit.length ? state.audit.map((item) => `<article class="audit-entry"><span class="audit-dot"></span><div><b>${esc(item.action)}</b><p>${esc(item.detail)}</p></div><time>${new Date(item.time).toLocaleString("zh-CN", {month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"})}</time></article>`).join("") : '<div class="audit-empty">暂无操作记录</div>';
    auditDialog.showModal();
  });

  $("#reset-demo").addEventListener("click", () => {
    if (!confirm("确定恢复示例数据？当前浏览器中的体验修改将被清除。建议先下载完整备份。")) return;
    state.records = clone(seedRecords);
    state.audit = [];
    state.settings = clone(defaultSettings);
    state.customers = clone(seedCustomers);
    state.collector = clone(defaultCollector);
    state.connection = clone(defaultConnection);
    collectorRuntime.running = false;
    collectorRuntime.busy = false;
    collectorRuntime.nextRunAt = 0;
    state.selected.clear();
    save();
    render();
    renderConnectionPanel();
    renderCollectorPanel();
    notify("已恢复示例数据、默认规则和未登录状态");
  });

  function norm(value) {
    return String(value ?? "").trim().replace(/\s+/g, "").replace(/[（）()：:]/g, "").toLowerCase();
  }
  function cellText(cell) {
    const value = cell.value;
    if (value == null) return "";
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === "object") {
      if (value.text) return String(value.text).trim();
      if (Array.isArray(value.richText)) return value.richText.map((part) => part.text || "").join("").trim();
      if (value.result != null) return String(value.result).trim();
    }
    return String(value).trim();
  }
  function cellNumber(cell) {
    if (typeof cell.value === "number") return cell.value;
    const value = Number(cellText(cell).replace(/[¥￥,，\s]/g, ""));
    return Number.isFinite(value) ? value : 0;
  }
  function headerMap(row) {
    const map = new Map();
    row.eachCell({includeEmpty:false}, (cell, col) => { const key = norm(cellText(cell)); if (key) map.set(key, col); });
    return map;
  }
  function column(map, ...names) {
    for (const name of names) { const col = map.get(norm(name)); if (col) return col; }
    return 0;
  }
  function textAt(row, map, ...names) { const col = column(map, ...names); return col ? cellText(row.getCell(col)) : ""; }
  function numberAt(row, map, ...names) { const col = column(map, ...names); return col ? cellNumber(row.getCell(col)) : 0; }
  function lotFromLabel(value) {
    const match = value.match(/\blot\s*[:：#\-/]?\s*(\d+)/i) || value.match(/(\d+)\s*$/);
    return match ? Number(match[1]) : 0;
  }

  async function parseWorkbook(buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    let found = null;
    for (const sheet of workbook.worksheets) {
      for (let rowNo = 1; rowNo <= Math.min(sheet.rowCount || 1, 8); rowNo += 1) {
        const map = headerMap(sheet.getRow(rowNo));
        if (column(map, "Lot") && column(map, "拍品名称")) { found = {kind:"mxiqi",sheet,rowNo,map}; break; }
        if (column(map, "送拍人（微信名）", "送拍人微信名") && column(map, "拍场/Lot", "拍场Lot")) { found = {kind:"tracker",sheet,rowNo,map}; break; }
      }
      if (found) break;
    }
    if (!found) throw new Error("无法识别表格，请使用送拍跟踪表或麦稀奇 v3.7 模板");
    const records = [];
    for (let rowNo = found.rowNo + 1; rowNo <= found.sheet.rowCount; rowNo += 1) {
      const row = found.sheet.getRow(rowNo);
      if (found.kind === "mxiqi") {
        const lot = Math.trunc(numberAt(row, found.map, "Lot"));
        const itemName = textAt(row, found.map, "拍品名称");
        if (!lot && !itemName) continue;
        if (lot > 0 && itemName) records.push(compact({lot,itemName,startPrice:numberAt(row,found.map,"起拍价"),primaryCategory:textAt(row,found.map,"一级分类"),secondaryCategory:textAt(row,found.map,"二级分类"),description:textAt(row,found.map,"拍品介绍")}));
      } else {
        const lotLabel = textAt(row, found.map, "拍场/Lot", "拍场Lot");
        const lot = lotFromLabel(lotLabel);
        const projectName = textAt(row, found.map, "送拍项目");
        if (!lot && !projectName) continue;
        const outcome = textAt(row, found.map, "拍出价格/拖回", "拍出价格拖回");
        if (lot > 0 && projectName) records.push(compact({lot,itemName:projectName,projectName,lotLabel,auctionHouse:lotLabel.split(/[\/／]/)[0].trim(),sellerWechat:textAt(row,found.map,"送拍人（微信名）","送拍人微信名"),contactedAt:textAt(row,found.map,"联系时间"),coinBoxId:textAt(row,found.map,"盒子币编号"),trackingNumber:textAt(row,found.map,"快递单号"),auctionAt:textAt(row,found.map,"上拍时间（拍卖时间）","上拍时间拍卖时间"),received:textAt(row,found.map,"是/否收到","是否收到") || "待确认",finalOutcome:outcome.includes("拖回") ? "拖回" : numberAt(row,found.map,"拍出价格/拖回") > 0 ? "成交" : "",finalPrice:outcome.includes("拖回") ? 0 : numberAt(row,found.map,"拍出价格/拖回"),settled:textAt(row,found.map,"是/否已结账","是否已结账") === "是",settlementNote:textAt(row,found.map,"结账")}));
      }
    }
    return records;
  }

  async function exportTracker() {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Sheet1");
      const headers = ["送拍人（微信名）","联系时间","送拍项目","盒子币编号","快递单号","上拍时间（拍卖时间）","拍场/Lot","是/否收到","拍出价格/拖回","送拍佣金","结款金额","是/否已结账","适用优惠方案","结账","利润（不包含邮费）"];
      sheet.addRow([null, ...headers]);
      state.records.forEach((record) => sheet.addRow([null,record.sellerWechat || null,record.contactedAt || null,record.projectName || record.itemName,record.coinBoxId || null,record.trackingNumber || null,record.auctionAt || null,record.lotLabel || `${record.auctionHouse || ""} / Lot ${record.lot}`,record.received || "待确认",record.finalOutcome === "拖回" ? "拖回" : record.finalPrice || null,record.commissionAmount || null,record.settlementAmount || null,record.settled ? "是" : "否",record.promotion || null,record.settlementNote || null,record.profit || null]));
      sheet.getRow(1).font = {bold:true};
      sheet.views = [{state:"frozen",ySplit:1}];
      downloadBlob(await workbook.xlsx.writeBuffer(), `送拍跟踪表_体验版_${new Date().toISOString().slice(0,10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      audit("导出表格", "送拍跟踪表");
    } catch (error) { notify(error.message || "导出失败", "error"); }
  }

  async function exportMxiqi() {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("导入模板");
      sheet.mergeCells("A1:V1");
      sheet.getCell("A1").value = "麦稀奇拍品导入模板(v3.7) · 公开体验版";
      sheet.addRow(["基本信息","","拍卖设置","","","","估价范围","","分类设置","","属性设置","","","","","详情","","其它","","","标签",""]);
      sheet.addRow(["Lot","拍品名称","起拍价","封顶价","保留价","亮点(是/否)","低价","高价","一级分类","二级分类","发行年份","国家地区","评级公司","评级编号","评级分数","拍品介绍","拍卖提示","拍卖顺序","图鉴编号","图片全显","标签1","标签2"]);
      state.records.forEach((record) => sheet.addRow([record.lot,record.itemName,record.startPrice || 0,record.capPrice || null,record.reservePrice || null,record.highlight || "否",record.estimateLow || null,record.estimateHigh || null,record.primaryCategory || null,record.secondaryCategory || null,record.issueYear || null,record.country || null,record.gradingCompany || null,record.gradingId || null,record.gradingScore || null,record.description || null,record.auctionHint || null,record.auctionOrder || null,record.catalogId || null,record.fullImage || null,record.tag1 || null,record.tag2 || null]));
      sheet.getRow(3).font = {bold:true};
      sheet.views = [{state:"frozen",ySplit:3}];
      const note = workbook.addWorksheet("导入说明");
      note.addRows([["公开体验版说明"],["该文件由浏览器本地体验页面生成。"],["第3行字段名称请勿修改。"]]);
      downloadBlob(await workbook.xlsx.writeBuffer(), `麦稀奇导入模板_体验版_${new Date().toISOString().slice(0,10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      audit("导出表格", "麦稀奇模板");
    } catch (error) { notify(error.message || "导出失败", "error"); }
  }

  async function exportSettlement() {
    const sold = settlementRecords();
    if (!sold.length || sold.some((record) => !record.settled)) {
      notify("还有未结账记录，暂不能导出本批结算表", "error");
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const summary = workbook.addWorksheet("结算汇总");
      summary.addRows([
        ["送拍结算汇总"],
        ["导出时间", new Date().toLocaleString("zh-CN")],
        ["送拍人范围", state.settlementScope.seller || "全部送拍人"],
        ["拍卖时间范围", `${state.settlementScope.from || "不限"} 至 ${state.settlementScope.to || "不限"}`],
        ["成交件数", sold.length],
        ["成交总额", sold.reduce((sum, record) => sum + Number(record.finalPrice || 0), 0)],
        ["佣金合计", sold.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0)],
        ["应结金额", sold.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0)],
      ]);
      summary.getColumn(1).width = 18;
      summary.getColumn(2).width = 24;
      summary.getRow(1).font = {bold:true,size:16};
      const detail = workbook.addWorksheet("结算明细");
      detail.addRow(["Lot","拍品名称","送拍人","拍卖时间","成交价","买家付款","拖回/特殊处理","佣金规则","送拍佣金","应结金额","结账时间","结账说明"]);
      sold.forEach((record) => detail.addRow([record.lot,record.itemName,record.sellerWechat || "",record.auctionAt || "",record.finalPrice,record.paymentStatus || "",record.returnDisposition || "",record.promotion || "",record.commissionAmount || 0,record.settlementAmount || 0,record.settledAt ? new Date(record.settledAt).toLocaleString("zh-CN") : "",record.settlementNote || ""]));
      detail.getRow(1).font = {bold:true};
      detail.views = [{state:"frozen",ySplit:1}];
      [8,28,18,20,14,14,18,20,14,14,21,24].forEach((width, index) => { detail.getColumn(index + 1).width = width; });
      downloadBlob(await workbook.xlsx.writeBuffer(), `送拍结算表_${new Date().toISOString().slice(0,10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      audit("导出结算表", `${sold.length} 条已结账记录`);
      notify("结算表已导出");
    } catch (error) { notify(error.message || "结算表导出失败", "error"); }
  }

  function exportSettlementImage() {
    const sold = settlementRecords();
    if (!sold.length || sold.some((record) => !record.settled)) {
      notify("还有未结账记录，暂不能导出结算明细图片", "error");
      return;
    }
    const width = 1500;
    const rowHeight = 46;
    const headerHeight = 250;
    const height = headerHeight + rowHeight * (sold.length + 1) + 70;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f7f5ef";
    context.fillRect(0, 0, width, height);
    context.fillStyle = "#102735";
    context.fillRect(0, 0, width, 118);
    context.fillStyle = "#f7ead0";
    context.font = 'bold 34px "Microsoft YaHei", sans-serif';
    context.fillText("送拍结算明细", 50, 70);
    context.fillStyle = "#314b57";
    context.font = '20px "Microsoft YaHei", sans-serif';
    context.fillText(`送拍人：${state.settlementScope.seller || "全部"}　时间：${state.settlementScope.from || "不限"} 至 ${state.settlementScope.to || "不限"}`, 50, 158);
    const gross = sold.reduce((sum, record) => sum + Number(record.finalPrice || 0), 0);
    const commission = sold.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0);
    const payable = sold.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0);
    context.font = 'bold 22px "Microsoft YaHei", sans-serif';
    context.fillText(`${sold.length} 件　成交 ${currency.format(gross)}　佣金 ${currency.format(commission)}　应结 ${currency.format(payable)}`, 50, 204);

    const columns = [
      {label:"Lot",x:50,width:80},
      {label:"拍品名称",x:130,width:370},
      {label:"送拍人",x:500,width:180},
      {label:"拍卖时间",x:680,width:210},
      {label:"成交价",x:890,width:140},
      {label:"佣金",x:1030,width:140},
      {label:"应结金额",x:1170,width:160},
      {label:"处理状态",x:1330,width:140},
    ];
    const tableTop = headerHeight;
    context.fillStyle = "#e8e5dd";
    context.fillRect(40, tableTop, width - 80, rowHeight);
    context.fillStyle = "#52636c";
    context.font = 'bold 16px "Microsoft YaHei", sans-serif';
    columns.forEach((column) => context.fillText(column.label, column.x + 8, tableTop + 29));
    const truncate = (text, max) => String(text || "").length > max ? `${String(text).slice(0, max - 1)}…` : String(text || "");
    sold.forEach((record, index) => {
      const y = tableTop + rowHeight * (index + 1);
      context.fillStyle = index % 2 ? "#f1efe9" : "#fffefa";
      context.fillRect(40, y, width - 80, rowHeight);
      context.fillStyle = "#213944";
      context.font = '15px "Microsoft YaHei", sans-serif';
      const values = [record.lot,truncate(record.itemName,22),truncate(record.sellerWechat || "待补",10),truncate(record.auctionAt,16),currency.format(record.finalPrice || 0),currency.format(record.commissionAmount || 0),currency.format(record.settlementAmount || 0),truncate(record.returnDisposition || "已结账",8)];
      values.forEach((value, columnIndex) => context.fillText(String(value), columns[columnIndex].x + 8, y + 29));
    });
    context.fillStyle = "#7b898f";
    context.font = '14px "Microsoft YaHei", sans-serif';
    context.fillText(`导出时间：${new Date().toLocaleString("zh-CN")} · 由送拍运营工作台生成`, 50, height - 28);
    canvas.toBlob((blob) => {
      if (!blob) return notify("图片生成失败", "error");
      downloadBlob(blob, `送拍结算明细_${new Date().toISOString().slice(0,10)}.png`, "image/png");
      audit("导出结算图片", `${sold.length} 条已结账记录`);
      notify("结算明细图片已导出");
    }, "image/png");
  }

  $("#export-tracker").addEventListener("click", exportTracker);
  $("#export-mxiqi").addEventListener("click", exportMxiqi);
  $("#export-settlement").addEventListener("click", exportSettlement);
  $("#export-settlement-image").addEventListener("click", exportSettlementImage);

  if (localStorage.getItem(MIGRATION_KEY) !== "5") {
    const sampleOverdue = state.records.find((record) => record.id === "d102");
    if (sampleOverdue && !sampleOverdue.paymentStatus) {
      sampleOverdue.paymentStatus = "待付款";
      sampleOverdue.paymentDueAt = "2026-07-21T20:00";
      sampleOverdue.returnDisposition = "拖回/等待";
    }
    const samplePaid = state.records.find((record) => record.id === "d104");
    if (samplePaid && !samplePaid.paymentStatus) samplePaid.paymentStatus = "已付款";
    const sampleAddressReview = state.records.find((record) => record.id === "d101");
    if (sampleAddressReview && !sampleAddressReview.recipientRaw) Object.assign(sampleAddressReview, {
      paymentStatus:"已付款",recipientRaw:"演示收件人 13800000001 上海市浦东新区世纪大道100号",recipientName:"演示收件人",recipientPhone:"13800000001",addressProvince:"上海市",addressCity:"上海市",addressDistrict:"浦东新区",addressDetail:"世纪大道100号",addressStatus:"pending_review",shippingCarrier:"sf",mxiqiShippingStatus:"",
    });
    if (samplePaid && !samplePaid.outboundTrackingNumber) Object.assign(samplePaid, {
      recipientRaw:"体验客户 13800000004 北京市朝阳区建国路88号",recipientName:"体验客户",recipientPhone:"13800000004",addressProvince:"北京市",addressCity:"北京市",addressDistrict:"朝阳区",addressDetail:"建国路88号",addressStatus:"reviewed",shippingCarrier:"sf",outboundTrackingNumber:"SF-DEMO-OUT-104-0001",mxiqiShippingStatus:"filled",addressReviewedAt:"2026-07-20T09:00:00.000Z",shippingOrderedAt:"2026-07-20T09:05:00.000Z",mxiqiFilledAt:"2026-07-20T09:08:00.000Z",
    });
    const sampleAddressProblem = state.records.find((record) => record.id === "d105");
    if (sampleAddressProblem && !sampleAddressProblem.recipientRaw) Object.assign(sampleAddressProblem, {
      paymentStatus:"已付款",recipientRaw:"小王 13800000005 南山科技园科苑路",addressStatus:"needs_correction",shippingCarrier:"cainiao",mxiqiShippingStatus:"",
    });
    state.records.forEach((record) => ensurePaymentTracking(record));
    state.records.forEach((record) => {
      record.shippingCarrier ||= record.carrier || carrierFor(record);
      record.addressStatus ||= "";
      record.mxiqiShippingStatus ||= "";
    });
    state.records.filter((record) => !record.settled).forEach((record) => recalculateRecord(record));
    state.connection = {...defaultConnection, ...state.connection};
    if (!["disconnected","demo_connected"].includes(state.connection.status)) state.connection = clone(defaultConnection);
    localStorage.setItem(MIGRATION_KEY, "5");
    save();
  }

  window.setInterval(collectorTick, 1000);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("sw.js");
        await navigator.serviceWorker.ready;
        $("#offline-status").textContent = "离线访问已准备";
      } catch {
        $("#offline-status").textContent = "本机数据已启用";
      }
    });
  } else {
    $("#offline-status").textContent = "本机数据已启用";
  }

  render();
  renderConnectionPanel();
  renderCollectorPanel();
})();
