---
name: sync-auction-results-action
description: Add a prominent action that verifies the current Mxiqi auction lifecycle and synchronizes completed auction results.
status: completed
created: 2026-08-11T14:15:15Z
---

# PRD: sync-auction-results-action

## Executive Summary

Add a top-level “同步拍卖结果” action beside the existing payment and shipping synchronization actions. The action should select the currently filtered auction period, or the most relevant local period that still needs results, then use the existing Mxiqi auction-catalog connector to verify the live lifecycle and import the final results.

## Problem Statement

Records whose auction result has not been collected show “待拍 / 付款状态未同步”, but the result synchronization entry is currently buried in settlement or collector views and requires a manually selected period. Operators cannot find it during daily work and cannot easily tell whether a live auction is safe to synchronize.

## User Stories

- As an operator, I can click one visible button from the main workbench to synchronize auction results.
  - Acceptance: the button is displayed next to “同步待付款” and “同步待发货”.
- As an operator, I do not need to manually select a period when the system can infer the current period.
  - Acceptance: an explicitly selected period wins; otherwise the newest known auction period is used. The platform lifecycle remains authoritative if that newest period has not ended.
- As an operator, I am protected from importing bids before the auction has ended.
  - Acceptance: the existing connector lifecycle guard blocks preview/live auctions and only imports a completed catalog.
- As an operator, I see the synchronized period after completion.
  - Acceptance: the workbench switches to settlement review and filters to the synchronized period.

## Functional Requirements

1. Add the “同步拍卖结果” top action and enable it only for a real Mxiqi connection that is not busy.
2. Resolve a target period from the selected auction or the newest known auction period.
3. Reuse `runSettlementSync` and the connector's `syncAuctionDeals` capability rather than creating a second parser.
4. Preserve consignor information and merge platform order/buyer/payment details through the existing settlement workflow.
5. Record the action in the existing collector result and audit history.

## Non-Functional Requirements

- Do not modify Mxiqi platform data.
- Do not create logistics orders.
- Do not silently treat preview/live auctions as completed.
- Preserve existing payment, shipping, settlement, import, and export behavior.

## Success Criteria

- Static tests verify the button and lifecycle-aware handler wiring.
- A browser regression proves automatic period selection, completed-result merging, and settlement navigation.
- All existing automated tests pass.
- The public deployment exposes the new action and passes the browser regression.
- A real signed-in Chrome session confirms the connector either imports an ended auction or explicitly reports that it is still live/not available.

## Constraints & Assumptions

- The installed Mxiqi collector is version 1.9.3 or newer and advertises `syncAuctionDeals`.
- Auction period and date information already present in local records remains the source for selecting the most relevant period; the platform lifecycle remains authoritative for allowing import.

## Out of Scope

- Changing Mxiqi auction or order data.
- Adding another extension parser or changing the extension package.
- Changing commission, settlement formulas, logistics providers, inventory, or backup formats.

## Dependencies

- Existing `runSettlementSync` workflow.
- Existing `syncAuctionDeals` connector capability and platform lifecycle guard.
