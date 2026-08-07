(() => {
  "use strict";

  const STORAGE_KEY = "mxiqi-public-demo-records-v1";
  const AUDIT_KEY = "mxiqi-public-demo-audit-v1";
  const SETTINGS_KEY = "mxiqi-public-demo-settings-v2";
  const CUSTOMERS_KEY = "mxiqi-public-demo-customers-v2";
  const COLLECTOR_KEY = "mxiqi-public-demo-collector-v1";
  const CONNECTION_KEY = "mxiqi-public-demo-connection-v1";
  const ASSETS_KEY = "mxiqi-public-demo-assets-v1";
  const HISTORY_KEY = "mxiqi-public-demo-history-v1";
  const MIGRATION_KEY = "mxiqi-public-demo-schema";
  const BACKUP_META_KEY = "mxiqi-public-demo-last-backup";
  const LOGISTICS_OPERATOR_KEY = "mxiqi-logistics-operator-key";
  const RETURN_MANUAL_REVIEW_KEY = "mxiqi-return-manual-review-v1";
  const RECOVERY_KEY = "mxiqi-public-demo-recovery-v1";

  const defaultSettings = {
    defaultCommissionType: "percent",
    defaultCommissionValue: 8,
    lowPriceThreshold: 100,
    lowPriceFee: 5,
    birthdayCommissionType: "percent",
    birthdayCommissionValue: -2,
    birthdayLabel: "生日",
    boxRebateThreshold: 1000,
    boxRebateKeywords: "NGC,PCGS",
    boxRebateValue: 1,
    boxRebateThreshold2: 0,
    boxRebateValue2: 0,
    boxRebateThreshold3: 0,
    boxRebateValue3: 0,
    boxRebateThreshold4: 0,
    boxRebateValue4: 0,
    returnHandlingFee: 8,
    sfThreshold: 2000,
    defaultGoodsName: "章牌",
    defaultPackageWeightKg: 0.8,
    logisticsGatewayUrl: "",
    sfSenderName: "",
    sfSenderPhone: "",
    sfMonthlyAccount: "",
    sfSenderAddress: "",
    cainiaoSenderName: "",
    cainiaoSenderPhone: "",
    cainiaoSenderAddress: "",
  };

  const defaultCollector = {
    intervalSeconds: 60,
    idleMinutes: 10,
    scope: "waitexpress",
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
    connectorCheckedAt: "",
    connectorInstalled: false,
    connectorVersion: "",
    connectorCapabilities: [],
    label: "",
  };

  const seedCustomers = {
    "林先生·上海": { birthdayMonth: 7, phone: "13900001001" },
    "周女士": { birthdayMonth: 12, phone: "13900001004" },
  };

  const seedRecords = [
    {id:"d101",lot:101,itemName:"NGC PMG 67EPQ 2024年龙年纪念钞",sellerWechat:"林先生·上海",contactedAt:"2026-07-12",projectName:"世界币章拍卖（第75期）",coinBoxId:"HX-DEMO-101",trackingNumber:"SF-DEMO-101-0001",auctionAt:"2026-07-28 20:00",auctionHouse:"麦稀奇",lotLabel:"A场 / Lot 101",received:"是",finalOutcome:"成交",finalPrice:2500,paymentStatus:"已付款",commissionAmount:-50,settlementAmount:2550,profit:-50,promotion:"生日 · -2%",startPrice:1000,primaryCategory:"钞票",secondaryCategory:"纪念钞",settled:false,carrier:"sf",carrierOverride:"",logisticsStatus:"ready",pickupCode:"DEMO-SF-101-A7K2",logisticsNote:"公开体验模拟码",recipientRaw:"演示收件人 13800000001 上海市浦东新区世纪大道100号",recipientName:"演示收件人",recipientPhone:"13800000001",addressProvince:"上海市",addressCity:"上海市",addressDistrict:"浦东新区",addressDetail:"世纪大道100号",addressStatus:"pending_review",shippingCarrier:"sf",mxiqiShippingStatus:""},
    {id:"d102",lot:102,itemName:"袁世凯像民国三年壹圆 银元",sellerWechat:"藏泉阁",contactedAt:"2026-07-13",projectName:"世界币章拍卖（第75期）",coinBoxId:"",trackingNumber:"",auctionAt:"2026-07-28 20:00",auctionHouse:"麦稀奇",lotLabel:"A场 / Lot 102",received:"是",finalOutcome:"成交",finalPrice:860,paymentStatus:"待付款",paymentDueAt:"2026-07-21T20:00",returnDisposition:"拖回/等待",commissionAmount:8,settlementAmount:-8,profit:8,promotion:"拖回处理费 · ¥8.00",startPrice:500,primaryCategory:"硬币",secondaryCategory:"银元",settled:false,carrier:"cainiao",carrierOverride:"",logisticsStatus:"simulation_ready",pickupCode:"DEMO-CN-102-P8Q2",logisticsNote:"公开体验模拟码"},
    {id:"d103",lot:103,itemName:"T46 庚申年猴票 四方联",sellerWechat:"邮缘收藏",contactedAt:"2026-07-14",projectName:"世界币章拍卖（第75期）",coinBoxId:"",trackingNumber:"",auctionAt:"2026-07-29 19:30",auctionHouse:"麦稀奇",lotLabel:"B场 / Lot 103",received:"待确认",finalOutcome:"待拍",finalPrice:0,commissionAmount:0,settlementAmount:0,profit:0,startPrice:2200,primaryCategory:"邮票",secondaryCategory:"JT邮票",settled:false,carrier:"pending",carrierOverride:"",logisticsStatus:"not_requested",pickupCode:"",logisticsNote:""},
    {id:"d104",lot:104,itemName:"清乾隆青花缠枝莲纹盘",sellerWechat:"周女士",contactedAt:"2026-07-15",projectName:"长期征集拍品（第74期）",coinBoxId:"",trackingNumber:"SF-DEMO-104-0001",auctionAt:"2026-07-30 20:00",auctionHouse:"麦稀奇",lotLabel:"C场 / Lot 104",received:"是",finalOutcome:"成交",finalPrice:3260,paymentStatus:"已付款",commissionAmount:260.8,settlementAmount:2999.2,profit:260.8,promotion:"普通佣金 · 8%",startPrice:1800,primaryCategory:"陶瓷",secondaryCategory:"旧藏瓷器",settled:true,settledAt:"2026-07-20T08:30:00.000Z",settlementNote:"已转账",carrier:"sf",carrierOverride:"",logisticsStatus:"simulation_ready",pickupCode:"DEMO-SF-104-K3M8",logisticsNote:"公开体验模拟码",recipientRaw:"体验客户 13800000004 北京市朝阳区建国路88号",recipientName:"体验客户",recipientPhone:"13800000004",addressProvince:"北京市",addressCity:"北京市",addressDistrict:"朝阳区",addressDetail:"建国路88号",addressStatus:"reviewed",shippingCarrier:"sf",outboundTrackingNumber:"SF-DEMO-OUT-104-0001",mxiqiShippingStatus:"filled",addressReviewedAt:"2026-07-20T09:00:00.000Z",shippingOrderedAt:"2026-07-20T09:05:00.000Z",mxiqiFilledAt:"2026-07-20T09:08:00.000Z"},
    {id:"d105",lot:105,itemName:"1980年中国奥委会纪念铜章",sellerWechat:"",contactedAt:"",projectName:"长期征集拍品（第74期）",coinBoxId:"",trackingNumber:"",auctionAt:"2026-07-30 20:00",auctionHouse:"麦稀奇",lotLabel:"C场 / Lot 105",received:"否",finalOutcome:"成交",finalPrice:420,paymentStatus:"已付款",commissionAmount:33.6,settlementAmount:386.4,profit:33.6,promotion:"普通佣金 · 8%",startPrice:100,primaryCategory:"章牌",secondaryCategory:"纪念章",settled:false,carrier:"cainiao",carrierOverride:"",logisticsStatus:"not_requested",pickupCode:"",logisticsNote:"",recipientRaw:"小王 13800000005 南山科技园科苑路",addressStatus:"needs_correction",shippingCarrier:"cainiao",mxiqiShippingStatus:""},
    {id:"d106",lot:106,itemName:"民国十年袁世凯像壹圆银币",sellerWechat:"藏泉阁",sellerPhone:"13900001002",contactedAt:"2026-07-18",projectName:"世界币章拍卖（第75期）",coinBoxId:"",trackingNumber:"",auctionAt:"2026-07-27 20:00",auctionHouse:"麦稀奇",lotLabel:"A场 / Lot 106",received:"是",finalOutcome:"成交",finalPrice:1280,paymentStatus:"待付款",paymentDueAt:"2026-07-30T20:00",buyerName:"待付款买家",buyerPhone:"13800000006",commissionAmount:102.4,settlementAmount:1177.6,profit:102.4,promotion:"普通佣金 · 8%",startPrice:600,primaryCategory:"硬币",secondaryCategory:"银元",settled:false,carrier:"cainiao",carrierOverride:"",logisticsStatus:"not_requested",pickupCode:"",logisticsNote:"",addressStatus:"pending_review",shippingCarrier:"cainiao",mxiqiShippingStatus:"pending"},
    {id:"d107",lot:107,itemName:"PCGS MS63 北洋造光绪元宝",sellerWechat:"林先生·上海",sellerPhone:"13900001001",contactedAt:"2026-07-19",projectName:"世界币章拍卖（第75期）",coinBoxId:"HX-DEMO-107",trackingNumber:"SF-DEMO-107-0001",auctionAt:"2026-07-27 20:00",auctionHouse:"麦稀奇",lotLabel:"A场 / Lot 107",received:"是",finalOutcome:"成交",finalPrice:1480,paymentStatus:"已付款",returnDisposition:"拖回/再拍",returnDispositionConfirmedAt:"2026-07-20T08:00:00.000Z",commissionAmount:8,settlementAmount:-8,profit:8,promotion:"拖回处理费 · ¥8.00",startPrice:800,primaryCategory:"硬币",secondaryCategory:"银元",settled:false,carrier:"pending",carrierOverride:"",logisticsStatus:"not_requested",pickupCode:"",logisticsNote:""},
  ];

  const clone = (value) => typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  const state = {
    records: loadArray(STORAGE_KEY, seedRecords),
    audit: loadArray(AUDIT_KEY, []),
    settings: loadObject(SETTINGS_KEY, defaultSettings),
    customers: loadObject(CUSTOMERS_KEY, seedCustomers),
    collector: loadObject(COLLECTOR_KEY, defaultCollector),
    connection: loadObject(CONNECTION_KEY, defaultConnection),
    assets: loadArray(ASSETS_KEY, []),
    history: loadArray(HISTORY_KEY, []),
    assetFilter: "all",
    assetQuery: "",
    customerQuery: "",
    editingCustomer: "",
    selectedAssets: new Set(),
    stage: "all",
    query: "",
    filters: {seller:"",auction:"",status:"",shipping:""},
    settlementScope: {seller:"",from:"",to:""},
    settlementView: "all",
    selected: new Set(),
    expandedPackages: new Set(),
    expandedSettlements: new Set(),
    expandedAssetGroups: new Set(),
    shippingQueueKeys: [],
    shippingQueueIndex: 0,
    editingId: "",
    shippingId: "",
    shippingIds: [],
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const currency = new Intl.NumberFormat("zh-CN", {style:"currency",currency:"CNY",maximumFractionDigits:2});
  function settlementAdjustmentSummaryLabel(amount) {
    return Number(amount || 0) < 0 ? "返佣合计" : "佣金合计";
  }

  function formatSettlementAdjustment(amount) {
    const value = Number(amount || 0);
    return value < 0 ? `+${currency.format(Math.abs(value))}` : currency.format(value);
  }
  const PACKAGE_SHARED_FIELDS = ["buyerName","buyerPhone","projectName","auctionHouse","auctionAt","auctionPeriodOverride","finalOutcome","returnDisposition","paymentStatus","paymentDueAt","mxiqiOrderId","shippingGoodsName","shipmentWeightKg"];
  const PACKAGE_ADDRESS_FIELDS = ["recipientRaw","recipientName","recipientPhone","addressProvince","addressCity","addressDistrict","addressDetail"];
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
  const assetDialog = $("#asset-dialog");
  const customerDialog = $("#customer-dialog");
  const customerForm = $("#customer-form");
  let pendingBackupFile = null;
  const logisticsRuntime = {checked:false,checking:false,installed:false,version:"",capabilities:[],providers:{},source:"gateway",lastError:""};
  const collectorRuntime = {
    running:false,
    busy:false,
    nextRunAt:0,
    lastActivityAt:Date.now(),
    autoSettlementTimer:0,
    autoSettlementAttempts:new Set(),
  };

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

  const BUSINESS_STORAGE_KEYS = [STORAGE_KEY, AUDIT_KEY, SETTINGS_KEY, CUSTOMERS_KEY, COLLECTOR_KEY, CONNECTION_KEY, ASSETS_KEY, HISTORY_KEY];

  function captureStorageSnapshot() {
    return Object.fromEntries(BUSINESS_STORAGE_KEYS.map((key) => [key, localStorage.getItem(key)]));
  }

  function restoreStorageSnapshot(snapshot) {
    BUSINESS_STORAGE_KEYS.forEach((key) => {
      if (snapshot[key] === null || snapshot[key] === undefined) localStorage.removeItem(key);
      else localStorage.setItem(key, snapshot[key]);
    });
  }

  function captureMutableState() {
    return clone({
      records:state.records,
      audit:state.audit,
      settings:state.settings,
      customers:state.customers,
      collector:state.collector,
      connection:state.connection,
      assets:state.assets,
      history:state.history,
    });
  }

  function restoreMutableState(snapshot) {
    state.records = clone(snapshot.records);
    state.audit = clone(snapshot.audit);
    state.settings = clone(snapshot.settings);
    state.customers = clone(snapshot.customers);
    state.collector = clone(snapshot.collector);
    state.connection = clone(snapshot.connection);
    state.assets = clone(snapshot.assets);
    state.history = clone(snapshot.history);
  }

  function saveRecoveryCopy(reason, payload, error = "") {
    try {
      localStorage.setItem(RECOVERY_KEY, JSON.stringify({
        at:new Date().toISOString(),
        reason,
        error:String(error?.message || error || ""),
        payload,
      }));
    } catch {
      // Recovery data must never block the application from opening.
    }
  }

  function safeScalar(value) {
    if (value === null || value === undefined) return "";
    if (typeof value !== "object") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function sanitizeRecord(record) {
    if (!record || typeof record !== "object" || Array.isArray(record)) return null;
    const sanitized = Object.fromEntries(Object.entries(record).map(([key, value]) => [key, safeScalar(value)]));
    const lot = Number(sanitized.lot);
    const itemName = String(sanitized.itemName || "").trim();
    if (!Number.isInteger(lot) || lot <= 0 || !itemName) return null;
    sanitized.lot = lot;
    sanitized.itemName = itemName;
    [
      "id","platformItemKey","sellerWechat","sellerPhone","buyerName","buyerPhone","projectName",
      "auctionHouse","auctionAt","lotLabel","recipientRaw","recipientName","recipientPhone",
      "addressProvince","addressCity","addressDistrict","addressDetail",
    ].forEach((key) => {
      if (key in sanitized) sanitized[key] = String(sanitized[key] ?? "");
    });
    return sanitized;
  }

  function sanitizeRecordList(records) {
    const valid = [];
    const quarantined = [];
    (Array.isArray(records) ? records : []).forEach((record) => {
      const sanitized = sanitizeRecord(record);
      if (sanitized) valid.push(sanitized);
      else quarantined.push(record);
    });
    return {records:valid, quarantined};
  }

  function sanitizeCustomerDirectory(customers) {
    if (!customers || typeof customers !== "object" || Array.isArray(customers)) return {};
    return Object.fromEntries(Object.entries(customers).flatMap(([key, profile]) => {
      if (!profile || typeof profile !== "object" || Array.isArray(profile)) return [];
      const clean = Object.fromEntries(Object.entries(profile).map(([field, value]) => [field, safeScalar(value)]));
      clean.aliases = Array.isArray(profile.aliases) ? profile.aliases.map((value) => String(value ?? "")).filter(Boolean) : [];
      ["wechat","phone","notes"].forEach((field) => {
        if (field in clean) clean[field] = String(clean[field] ?? "");
      });
      return [[String(key), clean]];
    }));
  }

  function sanitizeLoadedState() {
    const normalized = sanitizeRecordList(state.records);
    state.records = normalized.records;
    state.audit = Array.isArray(state.audit) ? state.audit.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)) : [];
    state.assets = Array.isArray(state.assets) ? state.assets.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)) : [];
    state.history = Array.isArray(state.history) ? state.history.filter((entry) => entry && typeof entry === "object" && !Array.isArray(entry)) : [];
    state.settings = state.settings && typeof state.settings === "object" && !Array.isArray(state.settings) ? {...defaultSettings, ...state.settings} : clone(defaultSettings);
    state.customers = sanitizeCustomerDirectory(state.customers);
    state.collector = state.collector && typeof state.collector === "object" && !Array.isArray(state.collector) ? {...defaultCollector, ...state.collector} : clone(defaultCollector);
    state.connection = state.connection && typeof state.connection === "object" && !Array.isArray(state.connection) ? {...defaultConnection, ...state.connection} : clone(defaultConnection);
    if (normalized.quarantined.length) saveRecoveryCopy("startup-sanitize", {quarantined:normalized.quarantined});
    return normalized.quarantined.length;
  }

  const HISTORY_LIMIT = 8;
  let suppressHistoryCapture = false;

  function businessSnapshot() {
    return clone({records:state.records,assets:state.assets,settings:state.settings,customers:state.customers});
  }

  function persistedBusinessSnapshot() {
    return {
      records: loadArray(STORAGE_KEY, seedRecords),
      assets: loadArray(ASSETS_KEY, []),
      settings: loadObject(SETTINGS_KEY, defaultSettings),
      customers: loadObject(CUSTOMERS_KEY, seedCustomers),
    };
  }

  function snapshotFingerprint(snapshot) {
    return JSON.stringify(snapshot);
  }

  function captureHistorySnapshot() {
    if (suppressHistoryCapture) return null;
    const before = persistedBusinessSnapshot();
    const after = businessSnapshot();
    const beforeFingerprint = snapshotFingerprint(before);
    const afterFingerprint = snapshotFingerprint(after);
    if (beforeFingerprint === afterFingerprint) return null;
    const latest = state.history[0];
    if (latest?.pending && latest.afterFingerprint === afterFingerprint) return latest;
    const entry = {id:uid(),time:new Date().toISOString(),action:"自动保存",detail:"业务数据发生变更",pending:true,before,afterFingerprint};
    state.history.unshift(entry);
    state.history = state.history.slice(0, HISTORY_LIMIT);
    return entry;
  }

  function persistState() {
    syncCustomerDirectory();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.records));
    localStorage.setItem(AUDIT_KEY, JSON.stringify(state.audit.slice(0, 200)));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(state.customers));
    localStorage.setItem(COLLECTOR_KEY, JSON.stringify(state.collector));
    localStorage.setItem(CONNECTION_KEY, JSON.stringify(state.connection));
    localStorage.setItem(ASSETS_KEY, JSON.stringify(state.assets));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history.slice(0, HISTORY_LIMIT)));
  }

  function save({skipHistoryCapture = false} = {}) {
    if (!skipHistoryCapture) captureHistorySnapshot();
    persistState();
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

  function importRecordFingerprint(record = {}) {
    const comparable = {...record};
    delete comparable.id;
    delete comparable.importBatchId;
    delete comparable.importedAt;
    return JSON.stringify(comparable);
  }

  function roundMoney(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function normalizeCustomerPhone(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return /^1\d{10}$/.test(digits) ? digits : "";
  }

  function latestCustomerDate(...values) {
    return values.flat().map((value) => String(value || "").slice(0, 10)).filter(Boolean).sort().at(-1) || "";
  }

  function customerProfileByPhone(phone) {
    const normalized = normalizeCustomerPhone(phone);
    if (!normalized) return null;
    const matches = Object.entries(state.customers)
      .filter(([, profile]) => normalizeCustomerPhone(profile?.phone) === normalized)
      .map(([wechat, profile]) => ({wechat, ...profile}))
      .sort((left, right) => String(right.updatedAt || right.lastContactedAt || "").localeCompare(String(left.updatedAt || left.lastContactedAt || "")));
    if (!matches.length) return null;
    return {
      ...matches[0],
      birthdayMonth:Number(matches.find((profile) => Number(profile.birthdayMonth))?.birthdayMonth || 0),
      aliases:matches.map((profile) => profile.wechat),
    };
  }

  function consignorIdentity(source = {}) {
    const wechat = String(source.sellerWechat || source.wechat || "").trim();
    const directProfile = state.customers[wechat] || {};
    const phone = normalizeCustomerPhone(source.sellerPhone || source.phone || directProfile.phone);
    const phoneProfile = customerProfileByPhone(phone);
    const name = phoneProfile?.wechat || wechat || "待补送拍人";
    return {key:phone ? `phone:${phone}` : `wechat:${name}`,wechat:name,phone};
  }

  function recordMatchesConsignor(record, key) {
    if (!key) return true;
    if (key === "__missing__") return !MxiqiWorkflow.hasConsignorName(record.sellerWechat);
    if (!key.includes(":")) return record.sellerWechat === key;
    return consignorIdentity(record).key === key;
  }

  function consignorDirectoryEntry(source = {}) {
    const identity = consignorIdentity(source);
    return customerDirectoryEntries().find((entry) => entry.key === identity.key) || identity;
  }

  function consignorDisplayName(value) {
    if (!value) return "全部送拍人";
    if (value === "__missing__") return "待补送拍人";
    const entry = customerDirectoryEntries().find((item) => item.key === value || item.wechat === value || item.aliases.includes(value));
    return entry?.wechat || String(value).replace(/^(?:phone|wechat):/, "");
  }

  function consignorCount(records) {
    return new Set(records.map((record) => MxiqiWorkflow.hasConsignorName(record.sellerWechat) ? consignorIdentity(record).key : "__missing__")).size;
  }

  function syncCustomerDirectory() {
    const merge = (source) => {
      const wechat = String(source?.sellerWechat || "").trim();
      if (!wechat || wechat === "手机号用户") return;
      const current = state.customers[wechat] && typeof state.customers[wechat] === "object" ? state.customers[wechat] : {};
      const incomingPhone = normalizeCustomerPhone(source.sellerPhone || source.phone);
      state.customers[wechat] = {
        ...current,
        phone: current.phone || incomingPhone,
        birthdayMonth: Number(current.birthdayMonth || source.birthdayMonth || 0),
        birthdayPending: !Number(current.birthdayMonth || source.birthdayMonth || 0)
          && Boolean(current.birthdayPending || source.birthdayPending),
        lastContactedAt: latestCustomerDate(current.lastContactedAt, source.contactedAt),
        notes: String(current.notes || ""),
      };
    };
    state.records.forEach(merge);
    state.assets.forEach(merge);
  }

  function customerDirectoryEntries() {
    syncCustomerDirectory();
    const groups = new Map();
    const ensure = (source) => {
      const identity = consignorIdentity(source);
      const alias = String(source.sellerWechat || source.wechat || "").trim();
      const current = groups.get(identity.key) || {key:identity.key,wechat:identity.wechat,phone:identity.phone,aliases:new Set(),profiles:[],records:[],assets:[]};
      if (alias && alias !== "待补送拍人") current.aliases.add(alias);
      if (identity.wechat && identity.wechat !== "待补送拍人") current.aliases.add(identity.wechat);
      if (!current.phone && identity.phone) current.phone = identity.phone;
      groups.set(identity.key, current);
      return current;
    };
    Object.entries(state.customers).forEach(([wechat, profile]) => ensure({wechat,phone:profile.phone}).profiles.push({wechat,...profile}));
    state.records.forEach((record) => ensure(record).records.push(record));
    state.assets.forEach((asset) => ensure(asset).assets.push(asset));
    return [...groups.values()].filter((group) => group.aliases.size).map((group) => {
      const profiles = group.profiles.sort((a, b) => String(b.updatedAt || b.lastContactedAt || "").localeCompare(String(a.updatedAt || a.lastContactedAt || "")));
      const latestRecord = [...group.records].sort((a, b) => String(b.contactedAt || "").localeCompare(String(a.contactedAt || "")))[0];
      const primary = profiles[0];
      const wechat = String(primary?.wechat || latestRecord?.sellerWechat || [...group.aliases][0]);
      return {
        key:group.key,
        wechat,
        aliases:[...group.aliases],
        phone:group.phone,
        birthdayMonth:Number(profiles.find((profile) => Number(profile.birthdayMonth))?.birthdayMonth || group.records.find((record) => Number(record.birthdayMonth))?.birthdayMonth || 0),
        birthdayPending:Boolean(profiles.some((profile) => profile.birthdayPending) || group.records.some((record) => record.birthdayPending)),
        lastContactedAt:latestCustomerDate(profiles.map((profile) => profile.lastContactedAt), group.records.map((record) => record.contactedAt)),
        notes:profiles.map((profile) => String(profile.notes || "").trim()).filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).join("；"),
        recordCount:group.records.length,
        assetCount:group.assets.length,
      };
    }).sort((left, right) => left.wechat.localeCompare(right.wechat, "zh-CN"));
  }

  function recordsInSettlementScope({includeSeller = false} = {}) {
    return soldRecords().filter((record) => {
      const date = datePart(record.auctionAt);
      return (!includeSeller || recordMatchesConsignor(record, state.settlementScope.seller))
        && (!state.filters.auction || auctionPeriod(record) === state.filters.auction)
        && (!state.settlementScope.from || (date && date >= state.settlementScope.from))
        && (!state.settlementScope.to || (date && date <= state.settlementScope.to));
    });
  }

  function settlementRepairableRecords() {
    return recordsInSettlementScope().filter((record) => !MxiqiWorkflow.hasConsignorName(record.sellerWechat));
  }

  function repairMissingConsignorsFromHistory(extraSnapshots = []) {
    const snapshots = [
      ...extraSnapshots,
      ...state.history.map((entry) => entry?.before).filter(Boolean),
    ];
    const repaired = MxiqiWorkflow.restoreConsignorIdentities(state.records, snapshots, state.customers);
    if (!repaired.restored) return repaired;
    state.records = repaired.records;
    state.records.filter((record) => !record.settled).forEach((record) => recalculateRecord(record, isStorageRecord(record)));
    syncCustomerDirectory();
    return repaired;
  }

  function requireManualReturnReview() {
    const repaired = MxiqiWorkflow.requireManualReturnReview(state.records);
    if (!repaired.reviewRequired) return repaired;
    state.records = repaired.records;
    state.records.filter((record) => !record.settled).forEach((record) => recalculateRecord(record, true));
    return repaired;
  }

  function assignCustomerToRecords(records, customerKey) {
    const entry = customerDirectoryEntries().find((item) => item.key === customerKey || item.wechat === customerKey);
    const wechat = entry?.wechat || customerKey;
    const profile = state.customers[wechat] || entry || {};
    records.forEach((record) => {
      record.sellerWechat = wechat;
      record.sellerPhone = normalizeCustomerPhone(profile.phone) || record.sellerPhone || "";
      record.birthdayMonth = Number(profile.birthdayMonth || record.birthdayMonth || 0);
      if (record.birthdayMonth) record.birthdayPending = false;
      if (!record.settled) recalculateRecord(record, isStorageRecord(record));
    });
  }

  function fillCustomerProfile(entry) {
    const profile = entry || {wechat:"",phone:"",birthdayMonth:0,birthdayPending:false,lastContactedAt:"",notes:"",recordCount:0,assetCount:0};
    customerForm.elements.originalWechat.value = profile.wechat;
    customerForm.elements.sellerWechat.value = profile.wechat;
    customerForm.elements.phone.value = profile.phone;
    customerForm.elements.birthdayMonth.value = profile.birthdayMonth || "";
    customerForm.elements.lastContactedAt.value = profile.lastContactedAt || "";
    customerForm.elements.notes.value = profile.notes || "";
    $("#customer-profile-title").textContent = profile.wechat || "新增送拍人";
    $("#customer-avatar").textContent = profile.birthdayMonth ? "🎂" : (String(profile.wechat || "").trim().slice(0, 1) || "送");
    $("#customer-record-count").textContent = `${profile.recordCount} 件${profile.assetCount ? ` · 寄存 ${profile.assetCount}` : ""}`;
    $("#customer-last-contact").textContent = profile.lastContactedAt || "待补";
    $("#customer-birthday-summary").textContent = profile.birthdayMonth ? `🎂 ${profile.birthdayMonth} 月` : profile.birthdayPending ? "生日月份待补" : "待补";
    $("#export-customer-image").disabled = !entry || !(Number(profile.recordCount || 0) + Number(profile.assetCount || 0));
  }

  function renderCustomerDirectory(selectedKey = state.editingCustomer) {
    const entries = customerDirectoryEntries();
    const query = state.customerQuery.trim().toLowerCase();
    const visible = entries.filter((entry) => !query || [entry.wechat, entry.phone, entry.notes, ...entry.aliases].join(" ").toLowerCase().includes(query));
    if (selectedKey && !entries.some((entry) => entry.key === selectedKey || entry.wechat === selectedKey)) selectedKey = "";
    if (selectedKey && !entries.some((entry) => entry.key === selectedKey) && entries.some((entry) => entry.wechat === selectedKey)) selectedKey = entries.find((entry) => entry.wechat === selectedKey).key;
    if (!selectedKey && visible.length) selectedKey = visible[0].key;
    state.editingCustomer = selectedKey;
    $("#customer-directory-count").textContent = `${entries.length} 位送拍人 · 本机保存`;
    $("#customer-list").innerHTML = visible.length ? visible.map((entry) => `<button type="button" class="customer-list-item ${entry.key === selectedKey ? "active" : ""}" data-customer-key="${esc(entry.key)}"><span><b>${entry.birthdayMonth ? "🎂 " : ""}${esc(entry.wechat)}</b><small>${esc(entry.phone || "手机号待补")} · ${entry.recordCount} 件拍品${entry.birthdayPending && !entry.birthdayMonth ? " · 生日月份待补" : ""}${entry.aliases.length > 1 ? ` · 合并 ${entry.aliases.length} 个昵称` : ""}</small></span><strong>${entry.birthdayMonth ? `${entry.birthdayMonth} 月` : entry.birthdayPending ? "待补月份" : "查看"}</strong></button>`).join("") : '<div class="audit-empty">没有找到送拍人</div>';
    fillCustomerProfile(entries.find((entry) => entry.key === selectedKey));
  }

  function openCustomerDirectory(selectedKey = "") {
    state.customerQuery = "";
    $("#customer-search").value = "";
    renderCustomerDirectory(selectedKey);
    persistState();
    customerDialog.showModal();
  }

  async function exportCustomerImage() {
    const entry = customerDirectoryEntries().find((item) => item.key === state.editingCustomer || item.wechat === state.editingCustomer);
    if (!entry) return notify("请先选择一位送拍人", "error");
    const records = state.records.filter((record) => recordMatchesConsignor(record, entry.key));
    const recordIds = new Set(records.map((record) => record.id));
    const extraAssets = state.assets.filter((asset) => recordMatchesConsignor(asset, entry.key) && (!asset.matchedRecordId || !recordIds.has(asset.matchedRecordId)));
    const rows = [
      ...records.map((record) => ({period:auctionPeriod(record),lot:record.lot,itemName:record.itemName,status:recordStatus(record),price:Number(record.finalPrice || 0)})),
      ...extraAssets.map((asset) => ({period:asset.projectName || "寄存库存",lot:asset.lot || "—",itemName:asset.itemName || asset.title || "未命名拍品",status:"寄存",price:Number(asset.cost || 0)})),
    ].sort((left, right) => String(left.period).localeCompare(String(right.period), "zh-CN") || Number(left.lot || 0) - Number(right.lot || 0));
    if (!rows.length) return notify("这位送拍人暂时没有可导出的拍品", "error");

    const width = 1700;
    const rowHeight = 58;
    const headerHeight = 224;
    const footerHeight = 58;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = headerHeight + rowHeight * (rows.length + 1) + footerHeight;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f7f5ef";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#102735";
    context.fillRect(0, 0, width, 112);
    context.fillStyle = "#f7ead0";
    context.font = 'bold 34px "Microsoft YaHei", sans-serif';
    context.fillText("送拍人拍品清单", 48, 68);
    drawChecklistLogo(context, width, await loadChecklistLogo());
    context.fillStyle = "#314b57";
    context.font = '20px "Microsoft YaHei", sans-serif';
    context.fillText(`送拍人：${entry.wechat}　手机号：${entry.phone || "待补"}${entry.birthdayMonth ? `　生日：${entry.birthdayMonth} 月` : ""}`, 48, 152);
    context.font = 'bold 22px "Microsoft YaHei", sans-serif';
    context.fillText(`${rows.length} 件拍品${entry.aliases.length > 1 ? `　已按手机号合并 ${entry.aliases.length} 个昵称` : ""}`, 48, 196);
    const columns = [
      {label:"拍卖期数 / 来源",x:48,width:300},
      {label:"Lot",x:348,width:120},
      {label:"拍品名称",x:468,width:760},
      {label:"状态",x:1228,width:220},
      {label:"成交价 / 成本",x:1448,width:204},
    ];
    context.fillStyle = "#e8e5dd";
    context.fillRect(36, headerHeight, width - 72, rowHeight);
    context.fillStyle = "#52636c";
    context.font = 'bold 18px "Microsoft YaHei", sans-serif';
    columns.forEach((column) => context.fillText(column.label, column.x + 10, headerHeight + 37));
    const truncate = (value, max) => String(value || "").length > max ? `${String(value).slice(0, max - 1)}…` : String(value || "");
    rows.forEach((row, index) => {
      const y = headerHeight + rowHeight * (index + 1);
      context.fillStyle = index % 2 ? "#f1efe9" : "#fffefa";
      context.fillRect(36, y, width - 72, rowHeight);
      context.fillStyle = "#213944";
      context.font = '17px "Microsoft YaHei", sans-serif';
      const values = [truncate(row.period,16),row.lot,truncate(row.itemName,42),truncate(row.status,12),row.price ? currency.format(row.price) : "—"];
      values.forEach((value, columnIndex) => context.fillText(String(value), columns[columnIndex].x + 10, y + 37));
    });
    context.fillStyle = "#7b898f";
    context.font = '14px "Microsoft YaHei", sans-serif';
    context.fillText(`生成时间：${new Date().toLocaleString("zh-CN")} · 送拍运营工作台`, 48, canvas.height - 22);
    canvas.toBlob((blob) => {
      if (!blob) return notify("送拍人清单图片生成失败", "error");
      const safeName = String(entry.wechat || "").replace(/[^\w\u4e00-\u9fa5-]/g, "");
      downloadBlob(blob, `送拍人拍品清单_${safeName}_${entry.phone || "手机号待补"}_${new Date().toISOString().slice(0,10)}.png`, "image/png");
      audit("导出送拍人拍品图片", `${entry.wechat} · ${entry.phone || "手机号待补"} · ${rows.length} 件拍品`);
      notify("送拍人拍品清单图片已下载");
    }, "image/png");
  }

  function audit(action, detail, {undoable = true} = {}) {
    const currentFingerprint = snapshotFingerprint(businessSnapshot());
    const createdSnapshot = undoable ? captureHistorySnapshot() : null;
    const snapshot = createdSnapshot || (undoable ? state.history.find((item) => item.pending && item.afterFingerprint === currentFingerprint) : null);
    if (snapshot) {
      snapshot.action = action;
      snapshot.detail = detail;
      snapshot.pending = false;
    }
    state.audit.unshift({id:uid(), action, detail, time:new Date().toISOString(), undoSnapshotId:snapshot?.id || ""});
    save({skipHistoryCapture:true});
  }

  function historyTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "时间未知" : date.toLocaleString("zh-CN", {month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});
  }

  function renderAuditDialog() {
    const list = $("#audit-list");
    list.innerHTML = state.audit.length ? state.audit.map((item) => `<article class="audit-entry"><span class="audit-dot"></span><div><b>${esc(item.action)}</b><p>${esc(item.detail)}</p></div><time>${historyTime(item.time)}</time></article>`).join("") : '<div class="audit-empty">暂无操作记录</div>';
    const select = $("#undo-target");
    const validHistory = state.history.filter((item) => item?.before);
    select.innerHTML = '<option value="">请选择一次操作</option>' + validHistory.map((item) => {
      const label = item.action === "撤回前状态"
        ? `${historyTime(item.time)} · 恢复撤回前状态`
        : `${historyTime(item.time)} · 撤回“${item.action || "数据修改"}”`;
      return `<option value="${esc(item.id)}">${esc(label)}</option>`;
    }).join("");
    $("#undo-operation").disabled = true;
  }

  function restoreHistoryEntry(entry) {
    if (!entry?.before) return;
    const current = businessSnapshot();
    const warning = entry.legacy
      ? `旧版本没有保存完整快照，将按“最后新增的 ${entry.legacyCount} 条拍品”推断撤回。确定继续吗？\n\n当前状态会另存为“撤回前状态”，需要时可恢复。`
      : `确定撤回“${entry.action || "所选操作"}”吗？\n\n当前状态会另存为“撤回前状态”，需要时可恢复。`;
    if (!confirm(warning)) return;
    const target = clone(entry.before);
    const safety = {
      id:uid(),
      time:new Date().toISOString(),
      action:"撤回前状态",
      detail:`撤回“${entry.action || "所选操作"}”前自动保存`,
      pending:false,
      before:current,
      afterFingerprint:snapshotFingerprint(target),
    };
    suppressHistoryCapture = true;
    try {
      state.records = Array.isArray(target.records) ? target.records : [];
      state.assets = Array.isArray(target.assets) ? target.assets : [];
      state.settings = target.settings && typeof target.settings === "object" ? {...clone(defaultSettings), ...target.settings} : clone(defaultSettings);
      state.customers = target.customers && typeof target.customers === "object" ? target.customers : {};
      state.history = [safety, ...state.history.filter((item) => item.id !== safety.id)].slice(0, HISTORY_LIMIT);
      state.selected.clear();
      state.selectedAssets.clear();
      state.expandedPackages.clear();
      state.expandedSettlements.clear();
      persistState();
    } finally {
      suppressHistoryCapture = false;
    }
    audit("撤回操作", `已恢复到“${entry.action || "所选操作"}”发生前`, {undoable:false});
    render();
    renderAssetPanel();
    updateBackupSummary();
    renderAuditDialog();
    notify("撤回完成；撤回前状态也已保存，可在这里再次恢复");
  }

  function ensureLegacyImportUndo() {
    if (state.history.some((item) => item?.before && /^导入数据/.test(item.action || ""))) return;
    const latest = state.audit[0];
    if (!latest || latest.action !== "导入数据") return;
    const count = Number(String(latest.detail || "").match(/(\d+)\s*条拍品/)?.[1] || 0);
    if (!count || count > 200 || count > state.records.length) return;
    const before = businessSnapshot();
    before.records = before.records.slice(0, -count);
    const importedRecordIds = new Set(state.records.slice(-count).map((record) => record.id));
    before.assets = before.assets.filter((asset) => !asset.recordStorageId || !importedRecordIds.has(asset.recordStorageId));
    state.history = [{
      id:uid(),
      time:latest.time || new Date().toISOString(),
      action:"导入数据（旧版本）",
      detail:`${count} 条拍品 · 按最后新增记录推断`,
      pending:false,
      legacy:true,
      legacyCount:count,
      before,
      afterFingerprint:snapshotFingerprint(businessSnapshot()),
    }, ...state.history].slice(0, HISTORY_LIMIT);
    persistState();
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
      record.sellerWechat && !record.sellerPhone && "送拍人手机号",
      record.birthdayPending && !Number(record.birthdayMonth || 0) && "生日月份",
      !record.contactedAt && "联系时间",
      !record.trackingNumber && "快递单号",
      !record.itemName && "拍品名称",
      !record.auctionAt && "拍卖时间",
      !record.lotLabel && "拍场/Lot",
      record.received === "待确认" && "是否收到",
      !record.finalOutcome && "成交状态",
      record.finalOutcome === "成交" && !isReturnRecord(record) && Number(record.finalPrice) <= 0 && "最终价格",
      record.finalOutcome === "成交" && !isReturnRecord(record) && !(record.buyerName || record.recipientName) && "买家",
      record.finalOutcome === "成交" && !isReturnRecord(record) && !(record.buyerPhone || record.recipientPhone) && "买家手机号",
    ].filter(Boolean);
  }

  function auctionMonth(record) {
    const source = String(record.auctionAt || "").trim();
    const isoMatch = source.match(/^\d{4}-(\d{1,2})/);
    if (isoMatch) return Number(isoMatch[1]);
    const compactMatch = source.match(/^\d{2}(\d{2})\d{2}/);
    return compactMatch ? Number(compactMatch[1]) : new Date().getMonth() + 1;
  }

  function birthdayMonthFor(record) {
    if (record.birthdayPending && !Number(record.birthdayMonth || 0)) return 0;
    const phone = normalizeCustomerPhone(record.sellerPhone || state.customers[record.sellerWechat]?.phone);
    const phoneProfile = phone ? Object.values(state.customers).find((profile) => normalizeCustomerPhone(profile?.phone) === phone) : null;
    return Number(record.birthdayMonth || phoneProfile?.birthdayMonth || state.customers[record.sellerWechat]?.birthdayMonth || 0);
  }

  function isReturnRecord(record) {
    return MxiqiWorkflow.isReturnRecord(record);
  }

  function isStorageRecord(record) {
    return MxiqiWorkflow.isStorageRecord(record);
  }

  function auctionPeriod(record) {
    return MxiqiWorkflow.auctionPeriod(record);
  }

  function settlementGross(record) {
    return MxiqiWorkflow.settlementGross(record);
  }

  function isSettlementEligible(record) {
    return MxiqiWorkflow.isSettlementEligible(record);
  }

  function formatRule(type, value) {
    return type === "fixed" ? `每件 ${currency.format(value || 0)}` : `成交价的 ${Number(value || 0)}%`;
  }

  function commissionPlan(record) {
    const gross = settlementGross(record);
    const automaticPlan = MxiqiCommission.calculate({gross,birthdayMonth:birthdayMonthFor(record),auctionMonth:auctionMonth(record),title:record.itemName,isReturn:isReturnRecord(record),settings:state.settings});
    const overrideType = ["percent", "fixed"].includes(record.commissionOverrideType) ? record.commissionOverrideType : "";
    if (overrideType) {
      const value = Number(record.commissionOverrideValue || 0);
      const amount = roundMoney(overrideType === "fixed" ? value : gross * value / 100);
      const detail = overrideType === "fixed" ? currency.format(value) : `${value}%`;
      return {...automaticPlan,amount:Math.min(amount, gross),label:`手工佣金 · ${detail}`,type:overrideType,value,isManual:true,isBirthday:false,isBoxRebate:false,automaticPlan};
    }
    return {...automaticPlan,isManual:false,label:`${automaticPlan.label} · ${automaticPlan.type === "fixed" ? currency.format(automaticPlan.value) : `${automaticPlan.value}%`}`};
  }

  function recalculateRecord(record, force = false) {
    const gross = settlementGross(record);
    if (isStorageRecord(record)) {
      record.commissionAmount = 0;
      record.settlementAmount = 0;
      record.profit = 0;
      record.promotion = "";
      record.settled = false;
      record.settledAt = "";
      return record;
    }
    if (record.settled && !force) return record;
    if (!isSettlementEligible(record)) {
      record.commissionAmount = 0;
      record.settlementAmount = 0;
      record.profit = 0;
      record.promotion = "";
      return record;
    }
    const plan = commissionPlan(record);
    const adjustment = roundMoney(Number(record.settlementAdjustment || 0));
    record.commissionAmount = plan.amount;
    record.settlementAmount = roundMoney(gross - plan.amount + adjustment);
    record.profit = roundMoney(plan.amount - adjustment);
    record.promotion = `${plan.label}${adjustment ? ` · ${adjustment > 0 ? "额外加款" : "额外扣款"} ${currency.format(Math.abs(adjustment))}` : ""}`;
    return record;
  }

  function carrierFor(record) {
    return record.carrierOverride || (Number(record.finalPrice) >= Number(state.settings.sfThreshold || 1000) ? "sf" : "cainiao");
  }

  function carrierLabel(value) {
    return value === "sf" ? "顺丰" : value === "cainiao" ? "菜鸟" : "待判断";
  }

  function logisticsLabel(value) {
    return ({not_requested:"未申请",simulation_ready:"历史演示数据",ready:"真实物流已就绪",submitted:"已提交物流平台",failed:"申请失败"})[value] || "未申请";
  }

  function logisticsProviderState(carrier) {
    return logisticsRuntime.providers?.[carrier] || {};
  }

  function logisticsOperatorKey() {
    try {
      return String(sessionStorage.getItem(LOGISTICS_OPERATOR_KEY) || "").trim();
    } catch {
      return "";
    }
  }

  function logisticsGatewayUrl() {
    return String(state.settings.logisticsGatewayUrl || "").trim();
  }

  function logisticsCanCreate(carrier) {
    return logisticsRuntime.installed
      && logisticsRuntime.capabilities.includes("createLogisticsOrder")
      && logisticsProviderState(carrier).configured === true
      && Boolean(logisticsOperatorKey());
  }

  function shipmentRequest(records, carrier) {
    return MxiqiLogistics.buildRequest({records,carrier,settings:state.settings});
  }

  function renderLogisticsConnection(carrier = "cainiao") {
    const provider = logisticsProviderState(carrier);
    const status = $("#shipping-logistics-status");
    const notice = $("#shipping-connection-notice");
    const sidebar = $("#logistics-sidebar-status");
    const dot = $("#logistics-sidebar-dot");
    if (logisticsRuntime.checking) {
      status.textContent = "正在检查真实物流服务";
      return;
    }
    if (logisticsCanCreate(carrier)) {
      status.textContent = `${carrierLabel(carrier)}真实接口已就绪`;
      notice.className = "collector-notice success";
      notice.innerHTML = `<b>${carrierLabel(carrier)}真实下单已接通</b><p>提交后只接受物流平台返回的真实业务单号和运单号，不会生成演示数据。</p>`;
      sidebar.textContent = "真实物流已接通";
      dot.className = "status-dot connected";
      return;
    }
    const reason = provider.configured === true && !logisticsOperatorKey()
      ? "真实接口已配置，但还未填写本次操作授权码"
      : provider.reason || logisticsRuntime.lastError || "未连接到真实物流后台";
    status.textContent = `${carrierLabel(carrier)}接口未就绪`;
    notice.className = "collector-notice";
    notice.innerHTML = `<b>当前只能人工完成真实下单</b><p>${esc(reason)}。请在物流平台下单后，把真实运单号和取件码录入；系统不会生成假单号。</p>`;
    sidebar.textContent = logisticsRuntime.installed ? "真实物流待授权" : "真实物流待接入";
    dot.className = "status-dot";
  }

  async function checkLogisticsConnection({notifyResult = false} = {}) {
    logisticsRuntime.checking = true;
    renderLogisticsConnection(shippingForm?.elements?.shippingCarrier?.value || "cainiao");
    try {
      const result = await MxiqiLogisticsGateway.health({baseUrl:logisticsGatewayUrl()});
      logisticsRuntime.checked = true;
      logisticsRuntime.installed = Boolean(result.online);
      logisticsRuntime.version = result.version || "";
      logisticsRuntime.capabilities = Array.isArray(result.capabilities) ? result.capabilities : [];
      logisticsRuntime.providers = result.providers || {};
      logisticsRuntime.source = "gateway";
      logisticsRuntime.lastError = "";
      if (notifyResult) notify("物流连接状态已更新");
    } catch (error) {
      logisticsRuntime.checked = true;
      logisticsRuntime.installed = false;
      logisticsRuntime.capabilities = [];
      logisticsRuntime.providers = {};
      logisticsRuntime.lastError = error.message || "未连接到真实物流后台";
      if (notifyResult) notify(logisticsRuntime.lastError, "error");
    } finally {
      logisticsRuntime.checking = false;
      renderLogisticsConnection(shippingForm?.elements?.shippingCarrier?.value || "cainiao");
    }
  }

  function isShippingCandidate(record) {
    return record.finalOutcome === "成交"
      && Number(record.finalPrice) > 0
      && record.paymentStatus === "已付款"
      && record.returnDisposition !== "寄存"
      && !isReturnRecord(record);
  }

  function shippingStage(record) {
    if (record.returnDisposition === "寄存") return "completed";
    if (!isShippingCandidate(record)) return "not_ready";
    if (record.mxiqiShippingStatus === "filled") return "completed";
    if (record.outboundTrackingNumber) return "mxiqi_pending";
    if (record.addressStatus === "reviewed") return "ready_to_order";
    return "needs_address";
  }

  function shippingStageLabel(record) {
    if (record.returnDisposition === "寄存") return "已转寄存库";
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
    return state.records.filter(isSettlementEligible);
  }

  function isPaymentOverdue(record) {
    return MxiqiWorkflow.isPaymentOverdue(record);
  }

  function recordStatus(record) {
    return MxiqiWorkflow.recordStatus(record);
  }

  function isAuctionResultPending(record) {
    return MxiqiWorkflow.isAuctionResultPending(record);
  }

  function isPreauctionRecord(record) {
    return ["待拍", "上拍"].includes(recordStatus(record));
  }

  function hasBoxRebateSignal(record) {
    return MxiqiCommission.hasBoxRebate({gross:record.finalPrice,title:record.itemName,settings:state.settings});
  }

  function hasAppliedBoxRebate(record) {
    return commissionPlan(record).isBoxRebate;
  }

  function promotionBadges(record) {
    const badges = [];
    const plan = commissionPlan(record);
    if (record.unpaidReturn && !isStorageRecord(record)) badges.push(`<span class="chip neutral">未付款拖回扣 ${currency.format(state.settings.returnHandlingFee || 0)}</span>`);
    else if (isReturnRecord(record)) badges.push(`<span class="chip neutral">拖回扣 ${currency.format(state.settings.returnHandlingFee || 0)}</span>`);
    if (plan.isManual) badges.push(`<span class="chip neutral">手工佣金 ${plan.type === "fixed" ? currency.format(plan.value) : `${plan.value}%`}</span>`);
    else if (plan.isBirthday) badges.push('<span class="chip birthday">生日</span>');
    else if (plan.isBoxRebate) badges.push(`<span class="chip box-rebate">NP优惠 ${Math.abs(Number(plan.value || 0))}%</span>`);
    const adjustment = Number(record.settlementAdjustment || 0);
    if (adjustment) badges.push(`<span class="chip neutral">${adjustment > 0 ? "额外加款" : "额外扣款"} ${currency.format(Math.abs(adjustment))}</span>`);
    return badges.length ? `<div class="promotion-badges">${badges.join("")}</div>` : "";
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
    return recordsInSettlementScope({includeSeller:true});
  }

  function settlementGate(period = state.filters.auction, records = state.records) {
    return MxiqiWorkflow.settlementReadiness(records, period);
  }

  function settlementGateMessage(gate) {
    if (!gate.period) return "请先在拍卖期数中选择具体期数，再进行结账";
    if (gate.ready) return `${gate.period} 的待付款和拖回事项已处理完成`;
    const summary = [
      gate.pendingPayment ? `${gate.pendingPayment} 件待付款` : "",
      gate.pendingReturn ? `${gate.pendingReturn} 件拖回待处理` : "",
    ].filter(Boolean).join("、");
    const lots = gate.blockers.slice(0, 8).map((item) => `Lot ${item.lot || "待补"}（${item.reason}）`).join("、");
    return `${gate.period} 暂不能结账：${summary}${lots ? `；${lots}` : ""}${gate.blockers.length > 8 ? ` 等 ${gate.blockers.length} 件` : ""}`;
  }

  function requireSettlementReady(period = state.filters.auction, records = state.records) {
    const gate = settlementGate(period, records);
    if (!gate.ready) notify(settlementGateMessage(gate), "error");
    return gate.ready;
  }

  function visibleRecords() {
    const query = state.query.trim().toLowerCase();
    return state.records.filter((record) => {
      const search = !query || [record.lot,record.itemName,record.projectName,record.sellerWechat,record.sellerPhone,record.buyerName,record.buyerPhone,record.auctionHouse,record.trackingNumber,record.pickupCode,record.outboundTrackingNumber,record.recipientName,record.recipientPhone,record.recipientRaw,record.promotion].join(" ").toLowerCase().includes(query);
      const sellerMatches = recordMatchesConsignor(record, state.filters.seller);
      const filters = sellerMatches
        && (!state.filters.auction || auctionPeriod(record) === state.filters.auction)
        && (!state.filters.status || recordStatus(record) === state.filters.status)
        && (!state.filters.shipping || (["shipped","unshipped"].includes(state.filters.shipping) ? MxiqiWorkflow.shippingBucket(record) === state.filters.shipping : shippingStage(record) === state.filters.shipping));
      const stage = state.stage === "all"
        || (state.stage === "unpaid" && record.paymentStatus === "待付款")
        || (state.stage === "missing" && missing(record).length)
        || (state.stage === "reauction" && record.returnDisposition === "拖回/再拍")
        || (state.stage === "preauction" && isPreauctionRecord(record))
        || (state.stage === "pickup" && Number(record.finalPrice) > 0 && !record.pickupCode)
        || (state.stage === "shipping" && isShippingCandidate(record) && shippingStage(record) !== "completed")
        || (state.stage === "settlement"
          && settlementRecords().some((item) => item.id === record.id)
          && (state.settlementView !== "unsettled" || !record.settled));
      return search && filters && stage;
    });
  }

  function setDynamicOptions(selector, values, allLabel, current) {
    const select = $(selector);
    select.innerHTML = `<option value="">${esc(allLabel)}</option>${values.map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join("")}`;
    select.value = current || "";
  }

  function setConsignorOptions(selector, entries, allLabel, current) {
    const select = $(selector);
    const resolved = entries.find((entry) => entry.key === current || entry.wechat === current || entry.aliases.includes(current))?.key || current || "";
    select.innerHTML = `<option value="">${esc(allLabel)}</option>${entries.map((entry) => `<option value="${esc(entry.key)}">${esc(entry.wechat)}${entry.phone ? ` · ${esc(entry.phone)}` : ""}${entry.aliases.length > 1 ? ` · ${entry.aliases.length} 个昵称` : ""}</option>`).join("")}`;
    select.value = resolved;
    return resolved;
  }

  function renderFilterOptions() {
    const sellers = customerDirectoryEntries().filter((entry) => entry.recordCount > 0);
    const auctions = [...new Set(state.records.map(auctionPeriod).filter((value) => value !== "期数待补"))].sort((a, b) => a.localeCompare(b, "zh-CN", {numeric:true}));
    state.filters.seller = setConsignorOptions("#filter-seller", sellers, "全部", state.filters.seller);
    if (state.records.some((record) => !MxiqiWorkflow.hasConsignorName(record.sellerWechat))) {
      $("#filter-seller").insertAdjacentHTML("beforeend", '<option value="__missing__">待补送拍人</option>');
      $("#filter-seller").value = state.filters.seller;
    }
    setDynamicOptions("#filter-auction", auctions, "全部", state.filters.auction);
    $("#auction-period-options").innerHTML = auctions.map((value) => `<option value="${esc(value)}"></option>`).join("");
    $("#filter-status").value = state.filters.status;
    $("#filter-shipping").value = state.filters.shipping;
    state.settlementScope.seller = setConsignorOptions("#settlement-seller", sellers, "全部送拍人", state.settlementScope.seller);
    $("#settlement-from").value = state.settlementScope.from;
    $("#settlement-to").value = state.settlementScope.to;
  }

  function renderSellerSummary() {
    const periodRecords = soldRecords().filter((record) => {
      const date = datePart(record.auctionAt);
      return (!state.filters.auction || auctionPeriod(record) === state.filters.auction)
        && (!state.settlementScope.from || (date && date >= state.settlementScope.from))
        && (!state.settlementScope.to || (date && date <= state.settlementScope.to));
    });
    const directory = new Map(customerDirectoryEntries().map((entry) => [entry.key, entry]));
    const grouped = new Map();
    periodRecords.forEach((record) => {
      const missingSeller = !MxiqiWorkflow.hasConsignorName(record.sellerWechat);
      const identity = missingSeller ? {key:"__missing__",wechat:"待补送拍人",phone:""} : consignorIdentity(record);
      const profile = directory.get(identity.key);
      const seller = profile?.wechat || identity.wechat;
      const current = grouped.get(identity.key) || {key:identity.key,seller,phone:profile?.phone || identity.phone || record.sellerPhone || "",count:0,gross:0,payable:0,pending:0};
      if (!current.phone && record.sellerPhone) current.phone = record.sellerPhone;
      current.count += 1;
      current.gross += settlementGross(record);
      current.payable += Number(record.settlementAmount || 0);
      if (!record.settled) current.pending += 1;
      grouped.set(identity.key, current);
    });
    const entries = [...grouped.values()]
      .filter((item) => state.settlementView !== "unsettled" || item.pending > 0)
      .sort((a, b) => Number(b.pending > 0) - Number(a.pending > 0) || b.pending - a.pending || b.payable - a.payable);
    $("#seller-summary-list").innerHTML = entries.length ? entries.map((item) => `<button class="seller-summary-item ${item.pending ? "has-unsettled" : ""} ${state.settlementScope.seller === item.key ? "active" : ""}" data-seller-summary="${esc(item.key === "__missing__" ? "" : item.key)}"><span><b>${esc(item.seller)}</b><small>${esc(item.phone || "手机号待补")} · ${item.count} 件 · ${item.pending} 件待结账 · 成交 ${currency.format(item.gross)}</small></span><strong>${item.pending ? `${item.pending} 件未结` : "已结清"}<small>${currency.format(item.payable)}</small></strong></button>`).join("") : '<div class="audit-empty">当前范围内没有未结账送拍人</div>';
  }

  function renderPreauctionSummary() {
    const records = state.records.filter((record) => isPreauctionRecord(record) && (!state.filters.auction || auctionPeriod(record) === state.filters.auction));
    const directory = new Map(customerDirectoryEntries().map((entry) => [entry.key, entry]));
    const grouped = new Map();
    records.forEach((record) => {
      const missingSeller = !MxiqiWorkflow.hasConsignorName(record.sellerWechat);
      const identity = missingSeller ? {key:"__missing__",wechat:"待补送拍人",phone:""} : consignorIdentity(record);
      const profile = directory.get(identity.key);
      const seller = profile?.wechat || identity.wechat;
      const current = grouped.get(identity.key) || {key:identity.key,seller,phone:profile?.phone || identity.phone || record.sellerPhone || "",count:0,periods:new Set()};
      if (!current.phone && record.sellerPhone) current.phone = record.sellerPhone;
      current.count += 1;
      current.periods.add(auctionPeriod(record));
      grouped.set(identity.key, current);
    });
    const entries = [...grouped.values()].sort((a, b) => b.count - a.count || a.seller.localeCompare(b.seller, "zh-CN"));
    $("#preauction-summary").hidden = state.stage !== "preauction";
    $("#preauction-seller-list").innerHTML = entries.length ? entries.map((item) => {
      const filterValue = item.key;
      return `<button class="seller-summary-item ${state.filters.seller === filterValue ? "active" : ""}" data-preauction-seller="${esc(filterValue)}"><span><b>${esc(item.seller)}</b><small>${esc(item.phone || "手机号待补")} · ${item.count} 件拍品 · ${esc([...item.periods].join("、"))}</small></span><strong>${item.count} 件</strong></button>`;
    }).join("") : '<div class="audit-empty">当前期数暂无待拍或上拍拍品</div>';
  }

  function renderSettlementSummary() {
    const sold = settlementRecords();
    const settled = sold.filter((record) => record.settled);
    const remaining = sold.length - settled.length;
    if (!remaining) state.settlementView = "all";
    const gate = settlementGate();
    const percent = sold.length ? Math.round(settled.length * 100 / sold.length) : 0;
    $("#settlement-summary").hidden = state.stage !== "settlement";
    $("#settled-count").textContent = settled.length;
    $("#sold-count").textContent = sold.length;
    $("#settlement-progress").style.width = `${percent}%`;
    $("#settlement-gross").textContent = currency.format(sold.reduce((sum, record) => sum + settlementGross(record), 0));
    const adjustmentTotal = sold.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0);
    $("#settlement-commission-label").textContent = settlementAdjustmentSummaryLabel(adjustmentTotal);
    $("#settlement-commission").textContent = formatSettlementAdjustment(adjustmentTotal);
    $("#settlement-payable").textContent = currency.format(sold.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0));
    const unpaidReturns = sold.filter((record) => record.unpaidReturn);
    $("#settlement-unpaid-return").textContent = `${unpaidReturns.length} 笔 / ${currency.format(unpaidReturns.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0))}`;
    const blockerBox = $("#settlement-blockers");
    blockerBox.hidden = gate.ready;
    blockerBox.innerHTML = gate.ready ? "" : `<b>${esc(settlementGateMessage(gate))}</b>${gate.blockers.map((item) => `<span>Lot ${esc(item.lot || "待补")} · ${esc(item.reason)}</span>`).join("")}`;
    $("#settlement-hint").textContent = !gate.ready
      ? "先处理本期全部待付款和拖回事项，处理完成后才开放结账。"
      : remaining ? `前置事项已完成，还有 ${remaining} 条待确认结账。` : "本期前置事项及结账均已完成，可以导出结算表。";
    const primaryAction = $("#export-settlement");
    primaryAction.disabled = !sold.length;
    primaryAction.classList.toggle("unsettled-action", remaining > 0);
    primaryAction.setAttribute("aria-pressed", state.settlementView === "unsettled" ? "true" : "false");
    primaryAction.title = remaining ? "点击查看未结账送拍人和拍品明细" : "导出本期结算表";
    primaryAction.textContent = remaining
      ? state.settlementView === "unsettled" ? "显示全部结算记录" : `查看 ${remaining} 条未结账`
      : "导出本期结算表";
    $("#export-settlement-image").disabled = !sold.length;
    $("#export-settlement-checklist-image").disabled = !(sold.length && remaining === 0);
    const repairable = settlementRepairableRecords();
    const repairPanel = $("#seller-repair-panel");
    repairPanel.hidden = !repairable.length;
    $("#seller-repair-count").textContent = repairable.length;
    const repairSelect = $("#seller-repair-customer");
    const selectedCustomer = repairSelect.value;
    repairSelect.innerHTML = '<option value="">选择已保存的送拍人</option>' + customerDirectoryEntries().map((entry) => `<option value="${esc(entry.key)}">${esc(entry.wechat)}${entry.phone ? ` · ${esc(entry.phone)}` : ""}</option>`).join("");
    repairSelect.value = [...repairSelect.options].some((option) => option.value === selectedCustomer) ? selectedCustomer : "";
    $("#seller-repair-apply").disabled = !repairSelect.value || !repairable.length;
    renderSellerSummary();
  }

  function renderReauctionSummary() {
    const records = state.records.filter((record) => record.returnDisposition === "拖回/再拍");
    $("#reauction-summary").hidden = state.stage !== "reauction";
    $("#reauction-count").textContent = records.length;
    $("#reauction-seller-count").textContent = consignorCount(records);
    $("#reauction-unsettled-count").textContent = records.filter((record) => !record.settled).length;
    $("#reauction-settled-count").textContent = records.filter((record) => record.settled).length;
  }

  function nextShippingRecord() {
    const priority = {mxiqi_pending:0,ready_to_order:1,needs_address:2};
    return state.records.filter((record) => isShippingCandidate(record) && shippingStage(record) !== "completed").sort((a, b) => (priority[shippingStage(a)] ?? 9) - (priority[shippingStage(b)] ?? 9) || Number(a.lot) - Number(b.lot))[0];
  }

  function renderShippingSummary() {
    const candidates = state.records.filter(isShippingCandidate);
    const counts = {needs_address:0,ready_to_order:0,mxiqi_pending:0,completed:0};
    const packages = MxiqiPackages.groupRecords(candidates);
    packages.forEach((group) => {
      const stages = group.records.map(shippingStage);
      const stage = stages.includes("needs_address") ? "needs_address"
        : stages.includes("ready_to_order") ? "ready_to_order"
          : stages.includes("mxiqi_pending") ? "mxiqi_pending" : "completed";
      counts[stage] += 1;
    });
    const pending = packages.length - counts.completed;
    $("#shipping-summary").hidden = state.stage !== "shipping";
    $("#shipping-pending-count").textContent = pending;
    $("#shipping-address-count").textContent = counts.needs_address;
    $("#shipping-order-count").textContent = counts.ready_to_order;
    $("#shipping-fill-count").textContent = counts.mxiqi_pending;
    $("#shipping-complete-count").textContent = counts.completed;
    $("#shipping-next").disabled = !pending;
    $("#shipping-next").textContent = pending ? "处理下一单" : "本批发货已完成";
  }

  function recordsForPackageKey(key) {
    return state.records.filter((record) => MxiqiPackages.packageKey(record) === key);
  }

  function activeShippingRecords() {
    const ids = state.shippingIds?.length ? state.shippingIds : [state.shippingId];
    return ids.map((id) => state.records.find((record) => record.id === id)).filter(Boolean);
  }

  function statusChipClass(status) {
    if (status === "超时未付款") return "overdue";
    if (status === "待付款") return "payment";
    if (status === "成交结果待同步") return "warning";
    if (/^拖回\//.test(status) || status === "拆单/成交") return "disposition";
    if (status === "成交") return "success";
    return "neutral";
  }

  function renderStatusCell(record) {
    const status = recordStatus(record);
    const resultPending = isAuctionResultPending(record);
    const payment = resultPending ? "请同步本期成交目录" : record.paymentStatus ? `付款：${record.paymentStatus}` : "付款状态未同步";
    const deadline = record.paymentStatus === "待付款" && record.paymentDueAt ? ` · 截止 ${String(record.paymentDueAt).replace("T", " ")}` : "";
    const reauctionMatch = record.reauctionMatchedAt
      ? `<small class="reauction-match-note" title="${esc(record.reauctionMatchReason || "拍品名称模糊匹配")}">↻ 再拍库匹配${Number(record.reauctionMatchSimilarity) > 0 ? ` ${Math.round(Number(record.reauctionMatchSimilarity) * 100)}%` : ""}</small>`
      : record.reauctionMatchStatus === "review"
        ? `<small class="reauction-match-note review" title="${esc(record.reauctionMatchReason || "存在相似再拍拍品，需人工确认")}">⚠ 再拍待确认${Number(record.reauctionMatchSimilarity) > 0 ? ` ${Math.round(Number(record.reauctionMatchSimilarity) * 100)}%` : ""}</small>`
        : "";
    return `<td class="status-cell"><span class="chip ${statusChipClass(status)}">${esc(status)}</span><small>${esc(payment + deadline)}</small>${reauctionMatch}</td>`;
  }

  function renderRecordRow(record, child = false) {
    const gaps = missing(record);
    const carrier = record.carrier || carrierFor(record);
    const buyerName = record.buyerName || record.recipientName || "";
    const buyerPhone = record.buyerPhone || record.recipientPhone || "";
    const recipientDetail = record.recipientName && record.recipientName !== buyerName ? `收件人：${record.recipientName}` : (record.recipientPhone && record.recipientPhone !== buyerPhone ? `收件手机：${record.recipientPhone}` : "");
    const settlementDetail = isSettlementEligible(record)
      ? `${record.settlementAmount ? currency.format(record.settlementAmount) : "待计算"} · ${Number(record.commissionAmount || 0) < 0 ? "返佣" : "佣金"} ${formatSettlementAdjustment(record.commissionAmount || 0)}`
      : "";
    const deliveryCode = record.outboundTrackingNumber || record.pickupCode || "";
    const deliveryHint = record.outboundTrackingNumber
      ? `${record.mxiqiShippingStatus === "filled" ? "麦稀奇已回填" : "出库单号待回填"} · ${addressStatusLabel(record.addressStatus)}`
      : record.pickupCode ? "模拟取件码，不可寄件" : shippingStageLabel(record);
    const consignor = consignorDirectoryEntry(record);
    const resultPending = isAuctionResultPending(record);
    return `<tr class="${state.selected.has(record.id) ? "selected-row" : ""}${child ? " package-child-row" : ""}">
      <td class="select-column"><input type="checkbox" data-select="${esc(record.id)}" ${state.selected.has(record.id) ? "checked" : ""}></td>
      <td class="role-cell"><span class="role-label">买家 / 发货对象</span><b class="${buyerName ? "" : "muted"}">${esc(buyerName || (resultPending ? "成交结果待同步" : Number(record.finalPrice) > 0 ? "待同步买家" : "尚未成交"))}</b><small>${esc(buyerPhone || (resultPending ? "同步后显示买家" : Number(record.finalPrice) > 0 ? "买家手机号待同步" : "—"))}</small>${recipientDetail ? `<small>${esc(recipientDetail)}</small>` : ""}</td>
      <td><div class="lot-cell ${child ? "package-child-lot" : ""}"><span>${record.lot}</span><div><b>${esc(record.itemName)}</b><small>${esc(record.projectName || record.primaryCategory || "未设置项目")}</small></div></div></td>
      <td class="role-cell"><span class="role-label">送拍人 / 结算对象</span>${consignor.key ? `<button class="consignor-link" type="button" data-customer-open="${esc(consignor.key)}"><b>${esc(consignor.wechat || "待补")}</b><small>${esc(consignor.phone || record.sellerPhone || "送拍人手机号待补")}</small></button>` : `<b class="muted">${esc(consignor.wechat || "待补")}</b><small>${esc(consignor.phone || record.sellerPhone || "送拍人手机号待补")}</small>`}<small>${esc(record.trackingNumber || "未填寄入快递单号")}</small></td>
      ${renderStatusCell(record)}
      <td><b>${esc(auctionPeriod(record))}</b><small>${esc(record.projectName || record.auctionHouse || "项目待补")} · ${esc(record.auctionAt || "待设置时间")}</small></td>
      <td><b class="money">${Number(record.finalPrice) > 0 ? currency.format(record.finalPrice) : resultPending ? "待同步" : "待拍"}</b>${promotionBadges(record)}</td>
      <td>${gaps.length ? `<button class="chip warning" data-action="edit" data-id="${esc(record.id)}" title="${esc(gaps.join("、"))}">缺 ${gaps.length} 项</button>` : '<span class="chip success">完整</span>'}</td>
      <td><span class="carrier ${carrier}">${carrierLabel(carrier)}</span><small>${logisticsLabel(record.logisticsStatus)} · ${esc(shippingStageLabel(record))}</small></td>
      <td>${deliveryCode ? `<code>${esc(deliveryCode)}</code>` : '<span class="muted">—</span>'}<small>${esc(deliveryHint)}</small></td>
      <td>${record.settled ? '<span class="chip success">已结账</span>' : '<span class="chip neutral">未结账</span>'}<small>${esc(settlementDetail)}</small><small>${esc(record.promotion || "")}</small>${promotionBadges(record)}</td>
      <td><div class="row-actions">${resultPending ? `<button data-action="sync-result" data-id="${esc(record.id)}">同步成交</button>` : ""}<button data-action="edit" data-id="${esc(record.id)}">编辑</button><button data-action="pickup" data-id="${esc(record.id)}" ${Number(record.finalPrice) <= 0 ? "disabled" : ""}>取件</button><button data-action="manual" data-id="${esc(record.id)}">录码</button><button data-action="shipping" data-id="${esc(record.id)}" ${!isShippingCandidate(record) ? "disabled" : ""}>发货</button><button data-action="toggle-settle" data-id="${esc(record.id)}" ${!isSettlementEligible(record) ? "disabled" : ""}>${record.settled ? "撤销" : "结账"}</button></div></td>
    </tr>`;
  }

  function renderPackageRow(group) {
    const records = group.records;
    const expanded = state.expandedPackages.has(group.key);
    const selectable = records;
    const allSelected = selectable.length > 0 && selectable.every((record) => state.selected.has(record.id));
    const total = records.reduce((sum, record) => sum + Number(record.finalPrice || 0), 0);
    const totalCommission = records.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0);
    const totalSettlement = records.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0);
    const lots = records.map((record) => record.lot).join("、");
    const orderId = MxiqiPackages.sameValue(records, "mxiqiOrderId");
    const project = MxiqiPackages.sameValue(records, "projectName") || "多个拍场项目";
    const buyerName = MxiqiPackages.sameValue(records, "buyerName") || MxiqiPackages.sameValue(records, "recipientName");
    const buyerPhone = MxiqiPackages.sameValue(records, "buyerPhone") || MxiqiPackages.sameValue(records, "recipientPhone");
    const sellerMap = new Map();
    records.forEach((record) => { const entry = consignorDirectoryEntry(record); if (entry.key) sellerMap.set(entry.key, entry); });
    const sellers = [...sellerMap.values()];
    const sellerSummary = sellers.length === 1 ? sellers[0].wechat : sellers.length ? `${sellers.length} 位送拍人` : "送拍人待匹配";
    const carrierValues = [...new Set(records.map((record) => record.carrier || carrierFor(record)))];
    const carrier = carrierValues.length === 1 ? carrierValues[0] : "pending";
    const stageValues = [...new Set(records.map(shippingStageLabel))];
    const statusValues = [...new Set(records.map(recordStatus))];
    const paymentValues = [...new Set(records.map((record) => record.paymentStatus).filter(Boolean))];
    const deliveryCode = MxiqiPackages.sameValue(records, "outboundTrackingNumber") || MxiqiPackages.sameValue(records, "pickupCode");
    const gapCount = records.reduce((sum, record) => sum + missing(record).length, 0);
    const settledCount = records.filter((record) => record.settled).length;
    const canShipPackage = records.every(isShippingCandidate);
    const childRows = expanded ? `${records.map((record) => renderRecordRow(record, true)).join("")}<tr class="package-separator-row" aria-hidden="true"><td colspan="12"></td></tr>` : "";
    return `<tr class="package-summary-row${allSelected ? " selected-row" : ""}">
      <td class="select-column"><input type="checkbox" data-package-select="${esc(group.key)}" ${allSelected ? "checked" : ""} ${selectable.length ? "" : "disabled"}></td>
      <td class="role-cell"><span class="role-label">买家 / 发货对象</span><b class="${buyerName ? "" : "muted"}">${esc(buyerName || "买家待同步")}</b><small>${esc(buyerPhone || "买家手机号待同步")}</small></td>
      <td><div class="package-heading"><button class="package-toggle" type="button" data-package-toggle="${esc(group.key)}" aria-expanded="${expanded}">${expanded ? "−" : "+"}</button><div><b>合并包裹 · ${records.length} 件</b><small>Lot ${esc(lots)}</small></div></div></td>
      <td class="role-cell"><span class="role-label">送拍人 / 结算对象</span>${sellers.length === 1 ? `<button class="consignor-link" type="button" data-customer-open="${esc(sellers[0].key)}"><b>${esc(sellerSummary)}</b><small>${esc(sellers[0].phone || "送拍人手机号待补")}</small></button>` : `<b class="${sellers.length ? "" : "muted"}">${esc(sellerSummary)}</b><small>展开后按拍品查看</small>`}</td>
      <td class="status-cell"><span class="chip ${statusValues.length === 1 ? statusChipClass(statusValues[0]) : "neutral"}">${esc(statusValues.length === 1 ? statusValues[0] : `${statusValues.length} 种状态`)}</span><small>${esc(paymentValues.length ? `付款：${paymentValues.join("、")}` : "付款状态未同步")}</small></td>
      <td><b>${esc(project)}</b><small>${orderId ? `订单 ${esc(orderId)}` : "同一出库运单"}</small></td>
      <td><b class="money">${currency.format(total)}</b><small>合计 ${records.length} 件 · 均价 ${currency.format(total / records.length)}</small></td>
      <td>${gapCount ? `<button type="button" class="chip warning" data-package-edit="${esc(group.key)}" title="打开整包补资料；公共资料同步到 ${records.length} 件拍品">共缺 ${gapCount} 项 · 整包补资料</button>` : '<span class="chip success">全部完整</span>'}</td>
      <td><span class="carrier ${carrier}">${carrierValues.length === 1 ? carrierLabel(carrier) : "混合"}</span><small>${esc(stageValues.length === 1 ? stageValues[0] : `${stageValues.length} 种发货状态`)}</small></td>
      <td>${deliveryCode ? `<code>${esc(deliveryCode)}</code>` : '<span class="muted">—</span>'}<small>${deliveryCode ? "整包共用单号" : "等待整包下单"}</small></td>
      <td>${settledCount === records.length ? '<span class="chip success">整包已结账</span>' : `<span class="chip neutral">${settledCount}/${records.length} 已结账</span>`}<small>${currency.format(totalSettlement)} · ${totalCommission < 0 ? "返佣" : "佣金"} ${formatSettlementAdjustment(totalCommission)}</small></td>
      <td><div class="row-actions package-actions"><button data-package-toggle="${esc(group.key)}">${expanded ? "收起" : "展开"}</button><button data-package-shipping="${esc(group.key)}" ${canShipPackage ? "" : "disabled"}>整包发货</button></div></td>
    </tr>${childRows}`;
  }

  function settlementGroups(records) {
    const groups = new Map();
    const directory = new Map(customerDirectoryEntries().map((entry) => [entry.key, entry]));
    records.forEach((record) => {
      const missingSeller = !MxiqiWorkflow.hasConsignorName(record.sellerWechat);
      const identity = missingSeller ? {key:"__missing__",wechat:"待补送拍人",phone:""} : consignorIdentity(record);
      const profile = directory.get(identity.key);
      const seller = profile?.wechat || identity.wechat;
      const phone = profile?.phone || identity.phone || normalizeCustomerPhone(record.sellerPhone) || "";
      const key = identity.key;
      if (!groups.has(key)) groups.set(key, {key,seller,phone,records:[]});
      groups.get(key).records.push(record);
    });
    return [...groups.values()].sort((a, b) => a.seller.localeCompare(b.seller, "zh-CN"));
  }

  function renderTableHeader(itemCount = 0) {
    if (state.stage === "preauction") {
      $("#records-head").innerHTML = '<tr><th>送拍人</th><th>Lot</th><th>拍品名称</th><th>拍卖期数</th></tr>';
      return;
    }
    if (state.stage === "settlement") {
      $("#records-head").innerHTML = `<tr><th class="select-column"><input id="select-all" type="checkbox" aria-label="全选当前结算记录"></th><th>送拍人 / 手机号</th><th>拍品 / Lot（${itemCount} 件）</th><th>拍卖期数与时间</th><th>成交总额</th><th>优惠标识</th><th>佣金 / 返佣</th><th>应结金额</th><th>结账进度</th><th>操作</th></tr>`;
      return;
    }
    $("#records-head").innerHTML = `<tr><th class="select-column"><input id="select-all" type="checkbox" aria-label="全选当前记录"></th><th>买家 / 收件人</th><th>Lot / 拍品（${itemCount} 件）</th><th>送拍人</th><th>拍品状态</th><th>拍卖期数与时间</th><th>最终价格</th><th>资料</th><th>物流</th><th>取件码 / 运单</th><th>结算</th><th>操作</th></tr>`;
  }

  function renderPreauctionRow(record) {
    const consignor = consignorDirectoryEntry(record);
    return `<tr class="preauction-row"><td>${consignor.key ? `<button class="consignor-link" type="button" data-customer-open="${esc(consignor.key)}"><b>${esc(consignor.wechat || "待补送拍人")}</b><small>${esc(consignor.phone || "手机号待补")}</small></button>` : `<b>${esc(consignor.wechat || "待补送拍人")}</b><small>${esc(consignor.phone || "手机号待补")}</small>`}</td><td><span class="preauction-lot">${esc(record.lot)}</span></td><td><button class="preauction-item-button" type="button" data-action="edit" data-id="${esc(record.id)}">${esc(record.itemName)}</button></td><td><b>${esc(auctionPeriod(record))}</b></td></tr>`;
  }

  function settlementBadgeSummary(records) {
    const birthdayCount = records.filter((record) => birthdayMonthFor(record) && birthdayMonthFor(record) === auctionMonth(record)).length;
    const boxCount = records.filter(hasAppliedBoxRebate).length;
    const returnCount = records.filter(isReturnRecord).length;
    const unpaidReturnCount = records.filter((record) => record.unpaidReturn).length;
    const badges = [];
    if (birthdayCount) badges.push(`<span class="chip birthday">生日 ${birthdayCount} 件</span>`);
    if (boxCount) {
      const values = [...new Set(records.filter(hasAppliedBoxRebate).map((record) => Math.abs(Number(commissionPlan(record).value || 0))))].sort((a, b) => a - b);
      badges.push(`<span class="chip box-rebate">NP优惠 ${values.join("% / ")}% · ${boxCount} 件</span>`);
    }
    if (unpaidReturnCount) badges.push(`<span class="chip neutral">未付款拖回扣费 · ${unpaidReturnCount} Lot</span>`);
    if (returnCount > unpaidReturnCount) badges.push(`<span class="chip neutral">其他拖回扣费 · ${returnCount - unpaidReturnCount} Lot</span>`);
    return badges.length ? `<div class="promotion-badges">${badges.join("")}</div>` : '<span class="muted">无特殊标识</span>';
  }

  function renderSettlementItemRow(record) {
    const gateReady = settlementGate().ready;
    return `<tr class="settlement-child-row ${state.selected.has(record.id) ? "selected-row" : ""}">
      <td class="select-column"><input type="checkbox" data-select="${esc(record.id)}" ${state.selected.has(record.id) ? "checked" : ""}></td>
      <td><small>同上</small></td>
      <td><b>Lot ${esc(record.lot)}</b><small>${esc(record.itemName)}</small></td>
      <td><b>${esc(auctionPeriod(record))}</b><small>${esc(record.projectName || record.auctionHouse || "项目待补")} · ${esc(record.auctionAt || record.platformOrderDate || "时间待补")}</small></td>
      <td><b class="money">${currency.format(settlementGross(record))}</b><small>${esc(recordStatus(record))}${isReturnRecord(record) ? " · 不计成交额" : ""}</small></td>
      <td>${promotionBadges(record) || '<span class="muted">—</span>'}<small>${esc(record.promotion || "普通规则")}</small></td>
      <td><b>${formatSettlementAdjustment(record.commissionAmount || 0)}</b></td>
      <td><b class="money">${currency.format(record.settlementAmount || 0)}</b></td>
      <td>${record.settled ? '<span class="chip success">已结账</span>' : '<span class="chip neutral">未结账</span>'}</td>
      <td><div class="row-actions"><button data-action="edit" data-id="${esc(record.id)}">编辑</button><button data-action="toggle-settle" data-id="${esc(record.id)}" ${!record.settled && !gateReady ? "disabled" : ""}>${record.settled ? "撤销" : "结账"}</button></div></td>
    </tr>`;
  }

  function renderSettlementGroupRow(group) {
    const records = group.records;
    const expanded = state.expandedSettlements.has(group.key);
    const allSelected = records.length > 0 && records.every((record) => state.selected.has(record.id));
    const gross = records.reduce((sum, record) => sum + settlementGross(record), 0);
    const commission = records.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0);
    const payable = records.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0);
    const settledCount = records.filter((record) => record.settled).length;
    const allSettled = settledCount === records.length;
    const gateReady = settlementGate().ready;
    const lots = records.map((record) => record.lot).join("、");
    const periods = [...new Set(records.map(auctionPeriod).filter(Boolean))].join("、") || "期数待补";
    const dates = [...new Set(records.map((record) => datePart(record.auctionAt || record.platformOrderDate)).filter(Boolean))].join("、") || "时间待补";
    const children = expanded ? records.map(renderSettlementItemRow).join("") : "";
    return `<tr class="settlement-group-row ${allSelected ? "selected-row" : ""}">
      <td class="select-column"><input type="checkbox" data-settlement-select="${esc(group.key)}" ${allSelected ? "checked" : ""}></td>
      <td class="settlement-seller"><button class="consignor-link" type="button" data-customer-open="${esc(group.key)}"><b>${esc(group.seller)}</b><small>${esc(group.phone || "送拍人手机号待补")}</small></button></td>
      <td class="settlement-lots"><b>${records.length} 件 · Lot ${esc(lots)}</b><small>${esc(records.map((record) => record.itemName).join("；"))}</small></td>
      <td><b>${esc(periods)}</b><small>${esc(dates)}</small></td>
      <td><b class="money">${currency.format(gross)}</b></td>
      <td>${settlementBadgeSummary(records)}</td>
      <td><b>${currency.format(commission)}</b></td>
      <td><b class="money">${currency.format(payable)}</b></td>
      <td class="${allSettled ? "settlement-queue-complete" : ""}"><span class="settlement-queue-progress">${settledCount}/${records.length}</span><small>${allSettled ? "全部已结账" : `${records.length - settledCount} 件待结账`}</small></td>
      <td><div class="row-actions"><button data-settlement-toggle="${esc(group.key)}">${expanded ? "收起" : "展开"}</button><button data-settlement-settle="${esc(group.key)}" ${allSettled || !gateReady ? "disabled" : ""}>整组结账</button></div></td>
    </tr>${children}`;
  }

  function render() {
    const records = state.records;
    if (state.stage === "settlement"
      && state.settlementView === "unsettled"
      && !settlementRecords().some((record) => !record.settled)) state.settlementView = "all";
    renderFilterOptions();
    $("#metric-total").textContent = records.length;
    $("#metric-unpaid").textContent = records.filter((item) => item.paymentStatus === "待付款").length;
    $("#metric-missing").textContent = records.filter((item) => missing(item).length).length;
    $("#metric-pickup").textContent = records.filter((item) => Number(item.finalPrice) > 0 && !item.pickupCode).length;
    $("#metric-shipping").textContent = MxiqiPackages.groupRecords(records.filter((item) => isShippingCandidate(item) && shippingStage(item) !== "completed")).length;
    $("#metric-settlement").textContent = records.filter((item) => isSettlementEligible(item) && !item.settled).length;
    $("#metric-amount").textContent = `成交额 ${currency.format(records.reduce((sum, item) => sum + settlementGross(item), 0))}`;
    $$('[data-stage]').forEach((button) => button.classList.toggle("selected", button.dataset.stage === state.stage));
    $$('.nav-item[data-stage]').forEach((button) => button.classList.toggle("active", button.dataset.stage === state.stage));

    const panelCopy = state.stage === "reauction"
      ? ["拖回再拍库", "集中保留待重新上拍拍品，编辑后可继续沿用原送拍与结算资料"]
      : state.stage === "preauction"
        ? ["拍前核对", "按送拍人核对本期上拍拍品，只保留 Lot、拍品名称和拍卖期数"]
      : state.stage === "unpaid"
        ? ["待付款拍品", "来自麦稀奇待付款订单；超时项目会单独标红提醒"]
        : state.stage === "settlement"
          ? state.settlementView === "unsettled"
            ? ["未结账送拍人", "仅显示仍需结账的送拍人和拍品；可展开查看 Lot，并直接整组结账"]
            : ["结算复核", "按送拍人汇总本期成交拍品、佣金和应结金额"]
        : ["拍品明细", "平台字段、送拍资料、物流与结算状态集中复核"];
    $("#panel-title").textContent = panelCopy[0];
    $("#panel-subtitle").textContent = panelCopy[1];

    const visible = visibleRecords();
    renderTableHeader(visible.length);
    const packageGroups = ["settlement","reauction","preauction"].includes(state.stage) ? [] : MxiqiPackages.groupRecords(visible);
    const settlementList = state.stage === "settlement" ? settlementGroups(visible) : [];
    const mergedCount = packageGroups.filter((group) => group.isPackage).length;
    $("#result-count").textContent = state.stage === "settlement"
      ? `${state.settlementView === "unsettled" ? "未结账：" : ""}${settlementList.length} 位送拍人 · ${visible.length} 件拍品`
      : state.stage === "preauction" ? `${consignorCount(visible)} 位送拍人 · ${visible.length} 件待核对`
      : state.stage === "reauction" ? `${visible.length} 件待重新上拍`
      : mergedCount ? `${packageGroups.length} 个包裹 · ${visible.length} 件拍品` : `${visible.length} 条结果`;
    const selectable = visible;
    if ($("#select-all")) $("#select-all").checked = selectable.length > 0 && selectable.every((item) => state.selected.has(item.id));
    const selectedCount = state.selected.size;
    const selectedRecords = state.records.filter((item) => state.selected.has(item.id));
    const selectedPickupCount = selectedRecords.filter((item) => Number(item.finalPrice) > 0).length;
    const selectedShippingCount = selectedRecords.filter(isShippingCandidate).length;
    $("#selection-count").hidden = !selectedCount;
    $("#batch-pickup").hidden = !selectedPickupCount || ["settlement","reauction","preauction"].includes(state.stage);
    $("#batch-shipping").hidden = !selectedShippingCount || ["settlement","reauction","preauction"].includes(state.stage);
    $("#batch-delete").hidden = !selectedCount || state.stage === "preauction";
    $("#batch-settle").hidden = !selectedCount || state.stage !== "settlement";
    $("#batch-settle").disabled = state.stage === "settlement" && !settlementGate().ready;
    $("#clear-selection").hidden = !selectedCount;
    $("#selection-count").textContent = `已选 ${selectedCount} 条`;
    renderShippingSummary();
    renderSettlementSummary();
    renderReauctionSummary();
    renderPreauctionSummary();
    renderCollectorPanel();

    const body = $("#records-body");
    if (!visible.length) {
      const message = state.stage === "reauction" ? "拖回再拍库暂无拍品。把拍品状态设为“拖回/再拍”后会自动进入这里。" : state.stage === "preauction" ? "当前筛选下没有待拍或上拍拍品。" : "没有匹配的拍品，调整筛选条件试试。";
      body.innerHTML = `<tr><td colspan="${state.stage === "preauction" ? 4 : state.stage === "settlement" ? 10 : 12}" class="empty-state">${message}</td></tr>`;
      return;
    }

    body.innerHTML = state.stage === "settlement"
      ? settlementList.map(renderSettlementGroupRow).join("")
      : state.stage === "preauction" ? visible.map(renderPreauctionRow).join("")
      : state.stage === "reauction" ? visible.map((record) => renderRecordRow(record)).join("")
      : packageGroups.map((group) => group.isPackage ? renderPackageRow(group) : renderRecordRow(group.records[0])).join("");
  }

  function previewCommission() {
    const data = new FormData(editForm);
    const temporary = {
      sellerWechat: String(data.get("sellerWechat") || "").trim(),
      itemName: String(data.get("itemName") || "").trim(),
      birthdayMonth: Number(data.get("birthdayMonth") || 0),
      auctionAt: String(data.get("auctionAt") || ""),
      finalPrice: Number(data.get("finalPrice") || 0),
      finalOutcome: String(data.get("finalOutcome") || "成交"),
      commissionOverrideType: String(data.get("commissionOverrideType") || ""),
      commissionOverrideValue: Number(data.get("commissionOverrideValue") || 0),
      commissionOverrideNote: String(data.get("commissionOverrideNote") || "").trim(),
      settlementAdjustment: Number(data.get("settlementAdjustment") || 0),
    };
    const plan = commissionPlan(temporary);
    const gross = Math.max(0, temporary.finalPrice);
    const adjustment = roundMoney(temporary.settlementAdjustment);
    editForm.elements.commissionAmount.value = gross ? plan.amount : 0;
    editForm.elements.settlementAmount.value = gross ? roundMoney(gross - plan.amount + adjustment) : adjustment;
    editForm.elements.profit.value = gross ? roundMoney(plan.amount - adjustment) : roundMoney(-adjustment);
    editForm.elements.promotion.value = [gross ? plan.label : "", adjustment ? `额外${adjustment > 0 ? "加款" : "扣款"} ${currency.format(Math.abs(adjustment))}` : ""].filter(Boolean).join(" · ");
  }

  function updateCommissionOverrideControls() {
    const manual = ["percent", "fixed"].includes(editForm.elements.commissionOverrideType.value);
    editForm.elements.commissionOverrideValue.disabled = !manual;
    editForm.elements.commissionOverrideNote.disabled = !manual;
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
      if (element.name === "sellerPhone") value = record.sellerPhone || state.customers[record.sellerWechat]?.phone || "";
      if (element.type === "checkbox") element.checked = Boolean(value);
      else element.value = value ?? "";
    });
    if (record.relisted && record.finalOutcome === "待拍") editForm.elements.returnDisposition.value = "上拍";
    updateCommissionOverrideControls();
    previewCommission();
    editDialog.showModal();
  }

  function setShippingStep(selector, status) {
    const step = $(selector);
    step.classList.remove("done", "current");
    if (status) step.classList.add(status);
  }

  function populateShippingForm(record) {
    const members = activeShippingRecords();
    [...PACKAGE_SHARED_FIELDS, ...PACKAGE_ADDRESS_FIELDS, "outboundTrackingNumber", "pickupCode", "logisticsOrderId"].forEach((name) => {
      shippingForm.elements[name].value = record[name] || "";
    });
    shippingForm.elements.shippingCarrier.value = record.shippingCarrier || record.carrier || carrierFor(record);
    if (members.length > 1) {
      [...PACKAGE_SHARED_FIELDS, ...PACKAGE_ADDRESS_FIELDS].forEach((name) => {
        const commonValue = MxiqiPackages.sameValue(members, name);
        shippingForm.elements[name].value = commonValue;
      });
    }
    if (members.length && members.every((item) => item.relisted && item.finalOutcome === "待拍")) shippingForm.elements.returnDisposition.value = "上拍";
    shippingForm.elements.shippingGoodsName.value ||= state.settings.defaultGoodsName || "章牌";
    shippingForm.elements.shipmentWeightKg.value ||= Number(state.settings.defaultPackageWeightKg || 0.8);
  }

  function renderShippingDialog(record, populate = true) {
    if (populate) populateShippingForm(record);
    const members = activeShippingRecords();
    const packageReady = members.length > 0 && members.every(isShippingCandidate);
    const paidCount = members.filter(isShippingCandidate).length;
    const addressReviewed = members.length > 0 && members.every((item) => item.addressStatus === "reviewed");
    const commonWaybill = MxiqiPackages.sameValue(members, "outboundTrackingNumber");
    const waybillConflict = members.some((item) => item.outboundTrackingNumber) && !commonWaybill;
    const addressGaps = addressMissing(record);
    const hasWaybill = Boolean(commonWaybill);
    const filled = members.length > 0 && members.every((item) => item.mxiqiShippingStatus === "filled");
    if (hasWaybill) shippingForm.elements.outboundTrackingNumber.value = commonWaybill;
    shippingForm.elements.pickupCode.value = MxiqiPackages.sameValue(members, "pickupCode") || record.pickupCode || "";
    shippingForm.elements.logisticsOrderId.value = MxiqiPackages.sameValue(members, "logisticsOrderId") || record.logisticsOrderId || "";
    $("#shipping-title").textContent = members.length > 1 ? `合并包裹 · ${members.length} 件拍品` : `Lot ${record.lot} · ${record.itemName}`;
    const queueTotal = state.shippingQueueKeys.length;
    const hasNextPackage = queueTotal > 1 && state.shippingQueueIndex < queueTotal - 1;
    $("#shipping-queue-note").hidden = queueTotal <= 1;
    $("#shipping-queue-note").textContent = queueTotal > 1 ? `批量发货 ${state.shippingQueueIndex + 1} / ${queueTotal}` : "";
    $("#shipping-next-package").hidden = !hasNextPackage;
    $("#shipping-next-package").textContent = hasNextPackage ? `下一个包裹（${state.shippingQueueIndex + 2}/${queueTotal}）` : "下一个包裹";
    $("#shipping-package-summary").textContent = `本包裹 ${members.length || 1} 件拍品${members.length > 1 ? ` · Lot ${members.map((item) => item.lot).join("、")}` : ""}`;
    $("#shipping-common-badge").textContent = members.length > 1 ? `${members.length} 件同步生效` : "当前拍品生效";
    $("#shipping-common-note").textContent = members.length > 1
      ? `这里修改的买家、拍场、付款、特殊处理、收件地址和物流资料会同步到本包裹 ${members.length} 件拍品；Lot、拍品名称、送拍人和寄入快递仍按单件保留。`
      : "这里修改买家、拍场、付款、特殊处理、收件地址和物流资料；Lot、拍品名称、送拍人和寄入快递请返回主表编辑。";
    $("#shipping-package-list").innerHTML = members.map((item) => `<div class="shipping-package-item"><span>Lot ${item.lot}</span><b>${esc(item.itemName)}</b><small>${currency.format(item.finalPrice || 0)}</small></div>`).join("");
    $("#shipping-payment-state").textContent = packageReady ? `${members.length} 件均已付款，可整包发货` : `${paidCount}/${members.length} 件满足发货条件`;
    $("#shipping-address-state").textContent = addressReviewed ? "整包地址已二审" : addressStatusLabel(record.addressStatus);
    $("#shipping-order-state").textContent = waybillConflict ? "包裹内单号不一致，需检查" : hasWaybill ? `${carrierLabel(record.shippingCarrier)} · 真实单号已录入` : addressReviewed ? "可以提交或人工录入" : "等待地址二审";
    $("#shipping-fill-state").textContent = filled ? "已确认回填" : hasWaybill ? "复制后待确认" : "尚无单号";
    $("#shipping-address-badge").textContent = addressReviewed ? "整包地址已二审" : addressStatusLabel(record.addressStatus);
    setShippingStep("#shipping-step-payment", packageReady ? "done" : "current");
    setShippingStep("#shipping-step-address", addressReviewed ? "done" : packageReady ? "current" : "");
    setShippingStep("#shipping-step-order", hasWaybill ? "done" : addressReviewed ? "current" : "");
    setShippingStep("#shipping-step-fill", filled ? "done" : hasWaybill ? "current" : "");

    const message = $("#shipping-address-message");
    message.className = "address-review-message";
    if (addressReviewed) {
      message.classList.add("success");
      message.textContent = `整包 ${members.length} 件共用该地址，二次审核已通过。下单前仍请对照麦稀奇原始订单确认一次。`;
    } else if (addressGaps.length) {
      message.classList.add("error");
      message.textContent = `还需补充或修正：${addressGaps.join("、")}。`;
    } else {
      message.textContent = "拆分结果只作参考，请逐项核对后点击“确认二次审核无误”。";
    }

    const addressLocked = hasWaybill || waybillConflict;
    ["recipientRaw","recipientName","recipientPhone","addressProvince","addressCity","addressDistrict","addressDetail"].forEach((name) => { shippingForm.elements[name].disabled = addressLocked; });
    shippingForm.elements.shippingCarrier.disabled = addressLocked;
    $("#shipping-split-address").disabled = addressLocked;
    $("#shipping-review-address").disabled = addressLocked;
    $("#shipping-create-order").disabled = !packageReady || !addressReviewed || hasWaybill || waybillConflict || !logisticsCanCreate(shippingForm.elements.shippingCarrier.value);
    $("#shipping-save-result").disabled = !packageReady || !addressReviewed || filled || waybillConflict;
    $("#shipping-copy-waybill").disabled = !hasWaybill;
    $("#shipping-copy-pickup-code").disabled = !record.pickupCode;
    $("#shipping-confirm-fill").disabled = !hasWaybill || filled;
    $("#shipping-confirm-fill").textContent = filled ? "麦稀奇已回填" : "确认麦稀奇已回填";
    $("#shipping-order-note").textContent = waybillConflict
      ? "包裹内已有不同运单号，已停止整包操作；请展开明细人工核对。"
      : filled
      ? `真实运单号 ${record.outboundTrackingNumber} 已标记为麦稀奇回填完成。`
      : hasWaybill
        ? `已保存真实运单号 ${record.outboundTrackingNumber}。请复制到麦稀奇，粘贴后再确认回填。`
        : !packageReady
          ? "包裹内仍有拍品未满足发货条件，暂不能整包发货。"
          : !addressReviewed
            ? "未完成地址二审，暂不能下单。"
            : logisticsCanCreate(shippingForm.elements.shippingCarrier.value)
              ? `地址已二审，可将 ${members.length} 件拍品合并后向${carrierLabel(shippingForm.elements.shippingCarrier.value)}提交真实下单。`
              : `地址已二审。${carrierLabel(shippingForm.elements.shippingCarrier.value)}接口尚未配置，请打开物流平台下单后录入真实运单号。`;
    renderLogisticsConnection(shippingForm.elements.shippingCarrier.value);
  }

  function openShippingPackage(key, preserveQueue = false) {
    const records = recordsForPackageKey(key);
    if (!records.length) return;
    if (!preserveQueue) {
      state.shippingQueueKeys = [];
      state.shippingQueueIndex = 0;
    }
    state.shippingIds = records.map((record) => record.id);
    state.shippingId = records[0].id;
    shippingForm.reset();
    renderShippingDialog(records[0]);
    shippingDialog.showModal();
    if (!logisticsRuntime.checked) checkLogisticsConnection();
  }

  function openShipping(id) {
    const record = state.records.find((item) => item.id === id);
    if (!record) return;
    openShippingPackage(MxiqiPackages.packageKey(record));
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

  function normalizeConsignmentAsset(asset) {
    if (asset.assetType !== "consignment") return asset;
    const record = state.records.find((item) => item.id === asset.recordStorageId || item.id === asset.matchedRecordId);
    const importedConsignment = asset.sourceSheet === "寄存" || /寄存记录/.test(String(asset.sourceFile || ""));
    const buyerName = asset.buyerName || record?.buyerName || record?.recipientName || (importedConsignment ? asset.sellerWechat : "") || "买家待补";
    const buyerPhone = asset.buyerPhone || record?.buyerPhone || record?.recipientPhone || (importedConsignment ? asset.sellerPhone : "") || asset.recipientPhone || "";
    return {
      ...asset,
      personRole:"buyer",
      buyerName,
      buyerPhone:MxiqiAssets.normalizePhone(buyerPhone),
      recipientName:asset.recipientName || record?.recipientName || "",
      recipientPhone:asset.recipientPhone || record?.recipientPhone || MxiqiAssets.normalizePhone(buyerPhone),
      recipientRaw:asset.recipientRaw || asset.address || record?.recipientRaw || "",
      address:asset.address || asset.recipientRaw || record?.recipientRaw || "",
      auctionNumber:asset.auctionNumber || (record ? auctionPeriod(record) : ""),
      auctionAt:asset.auctionAt || record?.auctionAt || "",
    };
  }

  function applyAssetMatches() {
    state.assets.forEach((asset) => {
      if (asset.assetType !== "consignment") return;
      const matchedRecord = ["auto", "manual"].includes(asset.matchStatus) && asset.matchedRecordId
        ? state.records.find((item) => item.id === asset.matchedRecordId)
        : null;
      const orderRecord = asset.consignmentOrderNo
        ? state.records.find((item) => String(item.mxiqiOrderId || "") === String(asset.consignmentOrderNo))
        : null;
      const record = matchedRecord || orderRecord;
      if (!record || asset.assetType !== "consignment") return;
      const buyerName = record.buyerName || asset.buyerName || (asset.personRole === "buyer" ? asset.sellerWechat : "");
      const buyerPhone = record.buyerPhone || asset.buyerPhone || (asset.personRole === "buyer" ? asset.sellerPhone : "") || asset.recipientPhone;
      const recipientRaw = record.recipientRaw || asset.recipientRaw || asset.address || "";
      const recipientPhone = record.recipientPhone || asset.recipientPhone || buyerPhone;
      Object.assign(asset, {
        personRole:"buyer",
        buyerName,
        buyerPhone,
        recipientName:record.recipientName || asset.recipientName || "",
        recipientPhone,
        recipientRaw,
        address:recipientRaw,
        auctionNumber:auctionPeriod(record),
        auctionAt:record.auctionAt || record.platformAuctionAt || "",
        projectName:record.projectName || asset.projectName || "",
        lot:asset.lot || String(record.lot || ""),
        mxiqiOrderId:record.mxiqiOrderId || asset.consignmentOrderNo || "",
      });
      if (!record.buyerName && buyerName && buyerName !== "手机号用户") record.buyerName = buyerName;
      if (!record.buyerPhone && buyerPhone) record.buyerPhone = buyerPhone;
      if (!record.recipientName && asset.recipientName) record.recipientName = asset.recipientName;
      if (!record.recipientPhone && recipientPhone) record.recipientPhone = recipientPhone;
      if (!record.recipientRaw && recipientRaw) Object.assign(record, splitRecipientAddress(recipientRaw));
      if (!record.consignmentOrderNo && asset.consignmentOrderNo) record.consignmentOrderNo = asset.consignmentOrderNo;
    });
  }

  function rematchAssetsAndApply() {
    state.assets = MxiqiAssets.rematchAssets(state.assets, state.records);
    applyAssetMatches();
  }

  function syncStoredAssetForRecord(record) {
    const index = state.assets.findIndex((asset) => asset.recordStorageId === record.id);
    if (record.returnDisposition !== "寄存") {
      if (index >= 0) state.assets.splice(index, 1);
      return;
    }
    const priorAsset = index >= 0 ? state.assets[index] : null;
    const storedAt = priorAsset?.firstImportedAt || priorAsset?.importedAt || new Date().toISOString();
    const storageOrder = Number(priorAsset?.storageOrder) > 0
      ? Number(priorAsset.storageOrder)
      : Math.max(0, ...state.assets.map((asset) => Number(asset.storageOrder) || 0)) + 1;
    const storedAsset = {
      ...(index >= 0 ? state.assets[index] : {}),
      id: index >= 0 ? state.assets[index].id : `stored-${record.id}`,
      assetKey: `record-storage:${record.id}`,
      assetType: "consignment",
      sourceFile: "拍品工作台",
      sourceSheet: "寄存流转",
      sourceRow: record.lot || "自动",
      importedAt:priorAsset?.importedAt || storedAt,
      firstImportedAt:storedAt,
      storageOrder,
      itemName: record.itemName,
      sellerWechat: record.sellerWechat || "待补送拍人",
      sellerPhone: record.sellerPhone || "",
      personRole: "buyer",
      buyerName: record.buyerName || record.recipientName || "买家待补",
      buyerPhone: record.buyerPhone || record.recipientPhone || "",
      recipientName: record.recipientName || "",
      recipientPhone: record.recipientPhone || record.buyerPhone || "",
      recipientRaw: record.recipientRaw || "",
      address: record.recipientRaw || "",
      auctionNumber: auctionPeriod(record),
      auctionAt: record.auctionAt || "",
      projectName: record.projectName || "",
      lot: String(record.lot || ""),
      status: "寄存",
      matchStatus: "manual",
      matchedRecordId: record.id,
      matchScore: 999,
      matchReason: `拍品状态选择寄存 · Lot ${record.lot}`,
      recordStorageId: record.id,
    };
    if (index >= 0) state.assets[index] = storedAsset;
    else state.assets.push(storedAsset);
  }

  function syncStoredAssetsFromRecords() {
    const storedRecordIds = new Set(state.records.filter((record) => record.returnDisposition === "寄存").map((record) => record.id));
    state.assets = state.assets.filter((asset) => !asset.recordStorageId || storedRecordIds.has(asset.recordStorageId));
    state.records.forEach(syncStoredAssetForRecord);
  }

  function remapRecordReferences(idMap = {}) {
    const resolve = (id) => idMap[id] || id;
    state.assets = state.assets.map((asset) => ({
      ...asset,
      recordStorageId:asset.recordStorageId ? resolve(asset.recordStorageId) : asset.recordStorageId,
      matchedRecordId:asset.matchedRecordId ? resolve(asset.matchedRecordId) : asset.matchedRecordId,
    }));
    state.selected = new Set([...state.selected].map(resolve));
    state.shippingId = state.shippingId ? resolve(state.shippingId) : state.shippingId;
    state.shippingIds = [...new Set((state.shippingIds || []).map(resolve))];
    state.editingId = state.editingId ? resolve(state.editingId) : state.editingId;
  }

  function deduplicateCurrentRecords() {
    const result = MxiqiWorkflow.deduplicateAuctionLots(state.records);
    if (!result.removed) return result;
    state.records = result.records;
    remapRecordReferences(result.idMap);
    return result;
  }

  function upsert(records, {matchReauction = false} = {}) {
    const beforeState = captureMutableState();
    const beforeStorage = captureStorageSnapshot();
    try {
      const normalized = sanitizeRecordList(records);
      if ((records || []).length && !normalized.records.length) throw new Error("没有可识别的有效拍品记录");
      let added = 0;
      let updated = 0;
      let skipped = normalized.quarantined.length;
      let conflicts = 0;
      let reauctionMatched = 0;
      let reauctionReview = 0;
      let accepted = 0;
      const usedReauctionIds = new Set();
      for (const incoming of normalized.records) {
        accepted += 1;
        const platformKey = MxiqiWorkflow.platformRecordKey(incoming);
        const exact = platformKey
          ? state.records.filter((item) => MxiqiWorkflow.platformRecordKey(item) === platformKey)
          : [];
        const byLot = state.records.filter((item) => MxiqiWorkflow.sameAuctionLot(item, incoming));
        const candidates = [...new Set([...exact, ...byLot])];
        let reauctionMatch = null;
        let reauctionCanonical = null;
        if (matchReauction && !candidates.length) {
          reauctionMatch = MxiqiAssets.suggestReauctionMatch(
            incoming,
            state.records.filter((item) => !usedReauctionIds.has(item.id)),
          );
          if (reauctionMatch.matchStatus === "auto" && reauctionMatch.matchedRecordId) {
            reauctionCanonical = state.records.find((item) => item.id === reauctionMatch.matchedRecordId) || null;
            if (reauctionCanonical) candidates.push(reauctionCanonical);
          } else if (reauctionMatch.matchStatus === "review" && reauctionMatch.candidateRecordId) {
            Object.assign(incoming, {
              reauctionMatchStatus:"review",
              reauctionMatchCandidateId:reauctionMatch.candidateRecordId,
              reauctionMatchSimilarity:Number(reauctionMatch.similarity || 0),
              reauctionMatchReason:reauctionMatch.matchReason || "存在相似再拍拍品，需人工确认",
            });
            reauctionReview += 1;
          }
        }
        if (candidates.length) {
          const canonical = exact[0] || byLot[0] || reauctionCanonical || candidates[0];
          const canonicalId = canonical.id || uid();
          const duplicates = candidates.filter((item) => item !== canonical);
          const duplicateSet = new Set(duplicates);
          const duplicateIds = new Set(duplicates.map((item) => item.id).filter(Boolean));
          const canonicalBase = reauctionCanonical === canonical
            ? {...MxiqiWorkflow.relistRecord(canonical, incoming.importedAt || new Date().toISOString()), auctionPeriodOverride:""}
            : canonical;
          const mergedExisting = duplicates
            .reduce((merged, item) => MxiqiWorkflow.mergeAuctionRecordCopies(merged, item), canonicalBase);
          const merged = {...MxiqiWorkflow.mergeImportedRecord(mergedExisting, incoming), id:canonicalId};
          if (reauctionCanonical === canonical) Object.assign(merged, {
            reauctionMatchedAt:incoming.importedAt || new Date().toISOString(),
            reauctionMatchStatus:"auto",
            reauctionMatchCandidateId:"",
            reauctionMatchSimilarity:Number(reauctionMatch?.similarity || 0),
            reauctionMatchReason:reauctionMatch?.matchReason || "拍品名称模糊匹配",
            reauctionMatchedFrom:{
              lot:Number(canonical.lot) || 0,
              itemName:canonical.itemName || "",
              auctionPeriod:auctionPeriod(canonical),
            },
          });
          const changed = importRecordFingerprint(merged) !== importRecordFingerprint(canonical) || duplicates.length > 0 || !canonical.id;
          if (!changed) {
            skipped += 1;
            continue;
          }
          if (duplicates.length) {
            state.records = state.records.filter((item) => !duplicateSet.has(item));
            remapRecordReferences(Object.fromEntries([...duplicateIds].map((id) => [id, canonicalId])));
            conflicts += duplicates.length;
          }
          const index = state.records.indexOf(canonical);
          state.records[index] = merged;
          ensurePaymentTracking(state.records[index]);
          recalculateRecord(state.records[index]);
          if (reauctionCanonical === canonical) {
            usedReauctionIds.add(canonicalId);
            reauctionMatched += 1;
          }
          updated += 1;
        } else {
          const record = {...incoming,id:uid(),received:incoming.received || "待确认",settled:Boolean(incoming.settled),carrier:incoming.carrier || "pending",logisticsStatus:incoming.logisticsStatus || "not_requested",pickupCode:incoming.pickupCode || ""};
          ensurePaymentTracking(record);
          recalculateRecord(record);
          state.records.push(record);
          added += 1;
        }
      }
      syncStoredAssetsFromRecords();
      rematchAssetsAndApply();
      render();
      save();
      if (normalized.quarantined.length) saveRecoveryCopy("import-quarantine", {quarantined:normalized.quarantined});
      return {accepted, added, updated, skipped, conflicts, reauctionMatched, reauctionReview};
    } catch (error) {
      restoreMutableState(beforeState);
      restoreStorageSnapshot(beforeStorage);
      saveRecoveryCopy("import-rollback", {incoming:records}, error);
      try { render(); } catch {}
      throw new Error(`导入失败，已自动恢复导入前数据：${error?.message || error}`);
    }
  }

  function removeDefaultDemoRecords() {
    const demoIds = new Set(["d101", "d102", "d103", "d104", "d105"]);
    const before = state.records.length;
    state.records = state.records.filter((record) => !demoIds.has(record.id));
    return before - state.records.length;
  }

  function updateRulePreviews() {
    const data = new FormData(settingsForm);
    const draftSettings = Object.fromEntries(data.entries());
    $("#default-rule-preview").textContent = `示例：成交价 ¥1,000 时，${formatRule(data.get("defaultCommissionType"), Number(data.get("defaultCommissionValue") || 0))}。`;
    $("#low-price-rule-preview").textContent = `普通成交价低于 ${currency.format(Number(data.get("lowPriceThreshold") || 0))} 时，每件收取 ${currency.format(Number(data.get("lowPriceFee") || 0))}；生日月规则优先。`;
    const birthdayValue = Number(data.get("birthdayCommissionValue") || 0);
    $("#birthday-rule-preview").textContent = birthdayValue < 0
      ? `生日月份内按 ${birthdayValue}% 返佣；示例：成交 ¥2,500，应结 ${currency.format(2500 - 2500 * birthdayValue / 100)}。`
      : `生日月份内，${formatRule(data.get("birthdayCommissionType"), birthdayValue)}，整月自动应用。`;
    const tiers = MxiqiCommission.rebateTiers(draftSettings);
    $("#box-rebate-rule-preview").textContent = tiers.length
      ? `标题命中关键词后按最高适用档返佣：${tiers.map((tier) => `满 ${currency.format(tier.threshold)} 返 ${tier.value}%`).join("；")}。填 0 的档位停用，生日优惠优先。`
      : "当前未启用 NP 优惠；任一档返佣比例填非 0 后生效，生日优惠优先。";
  }

  function openSettings() {
    [...settingsForm.elements].forEach((element) => {
      if (element.name && state.settings[element.name] !== undefined) element.value = state.settings[element.name];
    });
    if (settingsForm.elements.logisticsOperatorKey) settingsForm.elements.logisticsOperatorKey.value = logisticsOperatorKey();
    updateRulePreviews();
    settingsDialog.showModal();
  }

  function connectionMethodLabel(value) {
    return ({password:"手机号 + 密码",sms:"手机验证码",wechat:"微信登录",qq:"QQ 登录"})[value] || "未选择";
  }

  function isCollectorConnected() {
    return state.connection.status === "demo_connected" || state.connection.status === "connected";
  }

  function versionAtLeast(value, minimum) {
    const actual = String(value || "").split(".").map(Number);
    const required = String(minimum || "").split(".").map(Number);
    const length = Math.max(actual.length, required.length);
    for (let index = 0; index < length; index += 1) {
      const current = Number(actual[index] || 0);
      const target = Number(required[index] || 0);
      if (current > target) return true;
      if (current < target) return false;
    }
    return true;
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
    const connectorChecked = Boolean(state.connection.connectorCheckedAt);
    const connectorInstalled = Boolean(state.connection.connectorInstalled);
    $("#connector-boundary-status").textContent = connectorInstalled ? connected && !isDemo ? "已安装并连接" : "已安装，等待官网登录" : connectorChecked ? "未检测到采集助手" : "等待检查";
    $("#connector-boundary-detail").textContent = connectorInstalled
      ? connected && !isDemo ? `已连接${state.connection.label || "麦稀奇商家账号"}，可以同步真实订单。` : "采集助手可用；请在麦稀奇官方页面登录后重新检查。"
      : connectorChecked ? "请下载并安装本地采集助手，然后刷新本页再检查。" : "安装一次后，公开工作台即可安全读取当前 Chrome 已授权的麦稀奇订单。";
    $("#connector-boundary-chip").textContent = connectorInstalled ? connected && !isDemo ? "真实连接" : "已安装" : connectorChecked ? "未安装" : "未检查";
    $("#connector-boundary-chip").classList.toggle("neutral", !(connectorInstalled && connected && !isDemo));
    $("#connector-boundary-chip").classList.toggle("success", connectorInstalled && connected && !isDemo);
  }

  async function checkRealConnection({quiet = false} = {}) {
    const checkedAt = new Date().toISOString();
    try {
      const result = await MxiqiConnector.ping();
      state.connection = result.loggedIn
        ? {status:"connected",mode:"connector",method:"password",connectedAt:state.connection.connectedAt || checkedAt,lastCheckedAt:checkedAt,connectorCheckedAt:checkedAt,connectorInstalled:true,connectorVersion:result.version || "",connectorCapabilities:Array.isArray(result.capabilities) ? result.capabilities : [],label:result.orgName || "麦稀奇商家账号"}
        : {status:"disconnected",mode:"connector",method:"password",connectedAt:"",lastCheckedAt:checkedAt,connectorCheckedAt:checkedAt,connectorInstalled:true,connectorVersion:result.version || "",connectorCapabilities:Array.isArray(result.capabilities) ? result.capabilities : [],label:""};
      audit("检查平台会话", result.loggedIn ? `真实连接成功 · ${result.orgName || "麦稀奇商家账号"}` : "采集助手已安装，麦稀奇官网尚未登录");
      save();
      renderConnectionPanel();
      renderCollectorPanel();
      if (result.loggedIn) scheduleAutomaticSettlementRecovery();
      if (!quiet) notify(result.loggedIn ? "麦稀奇真实登录已连接，可以开始同步" : "采集助手已安装，请先在麦稀奇官网登录", result.loggedIn ? "success" : "info");
      return result.loggedIn;
    } catch (error) {
      state.connection = {...clone(defaultConnection),connectorCheckedAt:checkedAt,connectorInstalled:false,lastCheckedAt:checkedAt};
      audit("检查平台会话", "未检测到本地采集助手");
      save();
      renderConnectionPanel();
      renderCollectorPanel();
      if (!quiet) notify(error.message || "未检测到麦稀奇采集助手", "error");
      return false;
    }
  }

  async function loginAndSync() {
    const mobileInput = $("#mxiqi-mobile");
    const passwordInput = $("#mxiqi-password");
    const loginButton = $("#connection-login-submit");
    const loginCard = document.querySelector(".connector-login-card");
    const loginNote = $("#connection-login-note");
    const mobile = mobileInput.value.trim();
    const password = passwordInput.value;

    if (!/^1[3-9]\d{9}$/.test(mobile)) {
      notify("请输入正确的 11 位手机号", "error");
      mobileInput.focus();
      return false;
    }
    if (!password) {
      notify("请输入麦稀奇密码", "error");
      passwordInput.focus();
      return false;
    }

    loginButton.disabled = true;
    loginCard?.classList.add("busy");
    loginButton.textContent = "正在登录麦稀奇…";
    loginNote.textContent = "正在把凭证交给本地采集助手，并仅提交到麦稀奇官网。";

    try {
      const loginResult = await MxiqiConnector.login({mobile, password});
      passwordInput.value = "";
      if (!loginResult.loggedIn) {
        loginNote.textContent = "麦稀奇要求额外验证，请在刚打开的官方页面完成后，再回到这里检查登录。";
        notify("需要在麦稀奇官方页面完成验证码或其他确认", "info");
        return false;
      }

      const checkedAt = new Date().toISOString();
      const session = await MxiqiConnector.ping();
      if (!session.loggedIn) throw new Error("登录完成，但会话检查未通过");
      state.connection = {
        status: "connected",
        mode: "connector",
        method: "password",
        connectedAt: checkedAt,
        lastCheckedAt: checkedAt,
        connectorCheckedAt: checkedAt,
        connectorInstalled: true,
        connectorVersion: session.version || "",
        connectorCapabilities: Array.isArray(session.capabilities) ? session.capabilities : [],
        label: session.orgName || "麦稀奇商家账号",
      };
      state.collector.scope = "waitexpress";
      mobileInput.value = "";
      audit("项目内登录麦稀奇", "真实会话已建立；登录凭证未保存");
      save();
      renderConnectionPanel();
      renderCollectorPanel();

      const synced = await runCollector("manual");
      if (!synced) return false;
      state.stage = "all";
      state.query = "";
      state.filters = {seller:"",auction:"",status:"",shipping:""};
      state.selected.clear();
      save();
      render();
      scheduleAutomaticSettlementRecovery();
      connectionDialog.close("synced");
      notify("登录成功，麦稀奇真实待发货数据已显示在项目表格中", "success");
      return true;
    } catch (error) {
      passwordInput.value = "";
      loginNote.textContent = "密码已从页面清空；请确认采集助手已安装，或改用官方登录页完成验证。";
      notify(error.message || "登录并抓取失败", "error");
      return false;
    } finally {
      passwordInput.value = "";
      loginButton.disabled = false;
      loginCard?.classList.remove("busy");
      loginButton.textContent = "登录并抓取待发货";
    }
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
    const realConnection = state.connection.status === "connected";
    const status = !connected ? "等待平台登录，采集已锁定" : collectorRuntime.busy ? "正在执行一次刷新…" : collectorRuntime.running ? `${realConnection ? "真实" : "演示"}自动采集中 · 每 ${state.collector.intervalSeconds} 秒一次` : `已停止 · ${realConnection ? "真实连接可用" : "演示连接"}`;
    $("#collector-runtime-status").textContent = status;
    $("#collector-last-run").textContent = collectorTime(state.collector.lastRunAt);
    $("#collector-next-run").textContent = collectorCountdown();
    $("#collector-run-count").textContent = `${Number(state.collector.runCount || 0)} 次`;
    $("#collector-last-result").textContent = state.collector.lastResult || "未执行采集";
    $("#collector-light").className = `collector-light ${collectorRuntime.busy ? "busy" : collectorRuntime.running ? "running" : ""}`;
    $("#collector-start").disabled = collectorRuntime.running || !connected;
    $("#collector-stop").disabled = !collectorRuntime.running;
    const pendingPeriod = state.filters.auction && state.records.some((record) => auctionPeriod(record) === state.filters.auction && isAuctionResultPending(record)) ? state.filters.auction : "";
    $("#collector-refresh").textContent = pendingPeriod && realConnection ? `同步${pendingPeriod}成交结果` : "立即刷新一次";
    $("#collector-refresh").disabled = collectorRuntime.busy || !connected;
    $("#sync-settlement-orders").disabled = collectorRuntime.busy || !realConnection || !state.filters.auction;
    $("#sync-unpaid-orders").disabled = collectorRuntime.busy || !realConnection;
    $("#collector-scope").disabled = collectorRuntime.busy || collectorRuntime.running;
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
      const now = new Date().toISOString();
      if (state.connection.status === "connected") {
        const requestedScope = trigger === "payment" ? "waitpay" : trigger === "auto" ? "waitexpress" : state.collector.scope || "waitexpress";
        if (requestedScope === "waitpay") {
          const connector = await MxiqiConnector.ping();
          state.connection.connectorVersion = connector.version || "";
          if (!versionAtLeast(connector.version, "1.5.0")) throw new Error("采集助手版本过旧，请重新下载 1.5.0 版并在扩展页面点击重新加载");
        }
        const maxPages = ["waitconfirm","waitpay","waitexpress"].includes(requestedScope) ? 20 : 5;
        const result = await MxiqiConnector.syncOrders({scope:requestedScope,maxPages});
        if (result.requiresLogin) {
          state.connection = {...clone(defaultConnection),mode:"connector",connectorInstalled:true,connectorCheckedAt:now,lastCheckedAt:now};
          throw new Error("麦稀奇登录已失效，请重新登录后检查连接");
        }
        removeDefaultDemoRecords();
        const incomingRecords = (Array.isArray(result.records) ? result.records : []).map((record) => ({
          ...record,
          mxiqiSeenScopes:[...new Set([...(Array.isArray(record.mxiqiSeenScopes) ? record.mxiqiSeenScopes : []),requestedScope])],
        }));
        const complete = Number(result.pages || 0) >= Number(result.totalPages || 1);
        const reconciliation = MxiqiWorkflow.reconcileAuthoritativeScope(state.records, incomingRecords, requestedScope, complete, now);
        state.records = reconciliation.records;
        const stats = upsert(incomingRecords);
        state.collector.adapter = "connector";
        state.collector.lastRunAt = now;
        state.collector.runCount = Number(state.collector.runCount || 0) + 1;
        const departedText = reconciliation.departed ? `，退出原状态 ${reconciliation.departed} 条` : "";
        state.collector.lastResult = `真实同步完成：读取 ${result.pages || 0} 页、${stats.accepted} 件拍品，新增 ${stats.added} 条，更新 ${stats.updated} 条${departedText}`;
        audit(trigger === "auto" ? "自动同步麦稀奇" : trigger === "payment" ? "同步麦稀奇待付款" : "手动同步麦稀奇", `${stats.accepted} 件拍品 · 新增 ${stats.added} · 更新 ${stats.updated}${reconciliation.departed ? ` · 退出原状态 ${reconciliation.departed}` : ""}`);
        save();
        notify(state.collector.lastResult, "success");
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 550));
      const checked = state.records.length;
      state.collector.lastRunAt = now;
      state.collector.runCount = Number(state.collector.runCount || 0) + 1;
      state.collector.lastResult = `演示刷新完成：检查 ${checked} 条本机拍品，真实数据源未连接，0 条变更`;
      audit(trigger === "auto" ? "自动演示刷新" : "手动演示刷新", `检查 ${checked} 条，0 条变更`);
      save();
    } catch (error) {
      state.collector.lastResult = `刷新失败：${error.message || "未知错误"}`;
      audit("麦稀奇同步失败", error.message || "未知错误");
      save();
      notify(state.collector.lastResult, "error");
    } finally {
      collectorRuntime.busy = false;
      if (collectorRuntime.running) collectorRuntime.nextRunAt = Date.now() + Number(state.collector.intervalSeconds) * 1000;
      renderCollectorPanel();
    }
  }

  function pendingSettlementPeriods(preferredPeriod = "") {
    const periods = [...new Set(state.records
      .filter(isAuctionResultPending)
      .map(auctionPeriod)
      .filter(Boolean))]
      .sort((a, b) => Number(String(b).match(/\d+/)?.[0] || 0) - Number(String(a).match(/\d+/)?.[0] || 0));
    if (preferredPeriod && periods.includes(preferredPeriod)) {
      return [preferredPeriod, ...periods.filter((period) => period !== preferredPeriod)];
    }
    return periods;
  }

  function scheduleAutomaticSettlementRecovery({delay = 400, preferredPeriod = state.filters.auction} = {}) {
    if (state.connection.status !== "connected") return false;
    const pending = pendingSettlementPeriods(preferredPeriod)
      .filter((period) => !collectorRuntime.autoSettlementAttempts.has(period));
    if (!pending.length) return false;
    if (collectorRuntime.autoSettlementTimer) window.clearTimeout(collectorRuntime.autoSettlementTimer);
    collectorRuntime.autoSettlementTimer = window.setTimeout(() => {
      collectorRuntime.autoSettlementTimer = 0;
      void runAutomaticSettlementRecovery(preferredPeriod);
    }, delay);
    return true;
  }

  async function runAutomaticSettlementRecovery(preferredPeriod = state.filters.auction) {
    if (state.connection.status !== "connected") return false;
    if (collectorRuntime.busy) {
      scheduleAutomaticSettlementRecovery({delay:800,preferredPeriod});
      return false;
    }
    const periods = pendingSettlementPeriods(preferredPeriod)
      .filter((period) => !collectorRuntime.autoSettlementAttempts.has(period));
    if (!periods.length) return false;
    const completed = [];
    for (const period of periods) {
      if (state.connection.status !== "connected") break;
      collectorRuntime.autoSettlementAttempts.add(period);
      const pendingBefore = state.records.filter((record) => auctionPeriod(record) === period && isAuctionResultPending(record)).length;
      const synced = await runSettlementSync({period,automatic:true});
      if (!synced) break;
      const pendingAfter = state.records.filter((record) => auctionPeriod(record) === period && isAuctionResultPending(record)).length;
      if (pendingAfter) {
        notify(`${period}自动同步后仍有 ${pendingAfter} 件未匹配，请打开采集控制手动重试`, "error");
        break;
      }
      collectorRuntime.autoSettlementAttempts.delete(period);
      if (pendingBefore) completed.push(period);
    }
    if (completed.length) notify(`已自动补同步 ${completed.join("、")} 成交结果`, "success");
    return completed.length > 0;
  }

  async function runSettlementSync({period = state.filters.auction, automatic = false} = {}) {
    if (!period) {
      notify("请先选择要结算的拍卖期数，再同步本期成交记录", "error");
      return false;
    }
    if (state.connection.status !== "connected") {
      notify("请先在“平台登录”中建立麦稀奇真实连接", "error");
      return false;
    }
    if (collectorRuntime.busy) return false;
    collectorRuntime.busy = true;
    renderCollectorPanel();
    try {
      const consignorSnapshot = {records:clone(state.records)};
      const connector = await MxiqiConnector.ping();
      const capabilities = Array.isArray(connector.capabilities) ? connector.capabilities : [];
      state.connection.connectorVersion = connector.version || "";
      if (!versionAtLeast(connector.version, "1.9.2") || !capabilities.includes("syncAuctionDeals")) {
        throw new Error("采集助手版本过旧，请重新下载 1.9.2 版并在扩展页面点击重新加载");
      }
      const orderScopes = ["waitpay", "waitconfirm", "waitexpress"];
      const orderResults = [];
      for (const scope of orderScopes) {
        const result = await MxiqiConnector.syncOrders({scope,maxPages:20});
        if (result.requiresLogin) throw new Error("麦稀奇登录已失效，请重新登录后检查连接");
        orderResults.push({scope,result});
      }
      const dealsResult = await MxiqiConnector.syncAuctionDeals({period});
      if (dealsResult.requiresLogin) {
        state.connection = {...clone(defaultConnection),mode:"connector",connectorInstalled:true,connectorVersion:connector.version || ""};
        throw new Error("麦稀奇登录已失效，请重新登录后检查连接");
      }
      removeDefaultDemoRecords();
      const timestamp = new Date().toISOString();
      const platformOrders = orderResults.flatMap(({scope,result}) => (Array.isArray(result.records) ? result.records : []).map((record) => ({
        ...record,
        mxiqiSeenScopes:[...new Set([...(Array.isArray(record.mxiqiSeenScopes) ? record.mxiqiSeenScopes : []),scope])],
      })));
      const orderMerge = MxiqiWorkflow.mergePlatformOrderRecords(state.records, platformOrders, timestamp);
      state.records = orderMerge.records;
      const pendingOrders = orderResults.find(({scope}) => scope === "waitpay")?.result?.records || [];
      const merged = MxiqiWorkflow.applyAuctionSettlementResults(
        state.records,
        Array.isArray(dealsResult.records) ? dealsResult.records : [],
        Array.isArray(pendingOrders) ? pendingOrders : [],
        period,
        timestamp,
      );
      state.records = merged.records.map((record) => ({
        id:record.id || uid(),
        received:record.received || "待确认",
        settled:Boolean(record.settled),
        carrier:record.carrier || "pending",
        logisticsStatus:record.logisticsStatus || "not_requested",
        pickupCode:record.pickupCode || "",
        ...record,
      }));
      const repaired = repairMissingConsignorsFromHistory([consignorSnapshot]);
      state.records.filter((record) => auctionPeriod(record) === merged.period).forEach((record) => {
        ensurePaymentTracking(record);
        recalculateRecord(record, true);
      });
      syncStoredAssetsFromRecords();
      rematchAssetsAndApply();
      state.collector.adapter = "connector";
      state.collector.lastRunAt = timestamp;
      state.collector.runCount = Number(state.collector.runCount || 0) + 1;
      const repairedText = repaired.restored ? `，恢复送拍人 ${repaired.restored} 件` : "";
      const buyerText = `，网页订单回补 ${orderMerge.matched + orderMerge.added} 件`;
      state.collector.lastResult = `${merged.period}成交目录同步完成：匹配 ${merged.matched} 件，新增 ${merged.added} 件${buyerText}，未付款拖回 ${merged.unpaid} 件${repairedText}`;
      audit("同步本期成交记录", `${merged.period} · 匹配 ${merged.matched} · 新增 ${merged.added} · 网页订单回补 ${orderMerge.matched + orderMerge.added} · 未付款拖回 ${merged.unpaid}${repairedText}`);
      save();
      if (!automatic) {
        state.stage = "settlement";
        state.selected.clear();
      }
      render();
      if (!automatic) notify(state.collector.lastResult, "success");
      return true;
    } catch (error) {
      state.collector.lastResult = `结算同步失败：${error.message || "未知错误"}`;
      audit("同步本期成交记录失败", error.message || "未知错误");
      save();
      notify(state.collector.lastResult, "error");
      return false;
    } finally {
      collectorRuntime.busy = false;
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
    state.collector.scope = $("#collector-scope").value || "waitexpress";
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
    $("#collector-scope").value = state.collector.scope || "waitexpress";
    $("#collector-interval").value = String(state.collector.intervalSeconds || 60);
    $("#collector-idle").value = String(state.collector.idleMinutes || 10);
    renderConnectionPanel();
    renderCollectorPanel();
    $("#collector-dialog").showModal();
  }

  function assetStatusLabel(value) {
    return ({auto:"自动匹配",manual:"人工匹配",review:"待人工确认",unmatched:"未匹配"})[value] || "未匹配";
  }

  function assetSourceLabel(asset) {
    return `${MxiqiAssets.TYPE_LABELS[asset.assetType] || "资料"} · ${asset.sourceSheet || "工作表"}`;
  }

  function assetVisibleRows() {
    const query = state.assetQuery.trim().toLowerCase();
    return state.assets.filter((asset) => {
      const matchesStatus = state.assetFilter === "all" || asset.matchStatus === state.assetFilter;
      const searchText = [asset.itemName,asset.buyerName,asset.buyerPhone,asset.recipientName,asset.recipientPhone,asset.recipientRaw,asset.address,asset.sellerWechat,asset.sellerPhone,asset.consignmentOrderNo,asset.gradingOrderNo,asset.gradingId,asset.auctionNumber,asset.auctionAt,asset.lot,asset.sourceFile,asset.status].join(" ").toLowerCase();
      return matchesStatus && (!query || searchText.includes(query));
    });
  }

  function renderAssetPanel() {
    const currentAssetIds = new Set(state.assets.map((asset) => asset.id));
    [...state.selectedAssets].forEach((assetId) => {
      if (!currentAssetIds.has(assetId)) state.selectedAssets.delete(assetId);
    });
    const counts = {auto:0,manual:0,review:0,unmatched:0};
    state.assets.forEach((asset) => { counts[asset.matchStatus] = (counts[asset.matchStatus] || 0) + 1; });
    $("#asset-total").textContent = state.assets.length;
    $("#asset-auto").textContent = counts.auto;
    $("#asset-manual").textContent = counts.manual;
    $("#asset-review").textContent = counts.review;
    $("#asset-unmatched").textContent = counts.unmatched;
    $$('[data-asset-filter]').forEach((button) => button.classList.toggle("active", button.dataset.assetFilter === state.assetFilter));
    $("#asset-search").value = state.assetQuery;
    const visible = assetVisibleRows();
    const groups = MxiqiAssets.groupAssetsByBuyer(visible);
    const visibleSelected = visible.filter((asset) => state.selectedAssets.has(asset.id));
    const selectAll = $("#asset-select-all");
    selectAll.checked = visible.length > 0 && visibleSelected.length === visible.length;
    selectAll.indeterminate = visibleSelected.length > 0 && visibleSelected.length < visible.length;
    selectAll.disabled = !visible.length;
    const selectedCount = state.selectedAssets.size;
    $("#asset-selection-count").hidden = !selectedCount;
    $("#asset-batch-delete").hidden = !selectedCount;
    $("#asset-clear-selection").hidden = !selectedCount;
    $("#asset-selection-count").textContent = `已选 ${selectedCount} 条`;
    const consignmentOrderCount = new Set(state.assets.filter((asset) => asset.assetType === "consignment" && asset.consignmentOrderNo).map((asset) => asset.consignmentOrderNo)).size;
    $("#asset-sync-orders").disabled = !consignmentOrderCount;
    $("#asset-sync-orders").title = !consignmentOrderCount ? "请先导入含寄存单号的第一张“寄存”工作表" : state.connection.status !== "connected" ? "请先连接麦稀奇" : `搜索 ${consignmentOrderCount} 个寄存单号`;
    $("#asset-footer-note").textContent = state.assets.length
      ? `显示 ${groups.length} 位买家 / ${visible.length} 件资料 · ${counts.review + counts.unmatched} 件需要人工处理`
      : "等待导入";
    const body = $("#asset-body");
    if (!visible.length) {
      body.innerHTML = `<tr><td colspan="8" class="empty-state">${state.assets.length ? "当前筛选下没有记录。" : "尚未导入寄存或库存数据。"}</td></tr>`;
      return;
    }
    const recordOptions = state.records.slice().sort((a, b) => Number(a.lot) - Number(b.lot)).map((record) =>
      `<option value="${esc(record.id)}">Lot ${esc(record.lot)} · ${esc(record.sellerWechat || "待补送拍人")} · ${esc(record.sellerPhone || "无手机号")} · ${esc(record.itemName)}</option>`
    ).join("");
    body.innerHTML = groups.map((group) => {
      const expanded = state.expandedAssetGroups.has(group.key);
      const allSelected = group.assets.length > 0 && group.assets.every((asset) => state.selectedAssets.has(asset.id));
      const matchedCount = group.assets.filter((asset) => ["auto","manual"].includes(asset.matchStatus)).length;
      const orderNumbers = [...new Set(group.assets.map((asset) => asset.consignmentOrderNo).filter(Boolean))];
      const periods = [...new Set(group.assets.map((asset) => asset.auctionNumber).filter(Boolean))];
      const dates = [...new Set(group.assets.map((asset) => asset.auctionAt).filter(Boolean))];
      const lots = group.assets.map((asset) => asset.lot).filter(Boolean);
      const children = expanded ? group.assets.map((asset) => {
        const orderDetail = asset.consignmentOrderNo ? `寄存单 ${asset.consignmentOrderNo}`
          : asset.gradingOrderNo ? `送评单 ${asset.gradingOrderNo}`
          : [asset.auctionNumber && `拍场 ${asset.auctionNumber}`, asset.lot && `Lot ${asset.lot}`].filter(Boolean).join(" · ") || "无订单编号";
        const amountDetail = asset.assetType === "inventory" ? `到手 ${currency.format(asset.landedCost || 0)} · 外拍 ${currency.format(asset.purchasePrice || 0)}` : (asset.orderDate || asset.gradingDate || "来源日期未填");
        return `<tr class="asset-child-row ${state.selectedAssets.has(asset.id) ? "selected-row" : ""}">
          <td class="select-column"><input type="checkbox" data-asset-select="${esc(asset.id)}" aria-label="选择 ${esc(asset.itemName)}" ${state.selectedAssets.has(asset.id) ? "checked" : ""}></td>
          <td><small>同一买家</small></td>
          <td><b>${esc(asset.itemName)}</b><small>${esc([asset.lot && `Lot ${asset.lot}`,asset.gradingId && `编号 ${asset.gradingId}`,asset.status].filter(Boolean).join(" · "))}</small></td>
          <td><b>${esc(asset.auctionNumber || "期数待补")}</b><small>${esc(asset.auctionAt || asset.projectName || "拍卖时间待补")}</small></td>
          <td><span class="match-badge ${esc(asset.matchStatus)}">${esc(assetStatusLabel(asset.matchStatus))}</span><small>${esc(asset.matchReason || "")}</small></td>
          <td><span class="asset-type ${esc(asset.assetType)}">${esc(assetSourceLabel(asset))}</span><small>${esc(orderDetail)} · ${esc(amountDetail)}</small></td>
          <td><select class="asset-match-select" data-asset-match="${esc(asset.id)}"><option value="">不匹配 / 稍后处理</option>${recordOptions}</select></td>
          <td><small>${asset.storageShippingStatus === "completed" ? `已发货 ${new Date(asset.storageShippedAt).toLocaleDateString("zh-CN")}` : "待处理"}</small></td>
        </tr>`;
      }).join("") : "";
      return `<tr class="asset-group-row ${group.completed ? "completed" : ""} ${allSelected ? "selected-row" : ""}">
        <td class="select-column"><input type="checkbox" data-asset-group-select="${esc(group.key)}" aria-label="选择 ${esc(group.buyerName)} 的寄存资料" ${allSelected ? "checked" : ""}></td>
        <td class="asset-buyer-cell"><b>${esc(group.buyerName)}</b><small>${esc(group.buyerPhone || "买家手机号待补")}</small><small class="asset-address">${esc(group.recipientRaw || "收货地址待回补")}</small></td>
        <td><b>${group.assets.length} 件寄存${lots.length ? ` · Lot ${esc(lots.join("、"))}` : ""}</b><small>${esc(group.assets.map((asset) => asset.itemName).join("；"))}</small></td>
        <td><b>${esc(periods.join("、") || "期数待补")}</b><small>${esc(dates.join("、") || "拍卖时间待补")}</small></td>
        <td><span class="match-badge ${matchedCount === group.assets.length ? "auto" : "review"}">${matchedCount}/${group.assets.length} 已匹配</span><small>${group.completed ? "寄存发货已完成" : "寄存处理中"}</small></td>
        <td><b>${orderNumbers.length ? `${orderNumbers.length} 个寄存单` : assetSourceLabel(group.assets[0])}</b><small>${esc(orderNumbers.join("、") || group.assets[0]?.sourceFile || "")}</small></td>
        <td><small>展开后可逐件调整关联</small></td>
        <td><div class="row-actions"><button type="button" data-asset-group-toggle="${esc(group.key)}">${expanded ? "收起" : "展开"}</button><button type="button" data-asset-group-ship="${esc(group.key)}" ${group.completed || group.assetType !== "consignment" ? "disabled" : ""}>${group.completed ? "已发货" : "整组发货"}</button></div></td>
      </tr>${children}`;
    }).join("");
    visible.forEach((asset) => {
      const select = body.querySelector(`[data-asset-match="${CSS.escape(asset.id)}"]`);
      if (select) select.value = ["auto", "manual"].includes(asset.matchStatus) ? asset.matchedRecordId || "" : "";
    });
  }

  function setAssetSyncStatus(message, tone = "") {
    const status = $("#asset-sync-status");
    if (!status) return;
    status.textContent = message;
    status.className = `asset-sync-status ${tone}`.trim();
  }

  function openAssets() {
    rematchAssetsAndApply();
    save();
    renderAssetPanel();
    assetDialog.showModal();
  }

  async function importAssetFiles(files) {
    if (!files.length) return;
    let incoming = [];
    const kindLabels = new Set();
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".xlsx")) throw new Error(`${file.name} 不是 .xlsx 文件`);
      if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} 超过 8MB`);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      const parsed = MxiqiAssets.parseAssetWorkbook(workbook, file.name);
      incoming.push(...parsed.assets);
      parsed.kinds.forEach((kind) => kindLabels.add(MxiqiAssets.TYPE_LABELS[kind] || kind));
    }
    state.assets = MxiqiAssets.mergeAssets(state.assets, incoming);
    rematchAssetsAndApply();
    save();
    audit("导入寄存库存", `${incoming.length} 条 · ${[...kindLabels].join("、")}`);
    renderAssetPanel();
    updateBackupSummary();
    const consignmentCount = incoming.filter((asset) => asset.assetType === "consignment" && asset.consignmentOrderNo).length;
    if (consignmentCount && state.connection.status === "connected") {
      await syncConsignmentOrdersFromAssets({quietIfDisconnected:true});
    } else {
      notify(`已导入 ${incoming.length} 条${[...kindLabels].join("、")}数据并完成首轮匹配${consignmentCount ? "；登录麦稀奇后可按寄存单号回补历史订单" : ""}`);
    }
  }

  async function syncConsignmentOrdersFromAssets({quietIfDisconnected = false} = {}) {
    const orderNumbers = [...new Set(state.assets.filter((asset) => asset.assetType === "consignment" && asset.consignmentOrderNo).map((asset) => String(asset.consignmentOrderNo)))];
    if (!orderNumbers.length) {
      setAssetSyncStatus("没有找到可搜索的寄存单号，请确认导入的是第一张“寄存”工作表。", "error");
      notify("当前寄存资料中没有可搜索的寄存订单号", "error");
      return false;
    }
    if (state.connection.status !== "connected") {
      setAssetSyncStatus("尚未连接麦稀奇。请先到“平台登录”确认采集助手已连接并且账号仍处于登录状态。", "error");
      if (!quietIfDisconnected) notify("请先连接麦稀奇，再按寄存单号回补历史订单", "error");
      return false;
    }
    const button = $("#asset-sync-orders");
    button.disabled = true;
    button.textContent = `正在搜索 ${orderNumbers.length} 个寄存单号…`;
    setAssetSyncStatus(`正在逐个搜索 ${orderNumbers.length} 个寄存单号，请不要关闭当前页面。`, "busy");
    try {
      const connector = await MxiqiConnector.ping();
      const capabilities = Array.isArray(connector.capabilities) ? connector.capabilities : [];
      state.connection.connectorVersion = connector.version || state.connection.connectorVersion || "";
      state.connection.connectorCapabilities = capabilities;
      if (!versionAtLeast(connector.version, "1.5.0") || !capabilities.includes("syncOrdersByNumbers")) {
        throw new Error("采集助手版本过旧，请下载 1.5.0 版并在扩展页面点击重新加载");
      }
      const result = await MxiqiConnector.syncOrdersByNumbers({orderNumbers});
      if (result.requiresLogin) throw new Error("麦稀奇登录已失效，请重新登录");
      removeDefaultDemoRecords();
      const stats = upsert(Array.isArray(result.records) ? result.records : []);
      rematchAssetsAndApply();
      audit("按寄存单号回补麦稀奇订单", `搜索 ${result.searched || orderNumbers.length} 单 · 找到 ${result.foundOrders?.length || 0} 单 · ${stats.accepted} 件拍品`);
      save();
      render();
      renderAssetPanel();
      const missing = result.missingOrderNumbers?.length || 0;
      setAssetSyncStatus(`回补完成：找到 ${result.foundOrders?.length || 0} 单，同步 ${stats.accepted} 件拍品${missing ? `，${missing} 个单号未找到` : ""}。`, missing ? "busy" : "success");
      notify(`历史订单回补完成：找到 ${result.foundOrders?.length || 0} 单、同步 ${stats.accepted} 件拍品${missing ? `；${missing} 个单号未找到` : ""}`, missing ? "info" : "success");
      return true;
    } catch (error) {
      const rawMessage = error.message || "按寄存单号回补失败";
      const message = /不支持的采集命令|不支持的连接器命令|unsupported|版本过旧/i.test(rawMessage)
        ? "采集助手版本过旧，请下载 1.5.0 版、在扩展页面重新加载后再试。"
        : `${rawMessage}。请确认麦稀奇登录有效后重试。`;
      setAssetSyncStatus(message, "error");
      notify(message, "error");
      return false;
    } finally {
      button.disabled = !orderNumbers.length;
      button.textContent = "按寄存单号回补麦稀奇订单";
    }
  }

  function updateBackupSummary() {
    const lastBackup = localStorage.getItem(BACKUP_META_KEY);
    syncCustomerDirectory();
    const customerTotal = Object.keys(state.customers).length;
    const birthdayCustomerCount = Object.values(state.customers).filter((customer) => Number(customer.birthdayMonth) > 0).length;
    const shippingPending = state.records.filter((record) => isShippingCandidate(record) && shippingStage(record) !== "completed").length;
    const connectionLabel = isCollectorConnected() ? state.connection.status === "demo_connected" ? "演示登录已连接" : "平台已连接" : "平台未登录";
    $("#backup-summary").textContent = `${state.records.length} 条拍品 · ${state.assets.length} 条寄存/库存 · ${customerTotal} 位送拍人档案（${birthdayCustomerCount} 位已设生日月） · ${shippingPending} 单待发货 · ${connectionLabel} · 采集间隔 ${state.collector.intervalSeconds} 秒${lastBackup ? ` · 上次备份 ${new Date(lastBackup).toLocaleString("zh-CN")}` : " · 尚未下载过备份"}`;
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
    const backup = {schemaVersion:9,exportedAt,records:state.records,assets:state.assets,settings:state.settings,customers:state.customers,collector:state.collector,connection:state.connection,audit:state.audit};
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
      state.assets = Array.isArray(backup.assets) ? backup.assets.map((asset) => normalizeConsignmentAsset({...asset,id:asset.id || uid()})) : [];
      state.settings = backup.settings && typeof backup.settings === "object" ? {...defaultSettings, ...backup.settings} : clone(defaultSettings);
      state.customers = backup.customers && typeof backup.customers === "object" ? backup.customers : {};
      state.collector = backup.collector && typeof backup.collector === "object" ? {...defaultCollector, ...backup.collector} : clone(defaultCollector);
      const restoredConnection = backup.connection && typeof backup.connection === "object" ? {...defaultConnection, ...backup.connection} : clone(defaultConnection);
      state.connection = restoredConnection.status === "demo_connected" ? restoredConnection : clone(defaultConnection);
      state.audit = Array.isArray(backup.audit) ? backup.audit : [];
      rematchAssetsAndApply();
      collectorRuntime.running = false;
      collectorRuntime.busy = false;
      collectorRuntime.nextRunAt = 0;
      state.selected.clear();
      state.selectedAssets.clear();
      state.expandedAssetGroups.clear();
      audit("恢复完整备份", `${state.records.length} 条拍品`);
      save();
      render();
      renderConnectionPanel();
      renderCollectorPanel();
      backupDialog.close();
      notify(`已恢复 ${state.records.length} 条拍品、${state.assets.length} 条寄存/库存及全部规则`);
    } catch (error) {
      notify(error.message || "备份恢复失败", "error");
    }
  }

  $$('[data-stage]').forEach((button) => button.addEventListener("click", () => {
    const nextStage = button.dataset.stage;
    if (state.stage === "settlement" && nextStage !== "settlement") state.settlementView = "all";
    state.stage = nextStage;
    if (["reauction","unpaid"].includes(state.stage)) state.filters.status = "";
    if (state.stage === "preauction") state.filters = {...state.filters,seller:"",status:"",shipping:""};
    state.selected.clear();
    render();
  }));
  $$('[data-close-dialog]').forEach((button) => button.addEventListener("click", () => button.closest("dialog")?.close("cancel")));
  $("#search").addEventListener("input", (event) => { state.query = event.target.value; render(); });
  [["#filter-seller","seller"],["#filter-auction","auction"],["#filter-status","status"],["#filter-shipping","shipping"]].forEach(([selector, key]) => {
    $(selector).addEventListener("change", (event) => {
      state.filters[key] = event.target.value;
      state.selected.clear();
      render();
      if (key === "auction") scheduleAutomaticSettlementRecovery({preferredPeriod:state.filters.auction});
    });
  });
  $("#clear-filters").addEventListener("click", () => {
    state.filters = {seller:"",auction:"",status:"",shipping:""};
    state.query = "";
    $("#search").value = "";
    state.selected.clear();
    render();
  });
  $("#settlement-seller").addEventListener("change", (event) => { state.settlementScope.seller = event.target.value; state.filters.seller = ""; state.selected.clear(); render(); });
  $("#settlement-from").addEventListener("change", (event) => { state.settlementScope.from = event.target.value; state.selected.clear(); render(); });
  $("#settlement-to").addEventListener("change", (event) => { state.settlementScope.to = event.target.value; state.selected.clear(); render(); });
  $("#seller-repair-customer").addEventListener("change", (event) => {
    $("#seller-repair-apply").disabled = !event.target.value || !settlementRepairableRecords().length;
  });
  $("#seller-repair-apply").addEventListener("click", () => {
    const customerKey = $("#seller-repair-customer").value;
    const entry = customerDirectoryEntries().find((item) => item.key === customerKey);
    const displayName = entry?.wechat || customerKey;
    const records = settlementRepairableRecords();
    if (!customerKey || !records.length) return;
    if (!confirm(`确定把当前范围内 ${records.length} 件“待补送拍人”拍品全部关联给“${displayName}”吗？`)) return;
    assignCustomerToRecords(records, customerKey);
    syncStoredAssetsFromRecords();
    rematchAssetsAndApply();
    audit("批量关联送拍人", `${displayName} · ${records.length} 件拍品`);
    state.settlementScope.seller = "";
    state.selected.clear();
    render();
    notify(`已把 ${records.length} 件拍品关联给 ${displayName}`);
  });
  $("#seller-summary-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-seller-summary]");
    if (!button) return;
    state.settlementScope.seller = button.dataset.sellerSummary;
    state.filters.seller = "";
    state.selected.clear();
    render();
  });
  $("#preauction-seller-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-preauction-seller]");
    if (!button) return;
    const seller = button.dataset.preauctionSeller;
    state.filters.seller = state.filters.seller === seller ? "" : seller;
    state.selected.clear();
    render();
  });
  $("#records-body").addEventListener("change", (event) => {
    const packageKey = event.target.dataset.packageSelect;
    if (packageKey) {
      recordsForPackageKey(packageKey).forEach((record) => {
        event.target.checked ? state.selected.add(record.id) : state.selected.delete(record.id);
      });
      render();
      return;
    }
    const settlementKey = event.target.dataset.settlementSelect;
    if (settlementKey) {
      const group = settlementGroups(visibleRecords()).find((item) => item.key === settlementKey);
      group?.records.forEach((record) => event.target.checked ? state.selected.add(record.id) : state.selected.delete(record.id));
      render();
      return;
    }
    const id = event.target.dataset.select;
    if (!id) return;
    event.target.checked ? state.selected.add(id) : state.selected.delete(id);
    render();
  });

  $("#records-body").addEventListener("click", async (event) => {
    const customerOpen = event.target.closest("[data-customer-open]");
    if (customerOpen) {
      openCustomerDirectory(customerOpen.dataset.customerOpen);
      return;
    }
    const settlementToggle = event.target.closest("[data-settlement-toggle]");
    if (settlementToggle) {
      const key = settlementToggle.dataset.settlementToggle;
      state.expandedSettlements.has(key) ? state.expandedSettlements.delete(key) : state.expandedSettlements.add(key);
      render();
      return;
    }
    const settlementSettle = event.target.closest("[data-settlement-settle]");
    if (settlementSettle) {
      if (!requireSettlementReady()) return;
      const group = settlementGroups(visibleRecords()).find((item) => item.key === settlementSettle.dataset.settlementSettle);
      let count = 0;
      group?.records.filter((record) => !record.settled).forEach((record) => {
        recalculateRecord(record, true);
        record.settled = true;
        record.settledAt = new Date().toISOString();
        record.settlementNote = record.settlementNote || "网页按送拍人整组结账";
        count += 1;
      });
      audit("按送拍人整组结账", `${group?.seller || "待补送拍人"} · ${count} 件拍品`);
      save();
      render();
      notify(`已为 ${group?.seller || "该送拍人"} 结账 ${count} 件拍品`);
      return;
    }
    const packageToggle = event.target.closest("[data-package-toggle]");
    if (packageToggle) {
      const key = packageToggle.dataset.packageToggle;
      state.expandedPackages.has(key) ? state.expandedPackages.delete(key) : state.expandedPackages.add(key);
      render();
      return;
    }
    const packageShipping = event.target.closest("[data-package-shipping]");
    if (packageShipping) {
      openShippingPackage(packageShipping.dataset.packageShipping);
      return;
    }
    const packageEdit = event.target.closest("[data-package-edit]");
    if (packageEdit) {
      const records = recordsForPackageKey(packageEdit.dataset.packageEdit);
      openShippingPackage(packageEdit.dataset.packageEdit);
      notify(`已打开整包补资料；公共资料会同步到 ${records.length} 件拍品`, "info");
      return;
    }
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const record = state.records.find((item) => item.id === button.dataset.id);
    if (!record) return;
    if (button.dataset.action === "sync-result") {
      const period = auctionPeriod(record);
      if (!period || period === "期数待补") return notify("请先补充拍卖期数，再同步成交结果", "error");
      state.filters.auction = period;
      state.filters.status = "";
      render();
      await runSettlementSync();
      return;
    }
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
    if (button.dataset.action === "toggle-settle" && isSettlementEligible(record)) {
      if (record.settled) {
        record.settled = false;
        record.settledAt = "";
        audit("撤销结账", `Lot ${record.lot}`);
      } else {
        if (!requireSettlementReady()) return;
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

  $("#records-head").addEventListener("change", (event) => {
    if (event.target.id !== "select-all") return;
    visibleRecords().forEach((item) => event.target.checked ? state.selected.add(item.id) : state.selected.delete(item.id));
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
  $("#batch-shipping").addEventListener("click", () => {
    const keys = [...new Set(state.records.filter((item) => state.selected.has(item.id) && isShippingCandidate(item)).map((item) => MxiqiPackages.packageKey(item)))];
    if (!keys.length) return notify("所选拍品还没有满足发货条件的买家订单", "error");
    state.shippingQueueKeys = keys;
    state.shippingQueueIndex = 0;
    openShippingPackage(keys[0], true);
    notify(`已加入 ${keys.length} 个发货包裹；每个包裹仍需核对买家地址`, "info");
  });
  $("#batch-delete").addEventListener("click", () => {
    const ids = [...state.selected];
    if (!ids.length || !confirm(`确定删除选中的 ${ids.length} 条拍品吗？此操作只影响当前浏览器数据。`)) return;
    state.records = state.records.filter((record) => !state.selected.has(record.id));
    syncStoredAssetsFromRecords();
    rematchAssetsAndApply();
    state.selected.clear();
    audit("批量删除拍品", `${ids.length} 条拍品`);
    save();
    render();
    notify(`已删除 ${ids.length} 条拍品`);
  });
  $("#batch-settle").addEventListener("click", () => {
    if (!requireSettlementReady()) return;
    let count = 0;
    state.records.filter((item) => state.selected.has(item.id) && isSettlementEligible(item) && !item.settled).forEach((item) => {
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

  $("#shipping-next-package").addEventListener("click", () => {
    if (state.shippingQueueIndex >= state.shippingQueueKeys.length - 1) return;
    state.shippingQueueIndex += 1;
    const key = state.shippingQueueKeys[state.shippingQueueIndex];
    const records = recordsForPackageKey(key);
    if (!records.length) return;
    state.shippingIds = records.map((record) => record.id);
    state.shippingId = records[0].id;
    shippingForm.reset();
    renderShippingDialog(records[0]);
  });

  $("#shipping-split-address").addEventListener("click", () => {
    const records = activeShippingRecords();
    const record = records[0];
    if (!record || records.some((item) => item.outboundTrackingNumber)) return;
    const parsed = splitRecipientAddress(shippingForm.elements.recipientRaw.value);
    records.forEach((item) => Object.assign(item, parsed, {shippingCarrier:shippingForm.elements.shippingCarrier.value || carrierFor(record),addressReviewedAt:""}));
    audit("拆分包裹收件地址", `${records.length} 件 · ${parsed.addressWarnings.length ? `缺 ${parsed.addressWarnings.join("、")}` : "待二次审核"}`);
    save();
    renderShippingDialog(record);
    render();
    notify(parsed.addressWarnings.length ? "地址只完成了部分拆分，请修正红色提示项" : "地址已拆分，请逐项核对并完成二次审核", parsed.addressWarnings.length ? "info" : "success");
  });

  $("#shipping-review-address").addEventListener("click", () => {
    const records = activeShippingRecords();
    const record = records[0];
    if (!record || records.some((item) => item.outboundTrackingNumber)) return;
    const values = addressValuesFromForm();
    const gaps = addressMissing(values);
    records.forEach((item) => Object.assign(item, values, {addressStatus:gaps.length ? "needs_correction" : "reviewed",addressWarnings:gaps,addressReviewedAt:gaps.length ? "" : new Date().toISOString()}));
    save();
    if (gaps.length) {
      audit("包裹地址二审未通过", `${records.length} 件 · 缺 ${gaps.join("、")}`);
      renderShippingDialog(record, false);
      render();
      notify(`还不能下单，请补充：${gaps.join("、")}`, "error");
      return;
    }
    audit("确认包裹地址二审", `${records.length} 件 · ${record.addressProvince}${record.addressCity}${record.addressDistrict}`);
    renderShippingDialog(record, false);
    render();
    notify("地址二次审核已通过，可以进入物流下单");
  });

  function syncPackageFormField(event) {
    const records = activeShippingRecords();
    const record = records[0];
    if (!record || !event.target.name) return;
    const name = event.target.name;
    if (records.some((item) => item.outboundTrackingNumber) && PACKAGE_ADDRESS_FIELDS.includes(name)) return;
    if ([...PACKAGE_SHARED_FIELDS, ...PACKAGE_ADDRESS_FIELDS].includes(name)) {
      const value = ["buyerPhone","recipientPhone"].includes(name) ? event.target.value.replace(/\D/g, "") : event.target.value;
      const previousRecords = new Map(records.map((item) => [item.id, {...item}]));
      if (name === "returnDisposition" && value === "上拍") {
        records.forEach((item) => {
          Object.assign(item, MxiqiWorkflow.relistRecord(item));
          syncStoredAssetForRecord(item);
        });
      } else {
        MxiqiPackages.applySharedFields(records, {[name]:value}, [name]);
        records.forEach((item) => {
          if (name === "returnDisposition") {
            const outcome = MxiqiWorkflow.trackerOutcome(value, item.finalPrice);
            item.finalOutcome = outcome.finalOutcome;
            item.returnDisposition = outcome.returnDisposition;
            item.returnDispositionConfirmedAt = MxiqiWorkflow.isHandledReturnDisposition(outcome.returnDisposition) ? new Date().toISOString() : "";
            item.returnDispositionReviewRequiredAt = "";
            item.relisted = false;
            syncStoredAssetForRecord(item);
          }
          if (["finalOutcome","returnDisposition","auctionAt"].includes(name)) recalculateRecord(item, true);
          if (name === "paymentStatus") Object.assign(item, MxiqiWorkflow.applyManualPaymentResolution(item, previousRecords.get(item.id) || {}));
          if (["finalOutcome","paymentStatus","auctionAt"].includes(name)) ensurePaymentTracking(item);
          if (PACKAGE_ADDRESS_FIELDS.includes(name) && item.addressStatus === "reviewed") {
            item.addressStatus = "pending_review";
            item.addressReviewedAt = "";
          }
        });
      }
      if (name === "returnDisposition") {
        const label = value || "正常流程";
        shippingForm.elements.finalOutcome.value = MxiqiPackages.sameValue(records, "finalOutcome");
        audit("整包特殊处理", `${records.length} 件 · ${label}`);
      }
      save();
      renderShippingDialog(record, false);
      render();
    }
  }

  shippingForm.addEventListener("input", syncPackageFormField);
  shippingForm.addEventListener("change", (event) => {
    if (event.target.name !== "shippingCarrier") syncPackageFormField(event);
  });

  shippingForm.elements.shippingCarrier.addEventListener("change", (event) => {
    const records = activeShippingRecords();
    const record = records[0];
    if (!record || records.some((item) => item.outboundTrackingNumber)) return;
    records.forEach((item) => { item.shippingCarrier = event.target.value; });
    save();
    renderShippingDialog(record, false);
    render();
  });

  $("#shipping-check-logistics").addEventListener("click", () => checkLogisticsConnection({notifyResult:true}));

  $("#shipping-open-carrier").addEventListener("click", async () => {
    const carrier = shippingForm.elements.shippingCarrier.value || "cainiao";
    try {
      const result = await MxiqiConnector.openCarrierPortal({carrier});
      if (result.requiresMiniProgram) notify("菜鸟商家寄件当前需要在微信小程序中操作；下单后请回填真实运单号和取件码", "info");
      else notify(`${carrierLabel(carrier)}寄件页面已打开`);
    } catch (error) {
      if (carrier === "sf") window.open(MxiqiLogistics.CARRIERS.sf.portal, "_blank", "noopener");
      notify(error.message || "物流平台打开失败", "error");
    }
  });

  $("#shipping-create-order").addEventListener("click", async () => {
    const records = activeShippingRecords();
    const record = records[0];
    if (!record || !records.every(isShippingCandidate) || !records.every((item) => item.addressStatus === "reviewed") || records.some((item) => item.outboundTrackingNumber)) return;
    const carrier = shippingForm.elements.shippingCarrier.value || carrierFor(record);
    const formValues = {
      shippingGoodsName:String(shippingForm.elements.shippingGoodsName.value || "").trim(),
      shipmentWeightKg:Number(shippingForm.elements.shipmentWeightKg.value || 0),
    };
    records.forEach((item) => Object.assign(item, formValues, {shippingCarrier:carrier}));
    const request = shipmentRequest(records, carrier);
    const validation = MxiqiLogistics.validateRequest(request);
    if (!validation.ok) return notify(`真实下单资料不完整：${validation.missing.join("、")}`, "error");
    if (!logisticsCanCreate(carrier)) return notify(`${carrierLabel(carrier)}真实接口尚未配置，不能提交；请先在物流平台下单后录入真实结果`, "error");
    try {
      $("#shipping-create-order").disabled = true;
      records.forEach((item) => { item.logisticsStatus = "submitting"; item.logisticsError = ""; });
      save();
      const response = await MxiqiLogisticsGateway.createOrder({
        baseUrl:logisticsGatewayUrl(),
        operatorKey:logisticsOperatorKey(),
        request,
      });
      const receipt = MxiqiLogistics.normalizeReceipt(response);
      const orderedAt = new Date().toISOString();
      records.forEach((item) => Object.assign(item, {shippingCarrier:carrier,outboundTrackingNumber:receipt.waybill,pickupCode:receipt.pickupCode,logisticsOrderId:receipt.logisticsOrderId,shippingOrderedAt:orderedAt,mxiqiShippingStatus:"pending",logisticsStatus:"ready",logisticsSource:"gateway",logisticsError:""}));
      audit("真实整包物流下单", `${records.length} 件 · ${carrierLabel(carrier)} · ${receipt.waybill}`);
      save();
      renderShippingDialog(record);
      render();
      notify(`${carrierLabel(carrier)}真实下单成功，运单号已保存`, "success");
    } catch (error) {
      records.forEach((item) => { item.logisticsStatus = "failed"; item.logisticsError = error.message || "物流下单失败"; });
      save();
      renderShippingDialog(record, false);
      render();
      notify(error.message || "物流下单失败", "error");
    }
  });

  $("#shipping-save-result").addEventListener("click", () => {
    const records = activeShippingRecords();
    const record = records[0];
    if (!record || !records.every(isShippingCandidate) || !records.every((item) => item.addressStatus === "reviewed")) return;
    try {
      const receipt = MxiqiLogistics.normalizeReceipt({
        waybill:shippingForm.elements.outboundTrackingNumber.value,
        pickupCode:shippingForm.elements.pickupCode.value,
        logisticsOrderId:shippingForm.elements.logisticsOrderId.value,
      });
      const carrier = shippingForm.elements.shippingCarrier.value || carrierFor(record);
      const orderedAt = new Date().toISOString();
      records.forEach((item) => Object.assign(item, {shippingCarrier:carrier,outboundTrackingNumber:receipt.waybill,pickupCode:receipt.pickupCode,logisticsOrderId:receipt.logisticsOrderId,shippingOrderedAt:orderedAt,mxiqiShippingStatus:"pending",logisticsStatus:"ready",logisticsSource:"manual"}));
      audit("录入真实整包物流结果", `${records.length} 件 · ${carrierLabel(carrier)} · ${receipt.waybill}`);
      save();
      renderShippingDialog(record);
      render();
      notify("真实运单号和取件码已保存", "success");
    } catch (error) {
      notify(error.message, "error");
    }
  });

  $("#shipping-copy-waybill").addEventListener("click", async () => {
    const records = activeShippingRecords();
    const record = records[0];
    if (!record?.outboundTrackingNumber) return;
    try {
      await copyText(record.outboundTrackingNumber);
      const copiedAt = new Date().toISOString();
      records.forEach((item) => {
        item.waybillCopiedAt = copiedAt;
        item.mxiqiShippingStatus = item.mxiqiShippingStatus === "filled" ? "filled" : "pending";
      });
      audit("复制整包出库运单号", `${records.length} 件 · 待粘贴到麦稀奇`);
      save();
      renderShippingDialog(record, false);
      render();
      notify("运单号已复制；粘贴到麦稀奇后，请回来确认已回填");
    } catch {
      notify("浏览器未允许复制，请手动选择运单号", "error");
    }
  });

  $("#shipping-copy-pickup-code").addEventListener("click", async () => {
    const record = activeShippingRecords()[0];
    if (!record?.pickupCode) return;
    try {
      await copyText(record.pickupCode);
      audit("复制取件码", `${carrierLabel(record.shippingCarrier)} · ${record.pickupCode}`);
      notify("取件码已复制");
    } catch {
      notify("浏览器未允许复制，请手动选择取件码", "error");
    }
  });

  $("#shipping-confirm-fill").addEventListener("click", () => {
    const records = activeShippingRecords();
    const record = records[0];
    if (!record?.outboundTrackingNumber || records.every((item) => item.mxiqiShippingStatus === "filled")) return;
    const filledAt = new Date().toISOString();
    records.forEach((item) => Object.assign(item, {mxiqiShippingStatus:"filled",mxiqiFilledAt:filledAt}));
    audit("确认整包麦稀奇回填", `${records.length} 件 · ${record.outboundTrackingNumber}`);
    save();
    renderShippingDialog(record, false);
    render();
    notify(`该包裹 ${records.length} 件拍品均已标记为麦稀奇回填完成`);
  });

  $("#new-record").addEventListener("click", () => openEditor());
  ["sellerWechat","itemName","birthdayMonth","auctionAt","finalPrice","commissionOverrideValue","settlementAdjustment"].forEach((name) => editForm.elements[name].addEventListener("input", previewCommission));
  editForm.elements.commissionOverrideType.addEventListener("change", () => {
    updateCommissionOverrideControls();
    previewCommission();
  });
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(editForm);
    const existing = state.records.find((item) => item.id === state.editingId) || {};
    const birthdayMonth = Number(data.get("birthdayMonth") || 0);
    const sellerWechat = String(data.get("sellerWechat") || "").trim();
    const sellerPhoneInput = String(data.get("sellerPhone") || "").trim();
    const sellerPhone = MxiqiAssets.normalizePhone(sellerPhoneInput);
    const buyerPhoneInput = String(data.get("buyerPhone") || "").trim();
    const buyerPhone = MxiqiAssets.normalizePhone(buyerPhoneInput);
    const recipientRaw = String(data.get("recipientRaw") || "").trim();
    const parsedRecipient = recipientRaw ? splitRecipientAddress(recipientRaw) : {};
    const recipientPhoneInput = String(data.get("recipientPhone") || "").trim();
    const recipientPhone = MxiqiAssets.normalizePhone(recipientPhoneInput) || parsedRecipient.recipientPhone || "";
    if (sellerPhoneInput && !sellerPhone) {
      notify("送拍人手机号应为 11 位中国大陆手机号", "error");
      return;
    }
    if (buyerPhoneInput && !buyerPhone) {
      notify("买家登录手机号应为 11 位中国大陆手机号", "error");
      return;
    }
    if (recipientPhoneInput && !recipientPhone) {
      notify("收件手机号应为 11 位中国大陆手机号", "error");
      return;
    }
    if (sellerWechat) state.customers[sellerWechat] = {
      ...(state.customers[sellerWechat] || {}),
      birthdayMonth,
      phone:sellerPhone || state.customers[sellerWechat]?.phone || "",
      lastContactedAt:latestCustomerDate(state.customers[sellerWechat]?.lastContactedAt, data.get("contactedAt")),
    };
    const requestedDisposition = String(data.get("returnDisposition") || "");
    let record = {
      ...existing,
      id: existing.id || uid(),
      lot: Number(data.get("lot")),
      itemName: String(data.get("itemName") || "").trim(),
      auctionHouse: String(data.get("auctionHouse") || ""),
      auctionAt: String(data.get("auctionAt") || ""),
      auctionPeriodOverride: String(data.get("auctionPeriodOverride") || "").trim(),
      lotLabel: String(data.get("lotLabel") || ""),
      projectName: String(data.get("projectName") || ""),
      startPrice: Number(data.get("startPrice") || 0),
      finalPrice: Number(data.get("finalPrice") || 0),
      finalOutcome: String(data.get("finalOutcome") || ""),
      paymentStatus: String(data.get("paymentStatus") || ""),
      paymentDueAt: String(data.get("paymentDueAt") || ""),
      returnDisposition: requestedDisposition === "上拍" ? String(existing.returnDisposition || "") : requestedDisposition,
      returnDispositionConfirmedAt: MxiqiWorkflow.isHandledReturnDisposition(requestedDisposition) ? new Date().toISOString() : "",
      returnDispositionReviewRequiredAt: "",
      primaryCategory: String(data.get("primaryCategory") || ""),
      secondaryCategory: String(data.get("secondaryCategory") || ""),
      sellerWechat,
      sellerPhone,
      buyerName: String(data.get("buyerName") || "").trim(),
      buyerPhone,
      recipientRaw,
      recipientName: String(data.get("recipientName") || "").trim() || parsedRecipient.recipientName || "",
      recipientPhone,
      addressProvince: parsedRecipient.addressProvince || existing.addressProvince || "",
      addressCity: parsedRecipient.addressCity || existing.addressCity || "",
      addressDistrict: parsedRecipient.addressDistrict || existing.addressDistrict || "",
      addressDetail: parsedRecipient.addressDetail || existing.addressDetail || "",
      mxiqiOrderId: String(data.get("mxiqiOrderId") || existing.mxiqiOrderId || "").trim(),
      birthdayMonth,
      contactedAt: String(data.get("contactedAt") || ""),
      coinBoxId: String(data.get("coinBoxId") || ""),
      trackingNumber: String(data.get("trackingNumber") || ""),
      received: String(data.get("received") || "待确认"),
      settlementNote: String(data.get("settlementNote") || ""),
      commissionOverrideType: ["percent", "fixed"].includes(String(data.get("commissionOverrideType") || "")) ? String(data.get("commissionOverrideType")) : "",
      commissionOverrideValue: Number(data.get("commissionOverrideValue") || 0),
      commissionOverrideNote: String(data.get("commissionOverrideNote") || "").trim(),
      settlementAdjustment: roundMoney(Number(data.get("settlementAdjustment") || 0)),
      unpaidReturn: Boolean(existing.unpaidReturn),
      unpaidReturnDetectedAt: String(existing.unpaidReturnDetectedAt || ""),
      settled: data.get("settled") === "on",
      carrierOverride: String(data.get("carrierOverride") || ""),
    };
    if (requestedDisposition === "上拍" && !["成交", "流拍"].includes(record.finalOutcome)) record = MxiqiWorkflow.relistRecord(record);
    else if (requestedDisposition === "上拍") {
      record.returnDisposition = "";
      record.relisted = true;
    } else record.relisted = false;
    record = MxiqiWorkflow.applyManualPaymentResolution(record, existing);
    ensurePaymentTracking(record);
    if (!Number.isInteger(record.lot) || record.lot <= 0 || !record.itemName) {
      notify("请填写有效 Lot 和拍品名称", "error");
      return;
    }
    let duplicateCopies = state.records.filter((item) => item.id !== record.id && MxiqiWorkflow.sameAuctionLot(item, record));
    let recoveredDuplicateEdit = false;
    if (duplicateCopies.length && !existing.id) {
      const canonical = duplicateCopies[0];
      record = {...MxiqiWorkflow.mergePreservingConsignor(canonical, record), id:canonical.id};
      state.editingId = canonical.id;
      duplicateCopies = duplicateCopies.slice(1);
      recoveredDuplicateEdit = true;
    }
    record = duplicateCopies.reduce((merged, item) => MxiqiWorkflow.mergeAuctionRecordCopies(merged, item), record);
    const duplicateIds = new Set(duplicateCopies.map((item) => item.id));
    if (record.settled && !existing.settled) {
      const candidateRecords = state.records
        .filter((item) => !duplicateIds.has(item.id))
        .map((item) => item.id === record.id ? record : item);
      if (!requireSettlementReady(auctionPeriod(record), candidateRecords)) return;
    }
    recalculateRecord(record, true);
    if (record.settled) record.settledAt = existing.settledAt || new Date().toISOString();
    if (duplicateIds.size) {
      state.records = state.records.filter((item) => !duplicateIds.has(item.id));
      remapRecordReferences(Object.fromEntries([...duplicateIds].map((id) => [id, record.id])));
    }
    const index = state.records.findIndex((item) => item.id === record.id);
    if (index >= 0) state.records[index] = record;
    else state.records.push({...record,carrier:"pending",logisticsStatus:"not_requested",pickupCode:""});
    const savedIdentity = consignorIdentity(record).key;
    state.records.filter((item) => !item.settled && consignorIdentity(item).key === savedIdentity).forEach((item) => recalculateRecord(item));
    syncStoredAssetsFromRecords();
    rematchAssetsAndApply();
    audit("保存拍品", `Lot ${record.lot} · ${record.itemName}`);
    save();
    editDialog.close();
    render();
    notify(recoveredDuplicateEdit
      ? `Lot ${record.lot} 已合并更新，佣金已自动计算`
      : `Lot ${record.lot} 已保存，佣金已自动计算`);
  });

  $("#open-assets").addEventListener("click", openAssets);
  $("#open-customers").addEventListener("click", () => openCustomerDirectory());
  $("#customer-search").addEventListener("input", (event) => {
    state.customerQuery = event.target.value;
    renderCustomerDirectory(state.editingCustomer);
  });
  $("#customer-list").addEventListener("click", (event) => {
    const button = event.target.closest("[data-customer-key]");
    if (!button) return;
    renderCustomerDirectory(button.dataset.customerKey);
  });
  $("#new-customer").addEventListener("click", () => {
    state.editingCustomer = "";
    fillCustomerProfile(null);
    customerForm.elements.sellerWechat.focus();
  });
  $("#export-customer-image").addEventListener("click", () => { void exportCustomerImage(); });
  customerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(customerForm);
    const originalWechat = String(data.get("originalWechat") || "").trim();
    const sellerWechat = String(data.get("sellerWechat") || "").trim();
    const phoneInput = String(data.get("phone") || "").trim();
    const phone = normalizeCustomerPhone(phoneInput);
    const birthdayMonth = Number(data.get("birthdayMonth") || 0);
    if (!sellerWechat) return notify("请填写送拍人微信昵称", "error");
    if (phoneInput && !phone) return notify("送拍人手机号应为 11 位中国大陆手机号", "error");
    const directoryBefore = customerDirectoryEntries();
    const previousEntry = directoryBefore.find((entry) => entry.key === state.editingCustomer || entry.wechat === originalWechat || entry.aliases.includes(originalWechat));
    const samePhoneEntry = phone ? directoryBefore.find((entry) => entry.key === `phone:${phone}`) : null;
    const conflictingEntry = directoryBefore.find((entry) => entry.aliases.includes(sellerWechat) && entry.key !== previousEntry?.key && entry.key !== samePhoneEntry?.key);
    if (conflictingEntry) return notify("该微信昵称已属于另一个手机号档案，请先核对手机号", "error");
    const sourceEntries = [previousEntry, samePhoneEntry].filter(Boolean);
    const sourceKeys = new Set(sourceEntries.map((entry) => entry.key));
    const aliases = new Set(sourceEntries.flatMap((entry) => entry.aliases || []));
    if (originalWechat) aliases.add(originalWechat);
    aliases.add(sellerWechat);
    const matchesIdentity = (source) => {
      const sourcePhone = normalizeCustomerPhone(source.sellerPhone || source.phone);
      return sourceKeys.has(consignorIdentity(source).key)
        || aliases.has(String(source.sellerWechat || source.wechat || "").trim())
        || Boolean(phone && sourcePhone === phone);
    };
    const mergedProfiles = sourceEntries.flatMap((entry) => entry.aliases || []).map((alias) => state.customers[alias]).filter(Boolean);
    const previous = mergedProfiles.sort((left, right) => String(right.updatedAt || right.lastContactedAt || "").localeCompare(String(left.updatedAt || left.lastContactedAt || "")))[0] || (originalWechat ? state.customers[originalWechat] || {} : {});
    Object.entries(state.customers).forEach(([alias, profile]) => {
      if (aliases.has(alias) || (phone && normalizeCustomerPhone(profile?.phone) === phone)) delete state.customers[alias];
    });
    state.customers[sellerWechat] = {
      ...previous,
      phone,
      birthdayMonth,
      birthdayPending:birthdayMonth ? false : Boolean(previous.birthdayPending),
      lastContactedAt:String(data.get("lastContactedAt") || ""),
      notes:String(data.get("notes") || "").trim(),
      updatedAt:new Date().toISOString(),
    };
    state.records.forEach((record) => {
      if (!matchesIdentity(record)) return;
      record.sellerWechat = sellerWechat;
      record.sellerPhone = phone;
      record.birthdayMonth = birthdayMonth;
      if (birthdayMonth) record.birthdayPending = false;
      if (!record.settled) recalculateRecord(record);
    });
    state.assets.forEach((asset) => {
      if (!matchesIdentity(asset)) return;
      asset.sellerWechat = sellerWechat;
      asset.sellerPhone = phone;
    });
    state.editingCustomer = phone ? `phone:${phone}` : `wechat:${sellerWechat}`;
    audit("保存送拍人档案", `${sellerWechat} · ${phone || "手机号待补"}${birthdayMonth ? ` · ${birthdayMonth} 月生日` : ""}`);
    render();
    renderCustomerDirectory(state.editingCustomer);
    notify(`${sellerWechat} 的本地档案已保存`);
  });
  $("#asset-sync-orders").addEventListener("click", () => { void syncConsignmentOrdersFromAssets(); });
  $("#asset-excel-file").addEventListener("change", async (event) => {
    const files = [...event.target.files];
    $("#asset-file-name").textContent = files.length ? files.map((file) => file.name).join("、") : "选择寄存或外拍 Excel";
    if (!files.length) return;
    try {
      await importAssetFiles(files);
      event.target.value = "";
    } catch (error) {
      notify(error.message || "寄存/库存导入失败", "error");
    }
  });
  $("#asset-rematch").addEventListener("click", () => {
    rematchAssetsAndApply();
    audit("重新匹配寄存库存", `${state.assets.length} 条资料`);
    save();
    renderAssetPanel();
    notify("已重新执行自动匹配；人工确认结果保持不变", "info");
  });
  $$('[data-asset-filter]').forEach((button) => button.addEventListener("click", () => {
    state.assetFilter = button.dataset.assetFilter;
    renderAssetPanel();
  }));
  $("#asset-search").addEventListener("input", (event) => {
    state.assetQuery = event.target.value;
    renderAssetPanel();
  });
  $("#asset-clear-filter").addEventListener("click", () => {
    state.assetFilter = "all";
    state.assetQuery = "";
    renderAssetPanel();
  });
  $("#asset-select-all").addEventListener("change", (event) => {
    assetVisibleRows().forEach((asset) => {
      if (event.target.checked) state.selectedAssets.add(asset.id);
      else state.selectedAssets.delete(asset.id);
    });
    renderAssetPanel();
  });
  $("#asset-clear-selection").addEventListener("click", () => {
    state.selectedAssets.clear();
    renderAssetPanel();
  });
  $("#asset-batch-delete").addEventListener("click", () => {
    const selectedIds = new Set([...state.selectedAssets].filter((assetId) => state.assets.some((asset) => asset.id === assetId)));
    if (!selectedIds.size) return;
    if (!confirm(`确定删除已选的 ${selectedIds.size} 条寄存/库存记录吗？\n\n只会删除这里的导入记录，不会删除主工作台拍品。此操作无法撤销。`)) return;
    state.assets = state.assets.filter((asset) => !selectedIds.has(asset.id));
    state.selectedAssets.clear();
    audit("批量删除寄存库存", `${selectedIds.size} 条寄存/库存记录`);
    save();
    renderAssetPanel();
    notify(`已删除 ${selectedIds.size} 条寄存/库存记录`, "info");
  });
  $("#asset-body").addEventListener("change", (event) => {
    const selectedGroupKey = event.target.dataset.assetGroupSelect;
    if (selectedGroupKey) {
      const group = MxiqiAssets.groupAssetsByBuyer(state.assets).find((item) => item.key === selectedGroupKey);
      group?.assets.forEach((asset) => {
        if (event.target.checked) state.selectedAssets.add(asset.id);
        else state.selectedAssets.delete(asset.id);
      });
      renderAssetPanel();
      return;
    }
    const selectedAssetId = event.target.dataset.assetSelect;
    if (selectedAssetId) {
      if (event.target.checked) state.selectedAssets.add(selectedAssetId);
      else state.selectedAssets.delete(selectedAssetId);
      renderAssetPanel();
      return;
    }
    const assetId = event.target.dataset.assetMatch;
    if (!assetId) return;
    const asset = state.assets.find((item) => item.id === assetId);
    if (!asset) return;
    const record = state.records.find((item) => item.id === event.target.value);
    if (!record) {
      asset.matchedRecordId = "";
      asset.matchStatus = "unmatched";
      asset.matchScore = 0;
      asset.matchReason = "用户选择稍后处理";
      audit("取消寄存库存匹配", asset.itemName);
    } else {
      asset.matchedRecordId = record.id;
      asset.matchStatus = "manual";
      asset.matchScore = 999;
      asset.matchReason = `人工确认 · Lot ${record.lot}`;
      if (asset.personRole === "buyer") {
        record.buyerName ||= MxiqiAssets.assetBuyerName(asset);
        record.buyerPhone ||= MxiqiAssets.assetBuyerPhone(asset);
        record.recipientName ||= asset.recipientName || "";
        record.recipientPhone ||= asset.recipientPhone || record.buyerPhone || "";
        if (!record.recipientRaw && (asset.recipientRaw || asset.address)) Object.assign(record, splitRecipientAddress(asset.recipientRaw || asset.address));
      } else {
        if (!record.sellerPhone && asset.sellerPhone) record.sellerPhone = asset.sellerPhone;
        if (!record.sellerWechat && asset.sellerWechat && asset.sellerWechat !== "手机号用户") record.sellerWechat = asset.sellerWechat;
        if (record.sellerWechat) state.customers[record.sellerWechat] = {...(state.customers[record.sellerWechat] || {}), phone:record.sellerPhone || ""};
      }
      audit("人工匹配寄存库存", `${asset.itemName} → Lot ${record.lot}`);
    }
    save();
    render();
    renderAssetPanel();
  });

  $("#asset-body").addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-asset-group-toggle]");
    if (toggle) {
      const key = toggle.dataset.assetGroupToggle;
      if (state.expandedAssetGroups.has(key)) state.expandedAssetGroups.delete(key);
      else state.expandedAssetGroups.add(key);
      renderAssetPanel();
      return;
    }
    const ship = event.target.closest("[data-asset-group-ship]");
    if (!ship) return;
    const group = MxiqiAssets.groupAssetsByBuyer(state.assets).find((item) => item.key === ship.dataset.assetGroupShip);
    if (!group || group.assetType !== "consignment" || group.completed) return;
    if (!confirm(`确认将 ${group.buyerName} 的 ${group.assets.length} 件寄存商品标记为已发货吗？\n\n记录会保留并移动到列表底部。`)) return;
    const shippedAt = new Date().toISOString();
    group.assets.forEach((asset) => {
      asset.storageShippingStatus = "completed";
      asset.storageShippedAt = shippedAt;
    });
    state.expandedAssetGroups.delete(group.key);
    audit("寄存整组发货", `${group.buyerName} · ${group.assets.length} 件`);
    save();
    renderAssetPanel();
    updateBackupSummary();
    notify(`已完成 ${group.buyerName} 的 ${group.assets.length} 件寄存发货，记录已移到列表底部`);
  });

  $("#open-import").addEventListener("click", () => importDialog.showModal());
  $("#excel-file").addEventListener("change", (event) => { $("#file-name").textContent = event.target.files[0]?.name || "选择 .xlsx / .json 文件"; });
  $("#import-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      let records = [];
      const file = $("#excel-file").files[0];
      const json = $("#json-input").value.trim();
      if (file) {
        const isJsonFile = /\.json$/i.test(file.name || "") || /\bjson\b/i.test(file.type || "");
        if (isJsonFile) {
          const parsed = JSON.parse(await file.text());
          records = Array.isArray(parsed) ? parsed : [parsed];
        } else records = await parseWorkbook(await file.arrayBuffer());
      }
      else if (json) {
        const parsed = JSON.parse(json);
        records = Array.isArray(parsed) ? parsed : [parsed];
      } else throw new Error("请选择 .xlsx / .json 文件或粘贴 JSON");
      if (!records.length) throw new Error("文件中没有可导入的数据行");
      const importMeta = records.importMeta || {};
      const importBatchId = uid();
      const importedAt = new Date().toISOString();
      records.filter((record) => record && typeof record === "object").forEach((record) => Object.assign(record, {importBatchId, importedAt}));
      const stats = upsert(records, {matchReauction:true});
      const statsText = `识别 ${stats.accepted} · 新增 ${stats.added} · 更新 ${stats.updated} · 跳过 ${stats.skipped} · 冲突已合并 ${stats.conflicts} · 再拍匹配 ${stats.reauctionMatched} · 再拍待确认 ${stats.reauctionReview}${importMeta.trackerOutcomeBlank ? ` · 成交结果空白 ${importMeta.trackerOutcomeBlank}` : ""}`;
      audit("导入数据", statsText);
      importDialog.close();
      $("#import-form").reset();
      $("#file-name").textContent = "选择 .xlsx / .json 文件";
      notify(`导入完成：${statsText}`);
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
  $("#connection-open-login").addEventListener("click", async () => {
    try {
      await MxiqiConnector.openLogin();
      notify("已打开麦稀奇官方登录页，登录完成后回到这里检查", "info");
    } catch (error) {
      window.open("https://www.mxiqi.com/user.login", "_blank", "noopener,noreferrer");
      notify("未检测到采集助手，已直接打开麦稀奇官方登录页", "info");
    }
  });
  $("#connection-login-submit").addEventListener("click", () => { void loginAndSync(); });
  $("#mxiqi-password").addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void loginAndSync();
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
  $("#connection-check").addEventListener("click", () => { void checkRealConnection(); });
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
  $("#sync-unpaid-orders").addEventListener("click", async () => {
    collectorRuntime.lastActivityAt = Date.now();
    const synced = await runCollector("payment");
    if (!synced) return;
    state.stage = "unpaid";
    state.filters.status = "";
    state.selected.clear();
    render();
  });
  $("#sync-settlement-orders").addEventListener("click", () => {
    collectorRuntime.lastActivityAt = Date.now();
    void runSettlementSync();
  });
  $("#reauction-export").addEventListener("click", () => $("#export-tracker").click());
  $("#collector-refresh").addEventListener("click", () => {
    collectorRuntime.lastActivityAt = Date.now();
    const pendingPeriod = state.filters.auction && state.records.some((record) => auctionPeriod(record) === state.filters.auction && isAuctionResultPending(record)) ? state.filters.auction : "";
    if (pendingPeriod && state.connection.status === "connected") void runSettlementSync();
    else void runCollector("manual");
  });
  $("#collector-start").addEventListener("click", startCollector);
  $("#collector-stop").addEventListener("click", () => stopCollector("已手动停止自动采集"));
  [["#collector-scope","scope"],["#collector-interval","intervalSeconds"],["#collector-idle","idleMinutes"]].forEach(([selector, key]) => {
    $(selector).addEventListener("change", (event) => {
      state.collector[key] = key === "scope" ? String(event.target.value) : Number(event.target.value);
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
      lowPriceThreshold: Math.max(0, Number(data.get("lowPriceThreshold") || 0)),
      lowPriceFee: Math.max(0, Number(data.get("lowPriceFee") || 0)),
      birthdayCommissionType: String(data.get("birthdayCommissionType")),
      birthdayCommissionValue: Math.max(-100, Math.min(100, Number(data.get("birthdayCommissionValue") || 0))),
      birthdayLabel: String(data.get("birthdayLabel") || "生日").trim(),
      boxRebateThreshold: Math.max(0, Number(data.get("boxRebateThreshold") || 0)),
      boxRebateKeywords: String(data.get("boxRebateKeywords") || "NGC,PCGS").trim(),
        boxRebateValue: Math.max(-100, Math.min(100, Number(data.get("boxRebateValue") || 0))),
      boxRebateThreshold2: Math.max(0, Number(data.get("boxRebateThreshold2") || 0)),
        boxRebateValue2: Math.max(-100, Math.min(100, Number(data.get("boxRebateValue2") || 0))),
      boxRebateThreshold3: Math.max(0, Number(data.get("boxRebateThreshold3") || 0)),
        boxRebateValue3: Math.max(-100, Math.min(100, Number(data.get("boxRebateValue3") || 0))),
      boxRebateThreshold4: Math.max(0, Number(data.get("boxRebateThreshold4") || 0)),
        boxRebateValue4: Math.max(-100, Math.min(100, Number(data.get("boxRebateValue4") || 0))),
      returnHandlingFee: Math.max(0, Number(data.get("returnHandlingFee") || 0)),
      sfThreshold: Math.max(0, Number(data.get("sfThreshold") || 0)),
      defaultGoodsName: String(data.get("defaultGoodsName") || "章牌").trim(),
      defaultPackageWeightKg: Math.max(0.01, Number(data.get("defaultPackageWeightKg") || 0.8)),
      logisticsGatewayUrl: String(data.get("logisticsGatewayUrl") || "").trim().replace(/\/+$/, ""),
      sfSenderName: String(data.get("sfSenderName") || "").trim(),
      sfSenderPhone: String(data.get("sfSenderPhone") || "").replace(/\D/g, ""),
      sfMonthlyAccount: String(data.get("sfMonthlyAccount") || "").trim(),
      sfSenderAddress: String(data.get("sfSenderAddress") || "").trim(),
      cainiaoSenderName: String(data.get("cainiaoSenderName") || "").trim(),
      cainiaoSenderPhone: String(data.get("cainiaoSenderPhone") || "").replace(/\D/g, ""),
      cainiaoSenderAddress: String(data.get("cainiaoSenderAddress") || "").trim(),
    };
    try {
      const operatorKey = String(data.get("logisticsOperatorKey") || "").trim();
      if (operatorKey) sessionStorage.setItem(LOGISTICS_OPERATOR_KEY, operatorKey);
      else sessionStorage.removeItem(LOGISTICS_OPERATOR_KEY);
    } catch {}
    logisticsRuntime.checked = false;
    state.records.filter((record) => !record.settled || isStorageRecord(record)).forEach((record) => recalculateRecord(record, isStorageRecord(record)));
    const tiers = MxiqiCommission.rebateTiers(state.settings);
    audit("更新佣金规则", `默认 ${formatRule(state.settings.defaultCommissionType, state.settings.defaultCommissionValue)}；低价 ${currency.format(state.settings.lowPriceFee)}；生日 ${formatRule(state.settings.birthdayCommissionType, state.settings.birthdayCommissionValue)}；NP优惠 ${tiers.length ? tiers.map((tier) => `${currency.format(tier.threshold)}/${tier.value}%`).join("、") : "未启用"}`);
    save();
    settingsDialog.close();
    render();
    notify("佣金规则已保存，未结账记录已重新计算");
    checkLogisticsConnection();
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
    renderAuditDialog();
    auditDialog.showModal();
  });
  $("#undo-target").addEventListener("change", (event) => {
    $("#undo-operation").disabled = !event.target.value;
  });
  $("#undo-operation").addEventListener("click", () => {
    const entry = state.history.find((item) => item.id === $("#undo-target").value);
    restoreHistoryEntry(entry);
  });

  $("#reset-demo").addEventListener("click", () => {
    if (!confirm("确定恢复示例数据？当前浏览器中的体验修改将被清除。建议先下载完整备份。")) return;
    state.records = clone(seedRecords);
    state.assets = [];
    state.audit = [];
    state.settings = clone(defaultSettings);
    state.customers = clone(seedCustomers);
    state.collector = clone(defaultCollector);
    state.connection = clone(defaultConnection);
    collectorRuntime.running = false;
    collectorRuntime.busy = false;
    collectorRuntime.nextRunAt = 0;
    state.selected.clear();
    state.selectedAssets.clear();
    state.expandedAssetGroups.clear();
    save();
    audit("恢复示例数据", "拍品、寄存库存、规则和登录状态已重置");
    render();
    renderConnectionPanel();
    renderCollectorPanel();
    notify("已恢复示例拍品，寄存/库存已清空，规则和登录状态已重置");
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
      for (let rowNo = 1; rowNo <= Math.min(sheet.rowCount || 1, 30); rowNo += 1) {
        const map = headerMap(sheet.getRow(rowNo));
        if (column(map, "Lot") && column(map, "拍品名称")) { found = {kind:"mxiqi",sheet,rowNo,map}; break; }
        if (column(map, "送拍人（微信名）", "送拍人微信名") && column(map, "拍场/Lot", "拍场Lot")) { found = {kind:"tracker",sheet,rowNo,map}; break; }
      }
      if (found) break;
    }
    if (!found) throw new Error("无法识别表格，请使用送拍跟踪表或麦稀奇 v3.7 模板");
    const records = [];
    let trackerOutcomeBlank = 0;
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
        const price = numberAt(row, found.map, "拍出价格/拖回");
        const rawAuctionAt = textAt(row, found.map, "上拍时间（拍卖时间）", "上拍时间拍卖时间");
        const auctionAt = MxiqiWorkflow.correctKnown0806AuctionText(rawAuctionAt);
        const sellerRaw = textAt(row, found.map, "送拍人（微信名）", "送拍人微信名");
        const seller = MxiqiAssets.parseConsignorLabel(
          sellerRaw,
          textAt(row, found.map, "送拍人手机号", "手机号", "电话"),
          auctionAt,
        );
        const received = textAt(row, found.map, "是/否收到", "是否收到");
        const settledText = textAt(row, found.map, "是/否已结账", "是否已结账");
        const normalizedOutcome = outcome ? MxiqiWorkflow.trackerOutcome(outcome, price) : null;
        if (lot > 0 && projectName) {
          if (!outcome) trackerOutcomeBlank += 1;
          records.push(compact({
            lot,
            itemName:projectName,
            projectName,
            lotLabel,
            auctionHouse:lotLabel.split(/[\/／]/)[0].trim(),
            sellerWechat:seller.wechat,
            sellerPhone:seller.phone,
            birthdayMonth:seller.birthdayMonth,
            birthdayPending:seller.birthdayPending,
            contactedAt:textAt(row,found.map,"联系时间"),
            coinBoxId:textAt(row,found.map,"盒子币编号"),
            trackingNumber:textAt(row,found.map,"快递单号"),
            auctionAt,
            auctionPeriodOverride:MxiqiWorkflow.trackerAuctionPeriod(auctionAt),
            received,
            finalOutcome:normalizedOutcome?.finalOutcome,
            returnDisposition:normalizedOutcome?.returnDisposition,
            finalPrice:normalizedOutcome ? (normalizedOutcome.finalOutcome === "成交" ? price : 0) : undefined,
            settled:settledText ? settledText === "是" : undefined,
            settlementNote:textAt(row,found.map,"结账"),
          }));
        }
      }
    }
    if (found.kind === "tracker" && column(found.map, "送拍人手机号", "手机号", "电话")) {
      let recordIndex = 0;
      for (let rowNo = found.rowNo + 1; rowNo <= found.sheet.rowCount; rowNo += 1) {
        const row = found.sheet.getRow(rowNo);
        const lotLabel = textAt(row, found.map, "拍场/Lot", "拍场Lot");
        const projectName = textAt(row, found.map, "送拍项目");
        if (lotFromLabel(lotLabel) > 0 && projectName && records[recordIndex]) {
          const phone = MxiqiAssets.normalizePhone(textAt(row, found.map, "送拍人手机号", "手机号", "电话"));
          if (phone) records[recordIndex].sellerPhone = phone;
          recordIndex += 1;
        }
      }
    }
    records.importMeta = {kind:found.kind, trackerOutcomeBlank};
    return records;
  }

  async function exportTracker() {
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Sheet1");
      const headers = ["送拍人（微信名）","送拍人手机号","联系时间","送拍项目","盒子币编号","快递单号","上拍时间（拍卖时间）","拍场/Lot","是/否收到","拍出价格/拖回","送拍佣金","结款金额","是/否已结账","适用优惠方案","结账","利润（不包含邮费）"];
      sheet.addRow([null, ...headers]);
      state.records.forEach((record) => sheet.addRow([null,record.sellerWechat || null,record.sellerPhone || null,record.contactedAt || null,record.projectName || record.itemName,record.coinBoxId || null,record.trackingNumber || null,record.auctionAt || null,record.lotLabel || `${record.auctionHouse || ""} / Lot ${record.lot}`,record.received || "待确认",record.returnDisposition || (record.finalOutcome === "拖回" ? "拖回" : record.finalPrice || null),record.commissionAmount || null,record.settlementAmount || null,record.settled ? "是" : "否",record.promotion || null,record.settlementNote || null,record.profit || null]));
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
    if (!requireSettlementReady()) return;
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
        ["拍卖期数", state.filters.auction || "全部期数"],
        ["拍卖时间范围", `${state.settlementScope.from || "不限"} 至 ${state.settlementScope.to || "不限"}`],
        ["结算笔数", sold.length],
        ["成交件数", sold.filter((record) => !isReturnRecord(record)).length],
        ["成交总额", sold.reduce((sum, record) => sum + settlementGross(record), 0)],
        ["未付款拖回扣费", sold.filter((record) => record.unpaidReturn).reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0)],
        ["佣金 / 返佣合计", sold.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0)],
        ["额外加减款", sold.reduce((sum, record) => sum + Number(record.settlementAdjustment || 0), 0)],
        ["应结金额", sold.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0)],
      ]);
      summary.addRow([]);
      summary.addRow(["送拍人","送拍人手机号","拍品数","Lot","拍卖期数与时间","成交总额","佣金 / 返佣","额外加减款","应结金额"]);
      settlementGroups(sold).forEach((group) => {
        const records = group.records;
        const periods = [...new Set(records.map((record) => [auctionPeriod(record), datePart(record.auctionAt || record.platformOrderDate) || "时间待补"].join(" · ")))];
        summary.addRow([
          group.seller,
          group.phone || "",
          records.length,
          records.map((record) => record.lot).join("、"),
          periods.join("；"),
          records.reduce((sum, record) => sum + settlementGross(record), 0),
          records.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0),
          records.reduce((sum, record) => sum + Number(record.settlementAdjustment || 0), 0),
          records.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0),
        ]);
      });
      summary.getColumn(1).width = 18;
      summary.getColumn(2).width = 18;
      summary.getColumn(3).width = 10;
      summary.getColumn(4).width = 24;
      summary.getColumn(5).width = 42;
      summary.getColumn(6).width = 14;
      summary.getColumn(7).width = 14;
      summary.getColumn(8).width = 14;
      summary.getColumn(9).width = 14;
      summary.getRow(1).font = {bold:true,size:16};
      summary.getRow(summary.rowCount).font = {bold:true};
      const detail = workbook.addWorksheet("结算明细");
      detail.addRow(["送拍人","送拍人手机号","Lot","拍品名称","拍卖期数/项目","拍卖时间","成交价","买家付款","拍品状态","优惠标识","佣金规则","送拍佣金","额外加减款","应结金额","结账时间","结账说明"]);
      settlementGroups(sold).forEach((group) => group.records.forEach((record) => {
        const returnFeeLabel = record.unpaidReturn
          ? `未付款拖回扣 ${currency.format(state.settings.returnHandlingFee || 0)}`
          : isReturnRecord(record) ? `拖回扣 ${currency.format(state.settings.returnHandlingFee || 0)}` : "";
        const flags = [
          birthdayMonthFor(record) === auctionMonth(record) ? "生日" : "",
          hasAppliedBoxRebate(record) ? `NP优惠 ${Math.abs(Number(commissionPlan(record).value || 0))}%` : "",
          returnFeeLabel,
        ].filter(Boolean).join("、");
        detail.addRow([group.seller,group.phone || "",record.lot,record.itemName,auctionPeriod(record),record.auctionAt || record.platformOrderDate || "",settlementGross(record),record.paymentStatus || "",record.unpaidReturn ? "未付款拖回" : recordStatus(record),flags,record.promotion || "",record.commissionAmount || 0,record.settlementAdjustment || 0,record.settlementAmount || 0,record.settledAt ? new Date(record.settledAt).toLocaleString("zh-CN") : "",record.settlementNote || ""]);
      }));
      detail.getRow(1).font = {bold:true};
      detail.views = [{state:"frozen",ySplit:1}];
      [18,18,8,32,24,20,14,14,16,16,24,14,14,14,21,24].forEach((width, index) => { detail.getColumn(index + 1).width = width; });
      downloadBlob(await workbook.xlsx.writeBuffer(), `送拍结算表_${new Date().toISOString().slice(0,10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      audit("导出结算表", `${sold.length} 条已结账记录`);
      notify("结算表已导出");
    } catch (error) { notify(error.message || "结算表导出失败", "error"); }
  }

  function exportSettlementImage() {
    if (!requireSettlementReady()) return;
    const sold = settlementRecords();
    if (!sold.length || sold.some((record) => !record.settled)) {
      notify("还有未结账记录，暂不能导出结算明细图片", "error");
      return;
    }
    const width = 1700;
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
    const scopeEntry = customerDirectoryEntries().find((entry) => entry.key === state.settlementScope.seller || entry.wechat === state.settlementScope.seller);
    const scopeSeller = state.settlementScope.seller ? `${consignorDisplayName(state.settlementScope.seller)}${scopeEntry?.phone ? ` / ${scopeEntry.phone}` : ""}` : "全部";
    context.fillText(`送拍人：${scopeSeller}　时间：${state.settlementScope.from || "不限"} 至 ${state.settlementScope.to || "不限"}`, 50, 158);
    const gross = sold.reduce((sum, record) => sum + settlementGross(record), 0);
    const commission = sold.reduce((sum, record) => sum + Number(record.commissionAmount || 0), 0);
    const payable = sold.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0);
    const unpaidReturns = sold.filter((record) => record.unpaidReturn);
    context.font = 'bold 22px "Microsoft YaHei", sans-serif';
    context.fillText(`${sold.length} 笔　成交 ${currency.format(gross)}　佣金 ${currency.format(commission)}　应结 ${currency.format(payable)}　未付款拖回 ${unpaidReturns.length} 笔`, 50, 204);

    const columns = [
      {label:"Lot",x:50,width:80},
      {label:"拍品名称",x:130,width:320},
      {label:"送拍人 / 手机号",x:450,width:260},
      {label:"拍卖时间",x:710,width:180},
      {label:"成交价",x:890,width:130},
      {label:"佣金",x:1020,width:150},
      {label:"加减款",x:1170,width:130},
      {label:"应结金额",x:1300,width:160},
      {label:"处理状态",x:1460,width:190},
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
      const identity = consignorDirectoryEntry(record);
      const values = [record.lot,truncate(record.itemName,19),truncate(`${identity.wechat || "待补"} / ${identity.phone || "手机号待补"}`,20),truncate(record.auctionAt,14),currency.format(settlementGross(record)),formatSettlementAdjustment(record.commissionAmount || 0),currency.format(record.settlementAdjustment || 0),currency.format(record.settlementAmount || 0),truncate(record.unpaidReturn ? "未付款拖回扣费" : record.returnDisposition || "已结账",10)];
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

  let checklistLogoPromise;

  function loadChecklistLogo() {
    if (!checklistLogoPromise) checklistLogoPromise = new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = `./zhenzhenpu-logo.jpg?v=49`;
    });
    return checklistLogoPromise;
  }

  function drawChecklistLogo(context, width, logo) {
    if (!logo) return;
    context.fillStyle = "#fff";
    context.fillRect(width - 154, 10, 106, 94);
    const cropX = Math.round(logo.width * 0.08);
    const cropY = Math.round(logo.height * 0.1);
    const cropSize = Math.round(Math.min(logo.width, logo.height) * 0.76);
    context.drawImage(logo, cropX, cropY, cropSize, cropSize, width - 148, 13, 94, 88);
  }

  function checklistPeriod(records) {
    if (state.filters.auction) return state.filters.auction;
    const periods = [...new Set(records.map(auctionPeriod).filter((value) => value && value !== "期数待补"))];
    if (periods.length === 1) return periods[0];
    return periods.length ? "多期" : "全部期数";
  }

  async function exportChecklistImage(records, options) {
    const sorted = [...records].sort((left, right) => consignorIdentity(left).key.localeCompare(consignorIdentity(right).key, "zh-CN") || Number(left.lot) - Number(right.lot));
    const width = 1700;
    const rowHeight = 58;
    const headerHeight = 224;
    const footerHeight = 58;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = headerHeight + rowHeight * (sorted.length + 1) + footerHeight;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f7f5ef";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#102735";
    context.fillRect(0, 0, width, 112);
    context.fillStyle = "#f7ead0";
    context.font = 'bold 34px "Microsoft YaHei", sans-serif';
    context.fillText(options.title, 48, 68);
    const logo = await loadChecklistLogo();
    drawChecklistLogo(context, width, logo);
    context.fillStyle = "#314b57";
    context.font = '20px "Microsoft YaHei", sans-serif';
    context.fillText(`拍卖期数：${options.period}　送拍人：${options.seller}`, 48, 152);
    context.font = 'bold 22px "Microsoft YaHei", sans-serif';
    context.fillText(`${consignorCount(sorted)} 位送拍人　${sorted.length} 件拍品`, 48, 196);
    const columns = [
      {label:"送拍人",x:48,width:240},
      {label:"Lot",x:288,width:110},
      {label:"拍品名称",x:398,width:760},
      {label:"拍卖期数",x:1158,width:190},
      {label:"送拍人手机号",x:1348,width:304},
    ];
    context.fillStyle = "#e8e5dd";
    context.fillRect(36, headerHeight, width - 72, rowHeight);
    context.fillStyle = "#52636c";
    context.font = 'bold 18px "Microsoft YaHei", sans-serif';
    columns.forEach((column) => context.fillText(column.label, column.x + 10, headerHeight + 37));
    const truncate = (value, max) => String(value || "").length > max ? `${String(value).slice(0, max - 1)}…` : String(value || "");
    sorted.forEach((record, index) => {
      const y = headerHeight + rowHeight * (index + 1);
      context.fillStyle = index % 2 ? "#f1efe9" : "#fffefa";
      context.fillRect(36, y, width - 72, rowHeight);
      context.fillStyle = "#213944";
      context.font = '17px "Microsoft YaHei", sans-serif';
      const identity = consignorDirectoryEntry(record);
      const values = [truncate(identity.wechat || "待补送拍人",12),record.lot,truncate(record.itemName,40),auctionPeriod(record),identity.phone || record.sellerPhone || "手机号待补"];
      values.forEach((value, columnIndex) => context.fillText(String(value), columns[columnIndex].x + 10, y + 37));
    });
    context.fillStyle = "#7b898f";
    context.font = '14px "Microsoft YaHei", sans-serif';
    context.fillText(`生成时间：${new Date().toLocaleString("zh-CN")} · 送拍运营工作台`, 48, canvas.height - 22);
    canvas.toBlob((blob) => {
      if (!blob) return notify(options.failureMessage, "error");
      const period = options.period.replace(/[^\w\u4e00-\u9fa5-]/g, "");
      downloadBlob(blob, `${options.filePrefix}_${period}_${new Date().toISOString().slice(0,10)}.png`, "image/png");
      audit(options.auditLabel, `${sorted.length} 件拍品`);
      notify(options.successMessage);
    }, "image/png");
  }

  function exportPreauctionImage() {
    const records = visibleRecords().filter(isPreauctionRecord);
    if (!records.length) {
      notify("当前筛选下没有可导出的拍前核对记录", "error");
      return;
    }
    const period = checklistPeriod(records);
    exportChecklistImage(records, {
      title:"拍前核对完整清单",
      period,
      seller:consignorDisplayName(state.filters.seller),
      filePrefix:"拍前核对",
      auditLabel:"导出拍前核对图片",
      successMessage:"完整拍前核对图片已下载",
      failureMessage:"核对图片生成失败",
    });
  }

  function settlementPriceOrDisposition(record) {
    if (isReturnRecord(record)) return record.returnDisposition || (record.unpaidReturn ? "拖回/等待" : "拖回");
    if (record.paymentStatus === "待付款") return `待付款 · ${currency.format(record.finalPrice || 0)}`;
    return currency.format(record.finalPrice || 0);
  }

  function settlementAuctionLot(record) {
    const venue = record.auctionHouse || String(record.lotLabel || "").split(/[\/／]/)[0].trim() || "拍场待补";
    return `${venue} · Lot ${record.lot || "待补"}`;
  }

  async function exportSettlementChecklistImage() {
    if (!requireSettlementReady()) return;
    const records = settlementRecords();
    if (!records.length || records.some((record) => !record.settled)) {
      notify("还有未结账记录，暂不能生成结款对账单", "error");
      return;
    }
    const period = checklistPeriod(records);
    const sorted = [...records].sort((left, right) => consignorIdentity(left).key.localeCompare(consignorIdentity(right).key, "zh-CN") || Number(left.lot) - Number(right.lot));
    const width = 2120;
    const rowHeight = 64;
    const headerHeight = 224;
    const footerHeight = 104;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = headerHeight + rowHeight * (sorted.length + 1) + footerHeight;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f7f5ef";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#102735";
    context.fillRect(0, 0, width, 112);
    context.fillStyle = "#f7ead0";
    context.font = 'bold 34px "Microsoft YaHei", sans-serif';
    context.fillText(`${period}结款对账单`, 48, 68);
    drawChecklistLogo(context, width, await loadChecklistLogo());
    context.fillStyle = "#314b57";
    context.font = '20px "Microsoft YaHei", sans-serif';
    context.fillText(`拍卖期数：${period}　送拍人：${consignorDisplayName(state.settlementScope.seller)}`, 48, 152);
    context.font = 'bold 22px "Microsoft YaHei", sans-serif';
    context.fillText(`${consignorCount(sorted)} 位送拍人　${sorted.length} 件结款拍品`, 48, 196);
    const columns = [
      {label:"送拍人 / 手机号",x:48,width:260},
      {label:"送拍项目（拍品标题）",x:308,width:560},
      {label:"上拍时间",x:868,width:190},
      {label:"拍场 Lot 号",x:1058,width:230},
      {label:"拍出价格 / 处理",x:1288,width:250},
      {label:"送拍佣金 / 调整",x:1538,width:230},
      {label:"结款金额",x:1768,width:300},
    ];
    context.fillStyle = "#e8e5dd";
    context.fillRect(36, headerHeight, width - 72, rowHeight);
    context.fillStyle = "#52636c";
    context.font = 'bold 18px "Microsoft YaHei", sans-serif';
    columns.forEach((column) => context.fillText(column.label, column.x + 10, headerHeight + 40));
    const truncate = (value, max) => String(value || "").length > max ? `${String(value).slice(0, max - 1)}…` : String(value || "");
    sorted.forEach((record, index) => {
      const y = headerHeight + rowHeight * (index + 1);
      context.fillStyle = index % 2 ? "#f1efe9" : "#fffefa";
      context.fillRect(36, y, width - 72, rowHeight);
      context.fillStyle = "#213944";
      context.font = '17px "Microsoft YaHei", sans-serif';
      const birthdayDiscount = birthdayMonthFor(record) > 0 && birthdayMonthFor(record) === auctionMonth(record);
      const promotion = birthdayDiscount
        ? "生日"
        : hasAppliedBoxRebate(record)
          ? "NP优惠"
          : String(record.promotion || (isReturnRecord(record) ? "拖回处理费" : "送拍佣金")).split(" · ")[0];
      const identity = consignorDirectoryEntry(record);
      const adjustment = Number(record.settlementAdjustment || 0);
      const values = [
        truncate(`${birthdayDiscount ? "🎂 " : ""}${identity.wechat || "待补送拍人"} / ${identity.phone || "手机号待补"}`, 20),
        truncate(record.itemName, 32),
        datePart(record.auctionAt || record.platformOrderDate) || "日期待补",
        truncate(settlementAuctionLot(record), 15),
        truncate(settlementPriceOrDisposition(record), 16),
        truncate(`${Number(record.commissionAmount || 0) < 0 ? "返佣" : "佣金"} ${formatSettlementAdjustment(record.commissionAmount || 0)} · ${promotion}${adjustment ? ` · 调整 ${adjustment > 0 ? "+" : ""}${currency.format(adjustment)}` : ""}`, 20),
        currency.format(record.settlementAmount || 0),
      ];
      values.forEach((value, columnIndex) => context.fillText(String(value), columns[columnIndex].x + 10, y + 40));
    });
    const totalSettlement = sorted.reduce((sum, record) => sum + Number(record.settlementAmount || 0), 0);
    const footerY = canvas.height - 38;
    context.fillStyle = "#7b898f";
    context.font = '14px "Microsoft YaHei", sans-serif';
    context.fillText(`生成时间：${new Date().toLocaleString("zh-CN")} · 送拍运营工作台`, 48, footerY);
    context.fillStyle = "#143f35";
    context.font = 'bold 30px "Microsoft YaHei", sans-serif';
    const totalText = `结款总金额：${currency.format(totalSettlement)}`;
    context.fillText(totalText, width - 48 - context.measureText(totalText).width, footerY);
    canvas.toBlob((blob) => {
      if (!blob) return notify("结款对账单生成失败", "error");
      const safePeriod = period.replace(/[^\w\u4e00-\u9fa5-]/g, "");
      downloadBlob(blob, `结款对账单_${safePeriod}_${new Date().toISOString().slice(0,10)}.png`, "image/png");
      audit("导出结款对账单", `${sorted.length} 件拍品 · ${totalText}`);
      notify(`${period}结款对账单已下载`);
    }, "image/png");
  }

  $("#export-tracker").addEventListener("click", exportTracker);
  $("#export-mxiqi").addEventListener("click", exportMxiqi);
  $("#export-settlement").addEventListener("click", () => {
    const remaining = settlementRecords().filter((record) => !record.settled);
    if (!remaining.length) return exportSettlement();
    state.settlementView = state.settlementView === "unsettled" ? "all" : "unsettled";
    state.selected.clear();
    render();
    const viewingUnsettled = state.settlementView === "unsettled";
    (viewingUnsettled ? $("#seller-summary-list") : $("#settlement-summary")).scrollIntoView({behavior:"smooth",block:"start"});
    notify(viewingUnsettled
      ? `已列出 ${remaining.length} 条未结账记录，可按送拍人查看和处理`
      : "已恢复显示全部结算记录");
  });
  $("#export-settlement-image").addEventListener("click", exportSettlementImage);
  $("#export-settlement-checklist-image").addEventListener("click", exportSettlementChecklistImage);
  $("#export-preauction-image").addEventListener("click", exportPreauctionImage);

  const startupSanitizedCount = sanitizeLoadedState();

  const startup0806Repair = MxiqiWorkflow.repairKnown0806Import(state.records);
  state.records = startup0806Repair.records;
  if (startup0806Repair.birthdayPending) {
    const affectedNames = new Set(startup0806Repair.affectedConsignors);
    const affectedPhones = new Set(state.records
      .filter((record) => record.birthdayPending && MxiqiWorkflow.auctionDateKey(record.auctionAt || record.platformAuctionAt) === "2026-08-06")
      .map((record) => normalizeCustomerPhone(record.sellerPhone))
      .filter(Boolean));
    Object.entries(state.customers).forEach(([wechat, profile]) => {
      const phone = normalizeCustomerPhone(profile?.phone);
      if (!affectedNames.has(wechat) && !(phone && affectedPhones.has(phone))) return;
      if (Number(profile?.birthdayMonth || 0) === 8) profile.birthdayMonth = 0;
      profile.birthdayPending = !Number(profile?.birthdayMonth || 0);
    });
  }
  if (startup0806Repair.periodCorrected || startup0806Repair.settlementCleared || startup0806Repair.birthdayPending) {
    state.records
      .filter((record) => MxiqiWorkflow.auctionDateKey(record.auctionAt || record.platformAuctionAt) === "2026-08-06")
      .forEach((record) => recalculateRecord(record, true));
    audit("自动修复 0806 数据", `期数更正 ${startup0806Repair.periodCorrected} 件 · 清除串入成交 ${startup0806Repair.settlementCleared} 件 · 生日月份待补 ${startup0806Repair.birthdayPending} 件`, {undoable:false});
  }

  function repairEmbeddedConsignorLabels() {
    let repaired = 0;
    state.records.forEach((record) => {
      const oldName = String(record.sellerWechat || "").trim();
      if (!oldName) return;
      const parsed = MxiqiAssets.parseConsignorLabel(oldName, record.sellerPhone, record.auctionAt);
      if (!MxiqiAssets.normalizePhone(oldName) && !parsed.birthdayMarked) return;
      const nextName = parsed.wechat || oldName;
      if (nextName !== oldName) record.sellerWechat = nextName;
      if (!normalizeCustomerPhone(record.sellerPhone) && parsed.phone) record.sellerPhone = parsed.phone;
      if (parsed.birthdayPending) {
        record.birthdayMonth = 0;
        record.birthdayPending = true;
      } else if (parsed.birthdayMonth) {
        record.birthdayMonth = parsed.birthdayMonth;
        record.birthdayPending = false;
      }
      const oldProfile = state.customers[oldName] && typeof state.customers[oldName] === "object" ? state.customers[oldName] : {};
      const nextProfile = state.customers[nextName] && typeof state.customers[nextName] === "object" ? state.customers[nextName] : {};
      const profileBirthdayMonth = parsed.birthdayPending
        ? 0
        : Number(parsed.birthdayMonth || nextProfile.birthdayMonth || oldProfile.birthdayMonth || 0);
      state.customers[nextName] = {
        ...oldProfile,
        ...nextProfile,
        phone:normalizeCustomerPhone(nextProfile.phone || oldProfile.phone || parsed.phone),
        birthdayMonth:profileBirthdayMonth,
        birthdayPending:parsed.birthdayPending || (!profileBirthdayMonth && Boolean(nextProfile.birthdayPending || oldProfile.birthdayPending)),
        aliases:[...new Set([...(oldProfile.aliases || []), ...(nextProfile.aliases || []), oldName].filter(Boolean))],
      };
      if (nextName !== oldName) delete state.customers[oldName];
      repaired += 1;
    });
    return repaired;
  }

  if (localStorage.getItem(MIGRATION_KEY) !== "17") {
    state.settings = {...defaultSettings, ...state.settings};
    repairEmbeddedConsignorLabels();
    if (Number(state.settings.birthdayCommissionValue) === 5 && state.settings.birthdayLabel === "生日月优惠") {
      state.settings.birthdayCommissionValue = -2;
    }
    state.settings.birthdayLabel = "生日";
    const samplePeriods = {
      d101:"世界币章拍卖（第75期）",
      d102:"世界币章拍卖（第75期）",
      d103:"世界币章拍卖（第75期）",
      d104:"长期征集拍品（第74期）",
      d105:"长期征集拍品（第74期）",
    };
    state.records.forEach((record) => {
      if (!samplePeriods[record.id]) return;
      record.projectName = samplePeriods[record.id];
      record.auctionHouse = "麦稀奇";
      if (record.id === "d101") {
        record.itemName = "NGC PMG 67EPQ 2024年龙年纪念钞";
        record.finalPrice = 2500;
      }
    });
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
    state.records.filter((record) => !record.settled || isStorageRecord(record)).forEach((record) => recalculateRecord(record, isStorageRecord(record)));
    const demoPhones = {d101:"13900001001",d102:"13900001002",d103:"13900001003",d104:"13900001004"};
    state.records.forEach((record) => {
      record.sellerPhone ||= state.customers[record.sellerWechat]?.phone || demoPhones[record.id] || "";
      if (record.sellerWechat && record.sellerPhone) state.customers[record.sellerWechat] = {...(state.customers[record.sellerWechat] || {}), phone:record.sellerPhone};
    });
    state.assets = Array.isArray(state.assets) ? state.assets.map(normalizeConsignmentAsset) : [];
    deduplicateCurrentRecords();
    syncStoredAssetsFromRecords();
    state.assets = MxiqiAssets.rematchAssets(state.assets, state.records);
    state.connection = {...defaultConnection, ...state.connection};
    if (Number(state.settings.sfThreshold) === 1000) state.settings.sfThreshold = 2000;
    if (!["disconnected","demo_connected","connected"].includes(state.connection.status)) state.connection = clone(defaultConnection);
    localStorage.setItem(MIGRATION_KEY, "17");
    save();
  }

  const startupDuplicateRepair = deduplicateCurrentRecords();
  if (startupDuplicateRepair.removed) {
    syncStoredAssetsFromRecords();
    state.assets = MxiqiAssets.rematchAssets(state.assets, state.records);
    audit("自动合并重复拍品", `合并 ${startupDuplicateRepair.removed} 条同一期同 Lot 的隐藏重复记录`, {undoable:false});
    save();
  }

  window.setInterval(collectorTick, 1000);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        let reloadingForUpdate = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (reloadingForUpdate) return;
          reloadingForUpdate = true;
          window.location.reload();
        });
      const registration = await navigator.serviceWorker.register("sw.js?v=49", {updateViaCache:"none"});
        await registration.update();
        await navigator.serviceWorker.ready;
        $("#offline-status").textContent = "离线访问已准备";
      } catch {
        $("#offline-status").textContent = "本机数据已启用";
      }
    });
  } else {
    $("#offline-status").textContent = "本机数据已启用";
  }

  ensureLegacyImportUndo();
  let startupReturnReview = {reviewRequired:0};
  if (localStorage.getItem(RETURN_MANUAL_REVIEW_KEY) !== "1") {
    startupReturnReview = requireManualReturnReview();
    localStorage.setItem(RETURN_MANUAL_REVIEW_KEY, "1");
    if (startupReturnReview.reviewRequired) {
      audit("拖回处理改为人工复核", `${startupReturnReview.reviewRequired} 件拍品等待人工确认`, {undoable:false});
    }
  }
  const startupConsignorRepair = repairMissingConsignorsFromHistory();
  if (startupConsignorRepair.restored) {
    audit("自动恢复送拍人关联", `从本机历史记录恢复 ${startupConsignorRepair.restored} 件拍品`, {undoable:false});
  }
  syncCustomerDirectory();
  let startupQuarantinedCount = 0;
  try {
    render();
    persistState();
  } catch (error) {
    const originalRecords = clone(state.records);
    const validRecords = [];
    const quarantined = [];
    for (const record of originalRecords) {
      state.records = [...validRecords, record];
      try {
        render();
        validRecords.push(record);
      } catch (recordError) {
        quarantined.push({record, error:String(recordError?.message || recordError)});
      }
    }
    state.records = validRecords;
    startupQuarantinedCount = quarantined.length;
    saveRecoveryCopy("startup-render-recovery", {quarantined}, error);
    render();
    persistState();
  }
  renderConnectionPanel();
  renderCollectorPanel();
  if (startupSanitizedCount || startupQuarantinedCount) {
    notify(`检测到异常导入数据，已自动隔离 ${startupSanitizedCount + startupQuarantinedCount} 条并恢复页面`, "error");
  } else if (startup0806Repair.periodCorrected || startup0806Repair.settlementCleared || startup0806Repair.birthdayPending) {
    notify(`已自动修复 0806 数据：改为第78期 ${startup0806Repair.periodCorrected} 件，清除串入成交 ${startup0806Repair.settlementCleared} 件，生日月份待补 ${startup0806Repair.birthdayPending} 件`);
  } else if (startupReturnReview.reviewRequired) {
    notify(`已将 ${startupReturnReview.reviewRequired} 件拖回拍品改为等待人工确认`);
  } else if (startupConsignorRepair.restored) {
    notify(`已自动恢复 ${startupConsignorRepair.restored} 件拍品的送拍人资料`);
  }
  if (state.connection.status === "connected" || state.connection.connectorInstalled) {
    void checkRealConnection({quiet:true});
  }
})();
