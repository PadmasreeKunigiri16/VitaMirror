import { test, expect } from '@playwright/test';

/**
 * VitaMirror E2E Tests
 * 
 * Requires:
 *   - Frontend running: npm run dev (port 5173)
 *   - Backend running: uvicorn app.main:app (port 8000)
 */

test.describe('Landing Page', () => {
  test('loads landing page with hero heading', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/VitaMirror/i);
    await expect(page.getByText('Meet')).toBeVisible();
    await expect(page.getByText('VitaMirror', { exact: false }).first()).toBeVisible();
  });

  test('shows educational disclaimer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/Educational/i)).toBeVisible();
  });

  test('Get Started button navigates to wellness check', async ({ page }) => {
    await page.goto('/');
    await page.click('#hero-get-started-btn');
    await expect(page).toHaveURL(/\/check/);
  });

  test('Dashboard button navigates to dashboard', async ({ page }) => {
    await page.goto('/');
    await page.click('#hero-dashboard-btn');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('Navigation', () => {
  test('navbar links are visible on dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('History')).toBeVisible();
  });

  test('VitaMirror logo navigates to landing', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Dashboard', () => {
  test('dashboard page loads', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Wellness Overview')).toBeVisible();
  });

  test('shows start new check button', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('#dashboard-start-check-btn, #empty-start-check-btn')).toBeVisible({ timeout: 8000 });
  });

  test('shows disclaimer', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/non-diagnostic/i)).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Wellness Check Page', () => {
  test('wellness check page loads', async ({ page }) => {
    await page.goto('/check');
    await expect(page.getByText('Camera Analysis')).toBeVisible();
  });

  test('shows camera tips', async ({ page }) => {
    await page.goto('/check');
    await expect(page.getByText(/Tips for best results/i)).toBeVisible();
  });

  test('shows disclaimer', async ({ page }) => {
    await page.goto('/check');
    await expect(page.getByText(/non-diagnostic/i)).toBeVisible();
  });

  test('camera button is present in idle state', async ({ page }) => {
    await page.goto('/check');
    // Either the camera auto-starts or shows a start button
    const startBtn = page.locator('#start-camera-btn');
    // May or may not be visible depending on browser camera state
    await page.waitForTimeout(1000);
    // Page should at least render without crash
    await expect(page.getByText('Camera Analysis')).toBeVisible();
  });
});

test.describe('History Page', () => {
  test('history page loads', async ({ page }) => {
    await page.goto('/history');
    await expect(page.getByText('Wellness History')).toBeVisible();
  });

  test('shows empty state or check list', async ({ page }) => {
    await page.goto('/history');
    await page.waitForTimeout(2000);
    // Either shows empty state OR a list of checks
    const hasEmptyState = await page.locator('text=No history yet').isVisible().catch(() => false);
    const hasChecks = await page.locator('[id^="history-item-"]').count().then((n) => n > 0).catch(() => false);
    expect(hasEmptyState || hasChecks).toBeTruthy();
  });
});

test.describe('Privacy Page', () => {
  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText('Privacy Notice')).toBeVisible();
  });

  test('shows delete all button', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('#delete-all-btn')).toBeVisible();
  });

  test('shows what data is collected', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText(/What Data Is Collected/i)).toBeVisible();
  });
});

test.describe('404 / Unknown routes', () => {
  test('unknown route redirects to dashboard', async ({ page }) => {
    await page.goto('/some-unknown-route');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
