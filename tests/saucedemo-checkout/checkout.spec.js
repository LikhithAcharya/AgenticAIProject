const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://www.saucedemo.com';

async function signIn(page) {
  await page.goto(BASE_URL);
  await page.getByPlaceholder('Username').fill('standard_user');
  await page.getByPlaceholder('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.locator('.inventory_list')).toBeVisible();
}

async function addItem(page, item = 'sauce-labs-backpack') {
  await page.locator(`[data-test="add-to-cart-${item}"]`).click();
  await expect(page.locator(`[data-test="remove-${item}"]`)).toBeVisible();
}

async function openCart(page, expectedItems = 1) {
  await page.locator('.shopping_cart_link').click();
  await expect(page).toHaveURL(/cart\.html/);
  await expect(page.locator('.cart_item')).toHaveCount(expectedItems);
}

async function openCheckout(page, item = 'sauce-labs-backpack') {
  await signIn(page);
  await addItem(page, item);
  await openCart(page);
  await page.getByRole('button', { name: 'Checkout' }).click();
  await expect(page.getByLabel('First Name')).toBeVisible();
}

async function completeCheckoutInfo(page, firstName = 'QA', lastName = 'Tester', zip = '12345') {
  await page.getByLabel('First Name').fill(firstName);
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('Zip/Postal Code').fill(zip);
  await page.getByRole('button', { name: 'Continue' }).click();
}

test.describe('SCRUM-101 SauceDemo checkout', () => {
  test('Review cart items and their calculated total', async ({ page }) => {
    await signIn(page);
    await addItem(page);
    await addItem(page, 'sauce-labs-bike-light');
    await openCart(page, 2);

    await expect(page.locator('.cart_item')).toHaveCount(2);
    await expect(page.locator('.cart_item').nth(0)).toContainText('Sauce Labs Backpack');
    await expect(page.locator('.cart_item').nth(0)).toContainText('$29.99');
    await expect(page.locator('.cart_item').nth(1)).toContainText('Sauce Labs Bike Light');
    await expect(page.locator('.cart_item').nth(1)).toContainText('$9.99');
    await expect(page.locator('.cart_quantity')).toHaveText(['1', '1']);
    await expect(page.locator('.cart_list')).toContainText('Item total: $39.98');
  });

  test('Use cart navigation controls', async ({ page }) => {
    await signIn(page);
    await addItem(page);
    await openCart(page);
    await page.getByRole('button', { name: 'Continue Shopping' }).click();
    await expect(page.locator('.inventory_list')).toBeVisible();

    await openCart(page);
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page.getByLabel('First Name')).toBeVisible();
  });

  test('Require all checkout information', async ({ page }) => {
    await openCheckout(page);
    const firstName = page.getByLabel('First Name');
    const lastName = page.getByLabel('Last Name');
    const postalCode = page.getByLabel('Zip/Postal Code');
    const error = page.locator('[data-test="error"]');

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(error).toContainText('First Name is required');
    await expect(page).toHaveURL(/checkout-step-one\.html/);

    await firstName.fill('QA');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(error).toContainText('Last Name is required');

    await lastName.fill('Tester');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(error).toContainText('Postal Code is required');

    await postalCode.fill('12345');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });

  test('Reject invalid checkout data', async ({ page }) => {
    await openCheckout(page);
    await completeCheckoutInfo(page, '!@#$%', '1234', 'abc!');
    await expect(page.locator('[data-test="error"]')).toBeVisible();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('Verify the order overview', async ({ page }) => {
    await signIn(page);
    await addItem(page);
    await addItem(page, 'sauce-labs-bike-light');
    await openCart(page, 2);
    await page.getByRole('button', { name: 'Checkout' }).click();
    await completeCheckoutInfo(page);

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(2);
    await expect(page.locator('.summary_info')).toContainText('SauceCard');
    await expect(page.locator('.summary_info')).toContainText('Free Pony Express Delivery!');
    await expect(page.locator('.summary_subtotal_label')).toHaveText('Item total: $39.98');
    await expect(page.locator('.summary_tax_label')).toHaveText('Tax: $3.20');
    await expect(page.locator('.summary_total_label')).toHaveText('Total: $43.18');
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
  });

  test('Finish the order and return home', async ({ page }) => {
    await openCheckout(page);
    await completeCheckoutInfo(page);
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
    await expect(page.locator('.complete-text')).toContainText('order has been dispatched');
    await page.getByRole('button', { name: 'Back Home' }).click();
    await expect(page.locator('.inventory_list')).toBeVisible();
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });

  test('Cancel checkout back to the cart', async ({ page }) => {
    await openCheckout(page);
    await completeCheckoutInfo(page);
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  test('Use browser back from checkout information', async ({ page }) => {
    await openCheckout(page);
    await page.goBack();

    await expect(page).toHaveURL(/cart\.html/);
    await expect(page.locator('.cart_item')).toHaveCount(1);
  });

  test('Prevent checkout with an empty cart', async ({ page }) => {
    await signIn(page);
    await page.goto(`${BASE_URL}/checkout-step-one.html`);

    await expect(page.getByLabel('First Name')).toHaveCount(0);
    await expect(page).not.toHaveURL(/checkout-step-one\.html/);
  });

  test('Check mobile checkout layout', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openCheckout(page);
    const widths = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));

    expect(widths.document).toBeLessThanOrEqual(widths.viewport);
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Zip/Postal Code')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  });
});
