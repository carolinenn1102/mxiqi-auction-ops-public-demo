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
    const safeScope = scope === "recent" ? "all" : "waitexpress";
    const requestedPages = Math.max(1, Math.min(Number(maxPages) || 1, safeScope === "all" ? 10 : 3));
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

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    (async () => {
      if (message?.type === "checkSession") return checkSession();
      if (message?.type === "scrapeOrders") return scrapeOrders(message);
      throw new Error("不支持的采集命令");
    })().then((result) => sendResponse({ok: true, ...result})).catch((error) => sendResponse({ok: false, error: error.message || "采集失败"}));
    return true;
  });
})();
