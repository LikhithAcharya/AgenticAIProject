# SCRUM-101: SauceDemo Checkout Test Plan

## Story and scope

Verify the SauceDemo purchase flow at `https://www.saucedemo.com` against the
SCRUM-101 acceptance criteria. The suite covers cart contents and navigation,
checkout form validation, overview totals, order completion, empty-cart access,
browser back behavior, and a mobile viewport.

**Test account:** `standard_user` / `secret_sauce`  
**Browsers:** Chromium, Firefox, and WebKit (Safari engine)  
**Test data:** Sauce Labs Backpack ($29.99), Sauce Labs Bike Light ($9.99);
checkout details `QA Tester`, ZIP `12345`; invalid values `!@#$%`, `1234`,
`abc!`.

Each scenario starts with a fresh browser context and signs in unless noted.
Cart scenarios add their own items. The site is a shared public demo, so tests
must not assume persisted state between runs.

## Test scenarios

### 1. Review cart items and their calculated total

1. Sign in with the supplied standard-user account. **Expected:** the products
   page is displayed.
2. Add the Backpack and Bike Light, then open the cart. **Expected:** both
   products appear once with their names, descriptions, quantity `1`, and prices
   `$29.99` and `$9.99`.
3. Inspect the cart for a calculated item subtotal of `$39.98`. **Expected:**
   the cart displays the sum of the two item prices.

### 2. Use cart navigation controls

1. Sign in, add the Backpack, and open the cart. **Expected:** the cart item and
   both navigation controls are visible.
2. Select **Continue Shopping**. **Expected:** return to the products page.
3. Open the cart again and select **Checkout**. **Expected:** the checkout
   information form is displayed.

### 3. Require all checkout information

1. Sign in, add the Backpack, open the cart, and select **Checkout**.
   **Expected:** First Name, Last Name, and Zip/Postal Code fields are present.
2. Submit the empty form. **Expected:** an error identifies First Name as
   required and checkout does not advance.
3. Fill First Name only and submit. **Expected:** an error identifies Last Name
   as required and checkout does not advance.
4. Fill Last Name and submit with ZIP empty. **Expected:** an error identifies
   Postal Code as required and checkout does not advance.
5. Fill ZIP with `12345` and submit. **Expected:** the order overview opens.

### 4. Reject invalid checkout data

1. Reach the checkout information form with one item in the cart.
   **Expected:** the three required fields are available.
2. Enter `!@#$%` as First Name, `1234` as Last Name, and `abc!` as ZIP/Postal
   Code; submit. **Expected:** a validation error is shown and the form does
   not advance to the overview.

### 5. Verify the order overview

1. Add the Backpack and Bike Light and submit valid checkout information.
   **Expected:** both items appear in the overview.
2. Inspect payment and shipping information. **Expected:** a payment method and
   shipping method are displayed.
3. Inspect price totals. **Expected:** item total `$39.98`, tax `$3.20`, and
   order total `$43.18` are displayed, with **Cancel** and **Finish** controls.

### 6. Finish the order and return home

1. Reach the overview with the Backpack in the cart and valid information.
   **Expected:** **Finish** is available.
2. Select **Finish**. **Expected:** the confirmation page states the order was
   dispatched successfully and offers **Back Home**.
3. Select **Back Home**. **Expected:** the products page opens and the cart is
   empty.

### 7. Cancel checkout back to the cart

1. Reach the order overview with the Backpack in the cart.
   **Expected:** **Cancel** is available.
2. Select **Cancel**. **Expected:** return to the cart with the item preserved,
   per the story's business rule.

### 8. Use browser back from checkout information

1. Reach checkout information from a populated cart.
   **Expected:** the checkout form is displayed.
2. Use browser Back. **Expected:** return to the cart with the item preserved.

### 9. Prevent checkout with an empty cart

1. Sign in with an empty cart and navigate directly to the checkout information
   URL. **Expected:** checkout is blocked or redirected; checkout fields are
   not available.

### 10. Check mobile checkout layout

1. Set a mobile viewport (390 CSS pixels wide), sign in, add the Backpack, and
   navigate to checkout information. **Expected:** the form and controls remain
   usable.
2. Compare document width with viewport width. **Expected:** no horizontal
   overflow.

## Execution notes

Exploratory observations on 2026-11-08 are captured in
`test-results/SCRUM-101-checkout-test-report.md` and the screenshots in
`test-results/`. Test expectations intentionally reflect the story, so a
failure against SauceDemo's current behavior is recorded as a product gap,
not made to pass by weakening the assertion.
