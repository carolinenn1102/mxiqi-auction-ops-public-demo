---
name: reauction-upload-deduplication
status: completed
created: 2026-08-10T16:54:29Z
updated: 2026-08-10T17:07:38Z
progress: 100%
prd: .claude/prds/reauction-upload-deduplication.md
github: (not synced)
---

# Epic: reauction-upload-deduplication

## Overview

在不改变通用导入流程的前提下，为拖回再拍库增加可见、可验证的上传比对去重流程。

## Architecture Decisions

- 复用现有导入弹窗和解析器，以导入模式参数区分普通导入与拖回库对比。
- 可信匹配继续通过 `relistRecord` 合并原记录。
- 疑似但不唯一的候选仅在对比模式跳过，并写入恢复副本。

## Technical Approach

### Frontend Components

- 再拍库汇总区域增加专用按钮和说明。
- 导入弹窗根据模式显示去重提示和结果。

### Backend Services

- 无后端改动；数据仍保存在浏览器本地。

### Infrastructure

- 发布时更新静态资源缓存版本并部署到现有独立站点。

## Implementation Strategy

1. 扩展 `upsert` 的再拍对比统计与疑似跳过选项。
2. 增加专用入口和模式化提示。
3. 增加浏览器回归并运行完整测试。
4. 提交、发布、核对公网静态资源。

## Task Breakdown Preview

- 001：实现拖回库上传对比去重、回归测试和发布。

## Dependencies

- 现有静态站点、浏览器本地存储、ExcelJS 解析和测试运行时。

## Success Criteria (Technical)

- 重复记录不增加数组长度。
- 疑似重复在专用模式不写入数组。
- 新记录正常新增且结果统计准确。

## Estimated Effort

单个小型前端改动与一条端到端回归。
