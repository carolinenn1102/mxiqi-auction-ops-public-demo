(function attachMxiqiAssets(root) {
  "use strict";

  const TYPE_LABELS = { consignment: "寄存", grading: "送评", inventory: "库存" };

  function normalizeHeader(value) {
    return String(value ?? "").trim().replace(/\s+/g, "").replace(/[（）()：:]/g, "").toLowerCase();
  }

  function cellText(cell) {
    const value = cell?.value;
    if (value == null) return "";
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (["string", "number", "boolean"].includes(typeof value)) return String(value).trim();
    if (typeof value === "object") {
      if (typeof value.text === "string") return value.text.trim();
      if (Array.isArray(value.richText)) return value.richText.map((part) => part.text || "").join("").trim();
      if (value.result != null && typeof value.result !== "object") return String(value.result).trim();
    }
    return "";
  }

  function cellNumber(cell) {
    if (typeof cell?.value === "number") return cell.value;
    if (cell?.value && typeof cell.value === "object" && typeof cell.value.result === "number") return cell.value.result;
    const parsed = Number(cellText(cell).replace(/[¥￥,，\s]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function dateText(cell) {
    const value = cell?.value;
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    if (typeof value === "number" && value > 20000 && value < 80000) {
      return new Date(Math.round((value - 25569) * 86400 * 1000)).toISOString().slice(0, 10);
    }
    return cellText(cell);
  }

  function headerMap(row) {
    const result = new Map();
    row.eachCell({ includeEmpty: false }, (cell, column) => {
      const key = normalizeHeader(cellText(cell));
      if (key) result.set(key, column);
    });
    return result;
  }

  function column(headers, ...names) {
    for (const name of names) {
      const found = headers.get(normalizeHeader(name));
      if (found) return found;
    }
    return 0;
  }

  function textAt(row, headers, ...names) {
    const found = column(headers, ...names);
    return found ? cellText(row.getCell(found)) : "";
  }

  function numberAt(row, headers, ...names) {
    const found = column(headers, ...names);
    return found ? cellNumber(row.getCell(found)) : 0;
  }

  function dateAt(row, headers, ...names) {
    const found = column(headers, ...names);
    return found ? dateText(row.getCell(found)) : "";
  }

  function normalizePhone(value) {
    const compact = String(value ?? "").replace(/[^\d+]/g, "");
    const match = compact.match(/(?:\+?86)?(1[3-9]\d{9})/);
    return match ? match[1] : "";
  }

  function extractPhone(...values) {
    for (const value of values) {
      const phone = normalizePhone(value);
      if (phone) return phone;
    }
    return "";
  }

  function sellerName(value) {
    const cleaned = String(value ?? "")
      .replace(/(?:\+?86[\s-]?)?1[3-9]\d{9}/g, " ")
      .replace(/1\d{6}\*{4}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned || "手机号用户";
  }

  function simpleHash(value) {
    let hash = 2166136261;
    for (const char of String(value)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  function assetId(key) {
    return `asset-${simpleHash(key)}`;
  }

  function blankRow(row) {
    let hasValue = false;
    row.eachCell({ includeEmpty: false }, (cell) => { if (cellText(cell)) hasValue = true; });
    return !hasValue;
  }

  function findHeader(sheet, predicate) {
    const limit = Math.min(Math.max(sheet.rowCount || 1, 1), 8);
    for (let rowNumber = 1; rowNumber <= limit; rowNumber += 1) {
      const headers = headerMap(sheet.getRow(rowNumber));
      if (predicate(headers)) return { rowNumber, headers };
    }
    return null;
  }

  function baseAsset(assetType, fileName, sheetName, rowNumber, key) {
    return {
      id: assetId(key),
      assetKey: key,
      assetType,
      sourceFile: fileName || "导入文件.xlsx",
      sourceSheet: sheetName,
      sourceRow: rowNumber,
      importedAt: new Date().toISOString(),
      matchStatus: "unmatched",
      matchedRecordId: "",
      matchScore: 0,
      matchReason: "尚未匹配",
    };
  }

  function parseConsignmentSheet(sheet, fileName, headerRow, headers) {
    const assets = [];
    for (let rowNumber = headerRow + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      if (blankRow(row)) continue;
      const user = textAt(row, headers, "用户");
      const orderNo = textAt(row, headers, "寄存订单号");
      const address = textAt(row, headers, "收货地址");
      const rawItem = cellText(row.getCell(6));
      if (!user && !orderNo && !address && !rawItem) continue;
      const phone = extractPhone(user, address);
      const itemName = rawItem && !/^#NAME\?/i.test(rawItem)
        ? rawItem
        : `寄存订单 ${orderNo || rowNumber}（图片拍品）`;
      const key = `consignment|${orderNo || `${sheet.name}-${rowNumber}`}|${phone}|${itemName}`;
      assets.push({
        ...baseAsset("consignment", fileName, sheet.name, rowNumber, key),
        sellerWechat: sellerName(user),
        sellerPhone: phone,
        consignmentOrderNo: orderNo,
        orderDate: dateAt(row, headers, "订单日期"),
        address,
        itemName,
        status: textAt(row, headers, "状态"),
      });
    }
    return assets;
  }

  function parseGradingSheet(sheet, fileName, headerRow, headers) {
    const assets = [];
    for (let rowNumber = headerRow + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      if (blankRow(row)) continue;
      const user = textAt(row, headers, "微信名称/联系方式");
      const itemName = textAt(row, headers, "送评物品");
      const gradingOrderNo = textAt(row, headers, "送评单号");
      if (!user && !itemName && !gradingOrderNo) continue;
      const key = `grading|${sheet.name}-${rowNumber}|${gradingOrderNo}|${user}|${itemName}`;
      assets.push({
        ...baseAsset("grading", fileName, sheet.name, rowNumber, key),
        sellerWechat: sellerName(user),
        sellerPhone: extractPhone(user),
        itemName: itemName || `送评记录 ${gradingOrderNo || rowNumber}`,
        gradingTier: textAt(row, headers, "档"),
        gradingOrderNo,
        gradingDate: dateAt(row, headers, "送评日期"),
        gradingResult: textAt(row, headers, "是否出分"),
        returnStatus: textAt(row, headers, "是否返还"),
        status: cellText(row.getCell(9)),
      });
    }
    return assets;
  }

  function parseInventorySheet(sheet, fileName, headerRow, headers) {
    const assets = [];
    for (let rowNumber = headerRow + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber);
      if (blankRow(row)) continue;
      const itemName = textAt(row, headers, "名称");
      const gradingId = textAt(row, headers, "编号");
      const auctionNumber = textAt(row, headers, "拍场号");
      const lot = textAt(row, headers, "Lot号", "Lot");
      if (!itemName && !gradingId && !auctionNumber && !lot) continue;
      const key = `inventory|${gradingId || `${auctionNumber}-${lot}-${itemName}-${rowNumber}`}`;
      assets.push({
        ...baseAsset("inventory", fileName, sheet.name, rowNumber, key),
        itemName: itemName || `库存记录 ${gradingId || rowNumber}`,
        inventorySource: textAt(row, headers, "来源"),
        auctionNumber,
        lot,
        issueYear: textAt(row, headers, "年份"),
        gradingId,
        gradingScore: textAt(row, headers, "分数/裸币"),
        purchasePrice: numberAt(row, headers, "外拍价格"),
        landedCost: numberAt(row, headers, "到手价格"),
        note: textAt(row, headers, "备注"),
        status: textAt(row, headers, "状态"),
        saleInfo: textAt(row, headers, "售出渠道/价格（未扣手续费，运费）", "售出渠道/价格未扣手续费，运费"),
      });
    }
    return assets;
  }

  function parseAssetWorkbook(workbook, fileName = "导入文件.xlsx") {
    const assets = [];
    const kinds = new Set();
    for (const sheet of workbook.worksheets || []) {
      const consignment = findHeader(sheet, (headers) => column(headers, "用户") && column(headers, "寄存订单号"));
      if (consignment) {
        assets.push(...parseConsignmentSheet(sheet, fileName, consignment.rowNumber, consignment.headers));
        kinds.add("consignment");
        continue;
      }
      const inventory = findHeader(sheet, (headers) => column(headers, "名称") && column(headers, "编号") && column(headers, "到手价格"));
      if (inventory && (sheet.name === "整体" || !workbook.worksheets.some((item) => item.name === "整体"))) {
        assets.push(...parseInventorySheet(sheet, fileName, inventory.rowNumber, inventory.headers));
        kinds.add("inventory");
      }
    }
    if (!assets.length) throw new Error("无法识别第一张“寄存”或外拍“整体”工作表；“送评”暂不导入");
    return { assets, kinds: [...kinds] };
  }

  function normalizedItem(value) {
    return String(value ?? "").toLowerCase().replace(/lot\.?\s*\d+/g, "").replace(/[\s\p{P}\p{S}]/gu, "");
  }

  function bigrams(value) {
    const text = normalizedItem(value);
    if (!text) return new Set();
    if (text.length === 1) return new Set([text]);
    return new Set([...Array(text.length - 1)].map((_, index) => text.slice(index, index + 2)));
  }

  function itemSimilarity(left, right) {
    const a = bigrams(left);
    const b = bigrams(right);
    if (!a.size || !b.size) return 0;
    let overlap = 0;
    a.forEach((item) => { if (b.has(item)) overlap += 1; });
    return overlap / Math.max(a.size, b.size);
  }

  function normalizedId(value) {
    return String(value ?? "").replace(/[^\da-z]/gi, "").toLowerCase();
  }

  function matchScore(asset, record) {
    let score = 0;
    const reasons = [];
    const assetPhone = normalizePhone(asset.sellerPhone);
    const recordPhones = [record.sellerPhone].map(normalizePhone).filter(Boolean);
    if (assetPhone && recordPhones.includes(assetPhone)) {
      score += 100;
      reasons.push("手机号一致");
    }
    const assetGrading = normalizedId(asset.gradingId);
    const recordGradings = [record.gradingId, record.coinBoxId, record.catalogId].map(normalizedId).filter(Boolean);
    if (assetGrading && recordGradings.includes(assetGrading)) {
      score += 85;
      reasons.push("评级编号一致");
    }
    const assetSeller = normalizeHeader(asset.sellerWechat);
    const recordSeller = normalizeHeader(record.sellerWechat);
    if (assetSeller && assetSeller !== "手机号用户" && assetSeller === recordSeller) {
      score += 40;
      reasons.push("送拍人一致");
    }
    const similarity = itemSimilarity(asset.itemName, record.itemName || record.projectName);
    if (similarity >= 0.85) { score += 60; reasons.push("拍品名称高度相似"); }
    else if (similarity >= 0.65) { score += 45; reasons.push("拍品名称较相似"); }
    else if (similarity >= 0.45) { score += 30; reasons.push("拍品名称部分相似"); }
    else if (similarity >= 0.25) { score += 15; reasons.push("拍品名称有少量相似"); }
    if (asset.lot && Number(asset.lot) === Number(record.lot)) {
      score += 20;
      reasons.push("Lot 一致");
    }
    if (asset.consignmentOrderNo && [record.consignmentOrderNo, record.mxiqiOrderId].some((value) => String(asset.consignmentOrderNo) === String(value || ""))) {
      score += 80;
      reasons.push("寄存订单号一致");
    }
    return { score, reasons };
  }

  function suggestMatch(asset, records) {
    const candidates = records.map((record) => ({ record, ...matchScore(asset, record) }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || Number(a.record.lot || 0) - Number(b.record.lot || 0));
    const best = candidates[0];
    const second = candidates[1];
    if (!best) return { matchedRecordId: "", matchStatus: "unmatched", matchScore: 0, matchReason: "未找到可信候选" };
    const lead = best.score - (second?.score || 0);
    const uniqueStrong = best.score >= 85 && (lead >= 15 || !second);
    return {
      matchedRecordId: best.record.id,
      matchStatus: uniqueStrong ? "auto" : "review",
      matchScore: best.score,
      matchReason: `${best.reasons.join("、")} · 候选 Lot ${best.record.lot || "—"} · ${uniqueStrong ? "自动匹配" : "请人工确认"}`,
    };
  }

  function rematchAssets(assets, records) {
    const recordIds = new Set(records.map((record) => record.id));
    return assets.map((asset) => {
      if (asset.matchStatus === "manual" && recordIds.has(asset.matchedRecordId)) return asset;
      return { ...asset, ...suggestMatch(asset, records) };
    });
  }

  function mergeAssets(existing, incoming) {
    const byKey = new Map(existing.map((asset) => [asset.assetKey, asset]));
    incoming.forEach((asset) => {
      const prior = byKey.get(asset.assetKey);
      byKey.set(asset.assetKey, prior ? {
        ...prior,
        ...asset,
        id: prior.id,
        matchedRecordId: prior.matchStatus === "manual" ? prior.matchedRecordId : asset.matchedRecordId,
        matchStatus: prior.matchStatus === "manual" ? "manual" : asset.matchStatus,
        matchScore: prior.matchStatus === "manual" ? prior.matchScore : asset.matchScore,
        matchReason: prior.matchStatus === "manual" ? prior.matchReason : asset.matchReason,
      } : asset);
    });
    return [...byKey.values()];
  }

  root.MxiqiAssets = {
    TYPE_LABELS,
    normalizePhone,
    extractPhone,
    itemSimilarity,
    matchScore,
    suggestMatch,
    rematchAssets,
    mergeAssets,
    parseAssetWorkbook,
  };
})(globalThis);
