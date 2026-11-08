# SCRUM-101 Checkout Test Execution Report

**Application:** https://www.saucedemo.com  
**Execution date:** 2026-11-08  
**Account:** `standard_user` (password omitted)  
**Browsers:** Chromium, WebKit; Firefox blocked by a missing Windows dependency (`msvcp140_1.dll`)

## Executive Summary

**Overall status: FAIL — acceptance gaps found.** The canonical serial run completed 20 browser executions across Chromium and WebKit: 13 passed and 7 failed. Firefox could not launch. Failures are consistent with application behavior, not unstable selectors.

| Measure | Result |
|---|---:|
| Planned scenarios | 10 |
| Canonical serial executions | 20 (10 Chromium, 10 WebKit) |
| Passed | 13 (Chromium 6, WebKit 7) |
| Failed against acceptance criteria | 7 (Chromium 4, WebKit 3) |
| Firefox | 10 blocked before execution; missing `msvcp140_1.dll` |
| Initial parallel run | 30 tests: 10 passed, 20 failed; included timeouts and Firefox launch failures |

## Manual Exploratory Results

Live Playwright MCP browser exploration confirmed the main purchase flow:

| Area | Result | Observation |
|---|---|---|
| Cart contents | PASS | Backpack ($29.99) and Bike Light ($9.99) were added; cart badge showed two items. |
| Required checkout fields | PASS | All three fields appeared. Submitting the empty form showed `First Name is required` and remained on checkout. |
| Overview | PASS | Showed SauceCard, Free Pony Express Delivery, item total `$39.98`, tax `$3.20`, and total `$43.18`. |
| Order completion | PASS | Finish showed the confirmation message; Back Home returned to products and the cart was empty. |
| Invalid checkout data | FAIL | `!@#$%`, `1234`, and `abc!` advanced to the overview without a validation error. |
| Empty-cart direct route | FAIL | As a logged-in user with an empty cart, direct navigation to checkout displayed the checkout form. |
| Mobile checkout | PASS | Checkout form remained visible at 390px viewport width; automated check also found no horizontal overflow. |

## Evidence

Fresh Playwright MCP screenshots are saved under `test-results/manual-evidence/`:

| Evidence | Screenshot |
|---|---|
| Products | [products-current.png](manual-evidence/products-current.png) |
| Cart | [cart-current.png](manual-evidence/cart-current.png) |
| Required-field error | [required-field-error-current.png](manual-evidence/required-field-error-current.png) |
| Order overview | [overview-current.png](manual-evidence/overview-current.png) |
| Invalid values accepted | [invalid-values-accepted-current.png](manual-evidence/invalid-values-accepted-current.png) |
| Order confirmation | [confirmation-current.png](manual-evidence/confirmation-current.png) |
| Empty-cart checkout access | [empty-cart-checkout-current.png](manual-evidence/empty-cart-checkout-current.png) |
| Mobile checkout | [mobile-checkout-current.png](manual-evidence/mobile-checkout-current.png) |

## Automated Results

The existing suite is [checkout.spec.js](../tests/saucedemo-checkout/checkout.spec.js), covering the ten scenarios in [saucedemo-checkout-test-plan.md](../specs/saucedemo-checkout-test-plan.md).

| Engine | Passed | Failed/blocked | Result |
|---|---:|---:|---|
| Chromium, serial | 6 | 4 | Subtotal, invalid values, Cancel destination, and empty-cart access failed. |
| WebKit, serial | 7 | 3 | Subtotal, invalid values, and empty-cart access failed. Cancel returned to cart. |
| Firefox | 0 | 10 blocked | Browser launch failed because `msvcp140_1.dll` is unavailable. |

An initial all-project run used four workers and produced 10 passes and 20 failures across 30 attempts. It included navigation timeouts during parallel load and Firefox launch failures. The follow-up serial run used one worker for Chromium and WebKit; its seven failures reproduced as settled application states and are the canonical results above.

## Defects Log

| ID | Severity | Title and description | Expected vs. actual |
|---|---|---|---|
| SCRUM-101-D1 | Medium | Cart review omits the item subtotal. | Expected a `$39.98` subtotal for the two-item cart; cart displayed item rows and prices only. Reproduced in Chromium and WebKit. |
| SCRUM-101-D2 | Medium | Invalid checkout values are accepted. | Expected validation and to remain on the form; special characters in names and malformed ZIP advanced to the overview in Chromium and WebKit. |
| SCRUM-101-D3 | Medium | Empty cart can access checkout. | Expected direct checkout to be blocked; logged-in empty-cart navigation displayed the information form in Chromium and WebKit. |
| SCRUM-101-D4 | Low | Cancel destination differs by engine and story rule. | Expected return to cart; Chromium navigated to inventory, while WebKit returned to cart. The item remained in the cart. |

No selector or timing changes were made to hide these failures. They represent acceptance gaps in the public demo application, not fixes made to this repository.

## Test Coverage

| Requirement | Coverage | Result |
|---|---|---|
| AC1 — Cart review | Product names, descriptions, quantity, prices, and cart subtotal | Item details pass; subtotal fails. |
| AC2 — Checkout information | Required fields and sequential field-specific validation | Pass. |
| AC3 — Order overview | Items, payment, shipping, subtotal, tax, total, Cancel, and Finish | Pass for overview and totals; Cancel destination is engine-dependent. |
| AC4 — Order completion | Confirmation, Back Home, and cart clearing | Pass. |
| AC5 — Invalid data | Special characters and malformed values | Fail; values advance without validation. |
| Business rule — Non-empty cart | Direct checkout route with empty cart | Fail. |
| Business rule — Cancel to cart | Cancel from overview | Chromium fails; WebKit passes. |
| Navigation and mobile | Continue Shopping, browser Back, 390px viewport/no overflow | Passed in the serial Chromium/WebKit run. |

## Agents and MCP

- Playwright browser MCP tools were available and used for live exploration and screenshots.
- The planner agent invocation returned no result, so the existing test plan was retained. The existing suite already contains all ten planned scenarios; no duplicate test files were generated.
- The healer agent reviewed the seven serial failures and found settled application behavior rather than selector or timing defects. No healing edits were appropriate; weakening or skipping these assertions would conceal the acceptance gaps.
- The Firefox runtime prerequisite remains unresolved.

## Git Delivery

- Local commit created with the requested message: `feat(tests): Add complete test suite for SCRUM-101 checkout workflow`.
- Push to `https://github.com/LikhithAcharya/AgenticAIProject.git` succeeded after completing GitHub browser authentication. Branch `main` is tracking `origin/main`.
- The GitHub MCP capability available in this environment is read-only; publication was completed using the local Git client.

## Recommendations

1. Add and verify a cart subtotal.
2. Validate checkout names and postal codes before advancing.
3. Block checkout when the cart is empty, including direct route access.
4. Make Cancel return to the cart consistently across browsers.
5. Install the missing Firefox runtime dependency and rerun the suite before release.
