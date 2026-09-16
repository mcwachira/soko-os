import { test, expect } from '@playwright/test';

test.describe('Soko POS', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows login form when not authenticated', async ({ page }) => {
    await expect(page.getByText('SOKO POS Login')).toBeVisible();
    await expect(page.getByPlaceholder('test@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('password')).toBeVisible();
  });

  test('logs in with demo credentials', async ({ page }) => {
    await page.getByPlaceholder('test@example.com').fill('test@example.com');
    await page.getByPlaceholder('password').fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('SOKO POS')).toBeVisible();
  });

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('test@example.com').fill('bad@example.com');
    await page.getByPlaceholder('password').fill('wrong');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText(/Login failed|Invalid credentials/)).toBeVisible();
  });

  test('opens shift and completes cash sale', async ({ page }) => {
    await page.getByPlaceholder('test@example.com').fill('test@example.com');
    await page.getByPlaceholder('password').fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('SOKO POS')).toBeVisible();

    await page.getByRole('button', { name: 'Close Shift' }).click();

    await page.getByLabel('Terminal').selectOption({ index: 1 });
    await page.getByLabel('Opening Float').fill('5000');
    await page.getByRole('button', { name: 'Open Shift' }).click();

    await expect(page.getByText('Shift Open')).toBeVisible();

    await page.getByPlaceholder('Search products by name, SKU, or barcode...').fill('MILK');
    await page.waitForTimeout(500);

    const productCards = page.locator('.border-2.border-black');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);

    await productCards.first().click();

    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.getByLabel('Walk-in Customer').click();
    await page.getByRole('button', { name: 'Pay' }).click();

    await expect(page.getByText('Sale Complete')).toBeVisible();
  });
});
