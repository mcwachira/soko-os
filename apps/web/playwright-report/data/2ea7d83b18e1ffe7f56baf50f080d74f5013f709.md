# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pos.spec.ts >> Soko POS >> logs in with demo credentials
- Location: e2e/pos.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/ONLINE|OFFLINE MODE/)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByText(/ONLINE|OFFLINE MODE/) with timeout 5000ms
  - waiting for getByText(/ONLINE|OFFLINE MODE/)

```

```yaml
- heading "SOKO POS Login" [level=2]
- text: Email
- textbox "test@example.com"
- text: Password
- textbox "password"
- text: Failed to fetch
- button "Sign In"
- text: "Demo: test@example.com / password"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Soko POS', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('shows login form when not authenticated', async ({ page }) => {
  9  |     await expect(page.getByText('SOKO POS Login')).toBeVisible();
  10 |     await expect(page.getByPlaceholder('test@example.com')).toBeVisible();
  11 |     await expect(page.getByPlaceholder('password')).toBeVisible();
  12 |   });
  13 | 
  14 |   test('logs in with demo credentials', async ({ page }) => {
  15 |     await page.getByPlaceholder('test@example.com').fill('test@example.com');
  16 |     await page.getByPlaceholder('password').fill('password');
  17 |     await page.getByRole('button', { name: 'Sign In' }).click();
  18 | 
  19 |     await expect(page.getByText('SOKO POS')).toBeVisible();
> 20 |     await expect(page.getByText(/ONLINE|OFFLINE MODE/)).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  21 |   });
  22 | 
  23 |   test('login shows error on invalid credentials', async ({ page }) => {
  24 |     await page.getByPlaceholder('test@example.com').fill('bad@example.com');
  25 |     await page.getByPlaceholder('password').fill('wrong');
  26 |     await page.getByRole('button', { name: 'Sign In' }).click();
  27 | 
  28 |     await expect(page.getByText(/Login failed|Invalid credentials/)).toBeVisible();
  29 |   });
  30 | });
  31 | 
```