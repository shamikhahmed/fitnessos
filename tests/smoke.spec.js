// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('PulseCap smoke', () => {
  test('loads shell without fatal errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(800);
    const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
    expect(fatal).toEqual([]);
  });

  test('manifest link present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });

  test('navigates to workout screen without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('workout'));
    await page.waitForTimeout(600);
    await expect(page.locator('#view .screen')).toBeVisible();
    const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
    expect(fatal).toEqual([]);
  });
});
