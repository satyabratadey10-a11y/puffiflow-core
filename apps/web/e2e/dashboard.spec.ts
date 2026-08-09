import { test, expect } from '@playwright/test';

test.describe('PuffiFlow Dashboard & Storage Setup', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept storage status API
    await page.route('**/api/storage/status*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          storageSetupCompleted: true,
          storageProvider: 'supabase',
          bucketName: 'puffiflow-videos',
          publicDomain: null,
        }),
      });
    });

    // Intercept jobs API
    await page.route('**/api/jobs*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ jobs: [] }),
      });
    });

    // Intercept Supabase Storage setup endpoint
    await page.route('**/api/storage/setup-supabase', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Supabase Storage enabled successfully!',
          storageProvider: 'supabase',
          bucketName: 'puffiflow-videos',
        }),
      });
    });
  });

  test('Storage Setup page switches between Supabase Storage and Cloudflare R2 tabs', async ({ page }) => {
    await page.goto('/dashboard/setup?userId=usr_demo_1001');

    await expect(page.getByRole('heading', { name: 'Dual Storage Architecture' })).toBeVisible();

    // Default active tab should be Supabase Storage
    const supabaseTab = page.getByRole('button', { name: 'Supabase Storage (No CC Needed)' });
    const r2Tab = page.getByRole('button', { name: 'Cloudflare R2 / S3 (CC Required)' });

    await expect(supabaseTab).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save & Enable Supabase Storage' })).toBeVisible();

    // Switch to Cloudflare R2 Tab
    await r2Tab.click();
    await expect(page.getByPlaceholder('e.g. a1b2c3d4e5f67890abcdef1234567890')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Test & Save Connection' })).toBeVisible();

    // Switch back to Supabase Tab
    await supabaseTab.click();
    const saveBtn = page.getByRole('button', { name: 'Save & Enable Supabase Storage' });
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    await expect(page.getByText('Supabase Storage enabled successfully!')).toBeVisible();
  });

  test('Dashboard loads scheduler and status table without errors', async ({ page }) => {
    await page.goto('/dashboard?userId=usr_demo_1001');

    await expect(page.getByRole('heading', { name: '4K Video Upscaling & Publishing Console' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Schedule New 4K Video Job' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Scheduled & Processed 4K Jobs' })).toBeVisible();
  });
});
