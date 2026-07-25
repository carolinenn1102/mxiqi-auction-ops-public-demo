(() => {
  "use strict";

  const EXTENSION_ID = "dkomiogcdcldejbdenlhhnhfedcjkipo";
  const DEFAULT_TIMEOUT = 45_000;

  function send(message, timeoutMs = DEFAULT_TIMEOUT) {
    return new Promise((resolve, reject) => {
      if (!globalThis.chrome?.runtime?.sendMessage) {
        reject(new Error("未检测到麦稀奇采集助手，请先下载并安装"));
        return;
      }

      let settled = false;
      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        reject(new Error("本地采集助手响应超时，请重新检查连接"));
      }, timeoutMs);

      chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        const runtimeError = chrome.runtime.lastError;
        if (runtimeError) {
          reject(new Error("未检测到麦稀奇采集助手，请先下载并安装"));
          return;
        }
        if (!response?.ok) {
          reject(new Error(response?.error || "本地采集助手返回失败"));
          return;
        }
        resolve(response);
      });
    });
  }

  globalThis.MxiqiConnector = Object.freeze({
    extensionId: EXTENSION_ID,
    ping: () => send({type: "ping"}, 20_000),
    openLogin: () => send({type: "openLogin"}, 20_000),
    login: ({mobile, password}) => send({type: "login", mobile, password}, 60_000),
    syncOrders: ({scope = "waitexpress", maxPages = 1} = {}) => send({
      type: "syncOrders",
      scope,
      maxPages,
    }, 120_000),
  });
})();
