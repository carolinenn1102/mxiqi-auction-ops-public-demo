(() => {
  "use strict";

  function senderAllowed(sender) {
    if (!sender?.url) return false;
    try {
      const url = new URL(sender.url);
      if (url.origin === "https://carolinenn1102.github.io") return url.pathname.startsWith("/mxiqi-auction-ops-public-demo/");
      return url.origin === "http://localhost" || url.origin === "http://127.0.0.1";
    } catch {
      return false;
    }
  }

  function waitForTab(tabId, timeoutMs = 25_000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(onUpdated);
        reject(new Error("麦稀奇页面加载超时"));
      }, timeoutMs);
      function onUpdated(updatedTabId, changeInfo, tab) {
        if (updatedTabId !== tabId || changeInfo.status !== "complete") return;
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(onUpdated);
        resolve(tab);
      }
      chrome.tabs.onUpdated.addListener(onUpdated);
      chrome.tabs.get(tabId).then((tab) => {
        if (tab.status === "complete") {
          clearTimeout(timer);
          chrome.tabs.onUpdated.removeListener(onUpdated);
          resolve(tab);
        }
      }).catch(() => {});
    });
  }

  async function getMxiqiTab({create = true, active = false} = {}) {
    const tabs = await chrome.tabs.query({url: "https://www.mxiqi.com/*"});
    let tab = tabs.find((item) => /\/org(?:[./?]|$)/.test(item.url || "")) || tabs[0];
    if (!tab && create) tab = await chrome.tabs.create({url: "https://www.mxiqi.com/org.home", active});
    if (!tab) return null;
    if (active) await chrome.tabs.update(tab.id, {active: true});
    if (tab.status !== "complete") tab = await waitForTab(tab.id);
    return tab;
  }

  async function sendToMxiqi(message, options) {
    const tab = await getMxiqiTab(options);
    if (!tab?.id) throw new Error("无法打开麦稀奇页面");
    try {
      return await chrome.tabs.sendMessage(tab.id, message);
    } catch {
      await chrome.tabs.reload(tab.id);
      await waitForTab(tab.id);
      return chrome.tabs.sendMessage(tab.id, message);
    }
  }

  async function handle(message) {
    if (message?.type === "openLogin") {
      const tab = await chrome.tabs.create({url: "https://www.mxiqi.com/user.login", active: true});
      return {ok: true, opened: Boolean(tab?.id)};
    }
    if (message?.type === "ping") {
      const result = await sendToMxiqi({type: "checkSession"}, {create: true, active: false});
      return {ok: true, installed: true, loggedIn: Boolean(result?.loggedIn), orgName: result?.orgName || ""};
    }
    if (message?.type === "syncOrders") {
      const result = await sendToMxiqi({type: "scrapeOrders", scope: message.scope, maxPages: message.maxPages}, {create: true, active: false});
      return {ok: true, ...result};
    }
    throw new Error("不支持的连接器命令");
  }

  chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (!senderAllowed(sender)) {
      sendResponse({ok: false, error: "来源网页未获授权"});
      return false;
    }
    handle(message).then(sendResponse).catch((error) => sendResponse({ok: false, error: error.message || "连接器执行失败"}));
    return true;
  });
})();
