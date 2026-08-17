---
name: settlement-unsettled-and-unsold
description: Add the remaining unsettled payable total and include unsold lots in settlement with the low-price fee.
status: active
created: 2026-08-17T12:19:03Z
---

# PRD: settlement-unsettled-and-unsold

## Executive Summary
The settlement dashboard must show the amount still owed for unsettled records and must not omit explicit unsold auction lots. An unsold lot has zero transaction gross but remains a settlement item because the configured low-price fixed fee applies.

## Problem Statement
The dashboard currently shows total gross and total payable but does not show how much payable remains unsettled. It also excludes records whose explicit auction result is `流拍` because their gross is zero, so those lots disappear from consignor settlement and their fixed fee is not deducted.

## User Stories
- As an operator, I can see the current-filter unsettled payable total so I know how much remains to be settled.
  - Acceptance: the value is the sum of `settlementAmount` for `settled=false` records in the current settlement scope.
  - Acceptance: settling or undoing settlement updates the value immediately.
- As an operator, I can see an explicitly unsold lot in the settlement group.
  - Acceptance: `finalOutcome=流拍` with zero gross remains settlement-eligible.
  - Acceptance: with a configured low-price fee of ¥5, the lot has commission ¥5 and payable -¥5.

## Functional Requirements
1. Add a `剩余未结账` currency metric beside the existing settlement totals.
2. Calculate it from the same seller, auction-period, and date scope used by the settlement table.
3. Include explicit unsold records in settlement eligibility while keeping pending/unknown zero-price records excluded.
4. Recalculate existing unsettled unsold records once through a schema migration.
5. Preserve settled historical figures and never rewrite previously settled records.

## Non-Functional Requirements
- Existing filters, commission rules, settlement order, exports, logistics, and local browser storage must continue working.
- The service-worker cache must be bumped so production clients receive the update.

## Success Criteria
- Unit tests confirm explicit unsold eligibility and the ¥5 fixed fee at zero gross.
- Browser regression confirms Lot 1 appears, payable is -¥5, and the remaining unsettled total changes to zero after settlement.
- Public deployment passes the same browser regression with no page errors.

## Constraints & Assumptions
- `流拍` is an authoritative result, unlike blank, `待拍`, or `成交结果待同步`.
- The configured low-price threshold and fee remain the source of the unsold fee; no new fee setting is introduced.

## Out of Scope
- Changing default commission percentages or low-price fee settings.
- Rewriting already-settled historical amounts.
- Changing auction-result collection, shipping, or logistics APIs.

## Dependencies
- Existing settlement scope filters, commission calculator, and browser-local persistence.
