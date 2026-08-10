import fs from "node:fs";
import path from "node:path";

function text(value) {
  return String(value ?? "").trim();
}

export function createOrderStore(dataRoot) {
  const ordersRoot = path.join(path.resolve(dataRoot), "orders");

  function file(key) {
    return path.join(ordersRoot, `${key}.json`);
  }

  function read(key) {
    try {
      return JSON.parse(fs.readFileSync(file(key), "utf8"));
    } catch {
      return null;
    }
  }

  function write(key, value) {
    fs.mkdirSync(ordersRoot, {recursive:true, mode:0o700});
    const target = file(key);
    const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(value), {encoding:"utf8", mode:0o600});
    fs.renameSync(temporary, target);
  }

  function entries() {
    try {
      return fs.readdirSync(ordersRoot, {withFileTypes:true})
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => {
          const key = entry.name.slice(0, -5);
          return {key, value:read(key)};
        })
        .filter((entry) => entry.value);
    } catch {
      return [];
    }
  }

  function findByLogisticsOrderId(orderId) {
    const reference = text(orderId);
    if (!reference) return null;
    return entries().find((entry) => text(entry.value?.logisticsOrderId) === reference) || null;
  }

  function markCancelled(orderId, providerResult = {}, now = new Date()) {
    const reference = text(orderId);
    if (!reference) return null;
    let firstUpdated = null;
    for (const entry of entries()) {
      if (text(entry.value?.logisticsOrderId) !== reference) continue;
      const updated = {
        ...entry.value,
        ...providerResult,
        logisticsOrderId:text(providerResult.logisticsOrderId) || reference,
        providerStatus:text(providerResult.providerStatus) || "cancelled",
        cancelled:true,
        cancelledAt:text(entry.value.cancelledAt) || now.toISOString(),
      };
      write(entry.key, updated);
      if (!firstUpdated) firstUpdated = updated;
    }
    return firstUpdated;
  }

  return Object.freeze({read, write, findByLogisticsOrderId, markCancelled});
}
