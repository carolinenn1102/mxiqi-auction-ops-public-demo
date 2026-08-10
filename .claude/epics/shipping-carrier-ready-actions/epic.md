---
name: shipping-carrier-ready-actions
status: completed
created: 2026-08-10T17:11:20Z
updated: 2026-08-10T17:28:23Z
progress: 100%
prd: .claude/prds/shipping-carrier-ready-actions.md
github: (not synced)
---

# Epic: shipping-carrier-ready-actions

## Overview

在现有发货与真实物流网关基础上，将承运商队列拆分，并把绿色按钮绑定到可验证的真实下单条件。

## Architecture Decisions

- 继续使用现有包裹分组和 `shippingCarrier` / 自动承运商判断，不建立第二套发货数据。
- 由同一个状态计算同时驱动承运商卡片、按钮文字、颜色和点击目标，避免界面与实际权限不一致。
- 自动化测试只拦截物流健康检查，不触发真实创建订单请求。

## Implementation Strategy

1. 增加顺丰、菜鸟独立汇总卡片与入口。
2. 统一计算包裹阶段、承运商真实接口状态和绿色按钮资格。
3. 更新弹窗真实下单按钮的状态和文案。
4. 增加浏览器回归、完整测试与公网验证。

## Task Breakdown Preview

- 001：实现承运商拆分、绿色下单门禁、测试和发布。

## Validation

- 单元测试 132/132 通过。
- 4 组本地浏览器回归通过，真实订单创建请求为 0。
- 公网回归确认顺丰绿色按钮实际颜色、顺丰/菜鸟分栏、菜鸟未接通禁用状态均正确。
