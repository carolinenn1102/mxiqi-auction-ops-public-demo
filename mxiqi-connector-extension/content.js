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
    const pageLimit = ["waitconfirm","waitpay"].includes(safeScope) ? 20 : safeScope === "all" ? 10 : 3;
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
      if (message?.type === "submitCredentials") return submitCredentials(message);
      throw new Error("不支持的采集命令");
    })().then((result) => sendResponse({ok: true, ...result})).catch((error) => sendResponse({ok: false, error: error.message || "采集失败"}));
    return true;
  });
})();
