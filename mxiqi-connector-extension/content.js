(() => {
  "use strict";

  async function fetchDocument(path) {
    const response = await fetch(path, {credentials: "include", cache: "no-store"});
    if (!response.ok) throw new Error(`麦稀奇返回 HTTP ${response.status}`);
    const html = await response.text();
    const finalUrl = response.url || new URL(path, location.origin).href;
    const requiresLogin = /\/user\.login(?:[/?]|$)/.test(finalUrl) || /麦稀奇登录/.test(html);
    return {doc: new DOMParser().parseFromString(html, "text/html"), finalUrl, requiresLogin};
  }

  async function checkSession() {
    const result = await fetchDocument("/org.home");
    const orgName = MxiqiPageParser.clean(result.doc.querySelector("aside a[href='/org'], .sidebar a[href='/org']")?.textContent);
    return {loggedIn: !result.requiresLogin, orgName};
  }

  async function scrapeOrders({scope = "waitexpress", maxPages = 1} = {}) {
    const safeScope = scope === "recent" ? "all" : ["waitconfirm","waitpay"].includes(scope) ? scope : "waitexpress";
    const pageLimit = ["waitconfirm","waitpay","waitexpress"].includes(safeScope) ? 20 : 10;
    const requestedPages = Math.max(1, Math.min(Number(maxPages) || 1, pageLimit));
    const basePath = `/org.order.list/${safeScope}`;
    const first = await fetchDocument(`${basePath}?page=1&aftersale=0`);
    if (first.requiresLogin) return {requiresLogin: true, records: []};

    const firstPage = MxiqiPageParser.parseOrderDocument(first.doc);
    const pageCount = Math.min(firstPage.totalPages, requestedPages);
    const records = [...firstPage.records];
    for (let page = 2; page <= pageCount; page += 1) {
      await new Promise((resolve) => setTimeout(resolve, 160));
      const next = await fetchDocument(`${basePath}?page=${page}&aftersale=0`);
      if (next.requiresLogin) return {requiresLogin: true, records: []};
      records.push(...MxiqiPageParser.parseOrderDocument(next.doc).records);
    }

    return {
      requiresLogin: false,
      records,
      pages: pageCount,
      totalPages: firstPage.totalPages,
      totalOrders: firstPage.totalOrders,
      scope: safeScope,
    };
  }

  async function scrapeOrdersByNumbers({orderNumbers = []} = {}) {
    const numbers = [...new Set((Array.isArray(orderNumbers) ? orderNumbers : [])
      .map((value) => String(value || "").trim())
      .filter((value) => /^\d{14,30}$/.test(value)))]
      .slice(0, 50);
    const records = [];
    const foundOrders = [];
    const missingOrderNumbers = [];

    for (const orderNumber of numbers) {
      const result = await fetchDocument(`/org.order.list/all?keywords=${encodeURIComponent(orderNumber)}&page=1&aftersale=0`);
      if (result.requiresLogin) return {requiresLogin: true, records: []};
      const matches = MxiqiPageParser.parseOrderDocument(result.doc).records.filter((record) => String(record.mxiqiOrderId) === orderNumber);
      if (matches.length) {
        records.push(...matches);
        foundOrders.push(orderNumber);
      } else {
        missingOrderNumbers.push(orderNumber);
      }
      if (numbers.length > 1) await new Promise((resolve) => setTimeout(resolve, 120));
    }

    const unique = new Map(records.map((record) => [record.platformItemKey, record]));
    return {
      requiresLogin: false,
      records: [...unique.values()],
      searched: numbers.length,
      foundOrders,
      missingOrderNumbers,
    };
  }

  function findAuctionResultLink(doc, period = "") {
    const normalizedPeriod = MxiqiPageParser.auctionPeriod(period) || String(period || "").trim();
    const candidates = Array.from(doc.querySelectorAll("a[href]"))
      .map((anchor) => {
        const text = MxiqiPageParser.clean(anchor.textContent);
        const href = anchor.getAttribute("href") || "";
        if (!/成交目录|成交记录/.test(text) && !/auction\.info\.entry/.test(href)) return null;
        const containerText = MxiqiPageParser.clean(anchor.closest("article, section, li, tr, .card, [class*='auction']")?.textContent || anchor.parentElement?.textContent || text);
        let score = /成交目录|成交记录/.test(text) ? 5 : 1;
        if (/auction\.info\.entry/.test(href)) score += 4;
        if (normalizedPeriod && containerText.includes(normalizedPeriod)) score += 8;
        return {href:new URL(href, location.origin).href,score,containerText};
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score);
    return candidates[0] || null;
  }

  async function scrapeAuctionDeals({period = ""} = {}) {
    const normalizedPeriod = MxiqiPageParser.auctionPeriod(period) || String(period || "").trim();
    if (!normalizedPeriod) throw new Error("请先在工作台选择拍卖期数");
    let targetUrl = /auction\.info\.entry(?:[/?]|$)/.test(`${location.pathname}${location.search}`) ? location.href : "";
    if (!targetUrl) targetUrl = findAuctionResultLink(document, normalizedPeriod)?.href || "";
    if (!targetUrl) {
      const home = await fetchDocument("/org.home");
      if (home.requiresLogin) return {requiresLogin:true,records:[]};
      targetUrl = findAuctionResultLink(home.doc, normalizedPeriod)?.href || "";
    }
    if (!targetUrl) throw new Error(`没有找到${normalizedPeriod}的成交目录。请先在麦稀奇打开该期拍场页面（右上角可见“成交目录”），再回工作台同步`);
    const result = targetUrl === location.href
      ? {doc:document,finalUrl:location.href,requiresLogin:false}
      : await fetchDocument(targetUrl);
    if (result.requiresLogin) return {requiresLogin:true,records:[]};
    const parsed = MxiqiPageParser.parseAuctionResultDocument(result.doc,{period:normalizedPeriod,entryKey:result.finalUrl});
    if (!parsed.records.length) throw new Error(`${normalizedPeriod}成交目录已打开，但没有读取到 Lot 与成交价；请刷新麦稀奇成交目录后重试`);
    return {requiresLogin:false,records:parsed.records,period:parsed.period || normalizedPeriod,projectName:parsed.projectName || "",sourceUrl:result.finalUrl};
  }

  function findAuctionCatalogLink(doc) {
    const candidates = Array.from(doc.querySelectorAll("a[href]"))
      .map((anchor) => {
        const text = MxiqiPageParser.clean(anchor.textContent);
        const href = anchor.getAttribute("href") || "";
        if (!/成交目录|成交记录/.test(text) && !/org\.auction\.catalog/.test(href)) return null;
        let score = /成交目录/.test(text) ? 10 : 1;
        if (/org\.auction\.catalog/.test(href)) score += 10;
        return {href:new URL(href, location.origin).href,score};
      })
      .filter(Boolean)
      .sort((left, right) => right.score - left.score);
    return candidates[0] || null;
  }

  function findAuctionDataLink(doc, period = "") {
    const normalizedPeriod = MxiqiPageParser.auctionPeriod(period) || String(period || "").trim();
    const candidates = Array.from(doc.querySelectorAll('a[href*="/org.auction.dataReport/"]'))
      .map((anchor) => {
        const href = anchor.getAttribute("href") || "";
        const container = anchor.closest("li.auction, li, article, section, tr, .card, [class*='auction']") || anchor.parentElement;
          const containerText = MxiqiPageParser.clean(container?.textContent || "");
          if (normalizedPeriod && !containerText.includes(normalizedPeriod)) return null;
          const exactPeriod = normalizedPeriod && MxiqiPageParser.auctionPeriod(containerText) === normalizedPeriod;
          return {
            href:new URL(href, location.origin).href,
            score:exactPeriod ? 20 : 10,
            containerText,
            lifecycle:MxiqiPageParser.auctionLifecycle(containerText),
          };
        })
        .filter(Boolean)
        .sort((left, right) => right.score - left.score);
      return candidates[0] || null;
  }

  function lifecycleLabel(lifecycle) {
    if (lifecycle === "preview") return "预展中";
    if (lifecycle === "live") return "拍卖进行中";
    if (lifecycle === "ended") return "已结束";
    return "状态未知";
  }

  function assertAuctionEnded(period, lifecycle) {
    if (!["preview", "live"].includes(lifecycle)) return;
    throw new Error(`${period}尚未结束（当前为${lifecycleLabel(lifecycle)}），为防止把预出价误判为成交，已停止同步`);
  }

  async function waitForAuctionDataLink(period, timeoutMs = 10_000) {
    const deadline = Date.now() + timeoutMs;
    let candidate = findAuctionDataLink(document, period);
    while (!candidate && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      candidate = findAuctionDataLink(document, period);
    }
    return candidate;
  }

  async function resolveAuctionCatalog(period) {
    const normalizedPeriod = MxiqiPageParser.auctionPeriod(period) || String(period || "").trim();
    const currentText = MxiqiPageParser.clean(`${document.title}\n${document.body?.textContent || ""}`);
    const currentPeriod = MxiqiPageParser.auctionPeriod(currentText);
    const currentLifecycle = MxiqiPageParser.auctionLifecycle(currentText);
    const isAuctionList = /\/org\.auction\.list/.test(location.pathname);
    const currentMatches = !isAuctionList && currentPeriod === normalizedPeriod;

    if (currentMatches) {
      assertAuctionEnded(normalizedPeriod, currentLifecycle);
      if (/\/org\.auction\.catalog\/\d+/.test(location.pathname)) {
        return {doc:document,finalUrl:location.href,requiresLogin:false,lifecycle:currentLifecycle};
      }
      const currentCatalog = findAuctionCatalogLink(document);
      if (currentCatalog) {
        const result = await fetchDocument(currentCatalog.href);
        return {...result,lifecycle:currentLifecycle};
      }
    }

    let dataLink = isAuctionList
      ? await waitForAuctionDataLink(normalizedPeriod)
      : null;
    if (!dataLink) {
      const auctionList = await fetchDocument("/org.auction.list");
      if (auctionList.requiresLogin) return auctionList;
      dataLink = findAuctionDataLink(auctionList.doc, normalizedPeriod);
    }
    if (!dataLink) throw new Error(`没有在“实时专场”找到${normalizedPeriod}，正在尝试实时列表页`);
    assertAuctionEnded(normalizedPeriod, dataLink.lifecycle);

    const report = await fetchDocument(dataLink.href);
    if (report.requiresLogin) return report;
    const catalogLink = findAuctionCatalogLink(report.doc);
    if (!catalogLink) throw new Error(`已找到${normalizedPeriod}拍场，但页面没有“成交目录”，请确认该场拍卖已经结束`);
    const catalog = await fetchDocument(catalogLink.href);
    return {...catalog,lifecycle:dataLink.lifecycle};
  }

  async function scrapeAuctionDealsAutomatic({period = ""} = {}) {
    const normalizedPeriod = MxiqiPageParser.auctionPeriod(period) || String(period || "").trim();
    if (!normalizedPeriod) throw new Error("请先在工作台选择拍卖期数");
    const result = await resolveAuctionCatalog(normalizedPeriod);
    if (result.requiresLogin) return {requiresLogin:true,records:[]};
    const parsed = MxiqiPageParser.parseAuctionResultDocument(result.doc,{period:normalizedPeriod,entryKey:result.finalUrl,lifecycle:result.lifecycle});
    assertAuctionEnded(normalizedPeriod, parsed.lifecycle);
    if (!parsed.records.length) throw new Error(`${normalizedPeriod}成交目录已找到，但没有读取到 Lot 与成交价`);
    return {requiresLogin:false,records:parsed.records,period:parsed.period || normalizedPeriod,projectName:parsed.projectName || "",sourceUrl:result.finalUrl};
  }

  function setInputValue(input, value) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event("input", {bubbles: true}));
    input.dispatchEvent(new Event("change", {bubbles: true}));
  }

  function submitCredentials({mobile, password}) {
    const mobileInput = document.querySelector('input[name="mobile"], input[placeholder="输入手机号"]');
    const passwordInput = document.querySelector('input[name="password"], input[placeholder="输入密码"]');
    const submitButton = document.querySelector('#wrap-login button[type="submit"], #wrap-login input[type="submit"], button[type="submit"]');
    if (!mobileInput || !passwordInput || !submitButton) throw new Error("麦稀奇登录表单结构已变化，请改用官方页面登录");
    setInputValue(mobileInput, mobile);
    setInputValue(passwordInput, password);
    setTimeout(() => submitButton.click(), 0);
    return {submitted: true};
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    (async () => {
      if (message?.type === "checkSession") return checkSession();
      if (message?.type === "scrapeOrders") return scrapeOrders(message);
      if (message?.type === "scrapeOrdersByNumbers") return scrapeOrdersByNumbers(message);
      if (message?.type === "scrapeAuctionDeals") return scrapeAuctionDealsAutomatic(message);
      if (message?.type === "submitCredentials") return submitCredentials(message);
      throw new Error("不支持的采集命令");
    })().then((result) => sendResponse({ok: true, ...result})).catch((error) => sendResponse({ok: false, error: error.message || "采集失败"}));
    return true;
  });
})();
