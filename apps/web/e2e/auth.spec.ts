import { test, expect } from '@playwright/test';

test.describe('PuffiFlow Authentication & OTP Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept Supabase email_exists RPC calls
    await page.route('**/rest/v1/rpc/email_exists', async (route) => {
      const request = route.request();
      const postData = JSON.parse(request.postData() || '{}');
      if (postData.check_email === 'existing@example.com') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: 'true' });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: 'false' });
      }
    });

    // Intercept Supabase Auth signUp calls
    await page.route('**/auth/v1/signup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'usr_test_1001', email: 'newuser@example.com' },
          session: null,
        }),
      });
    });

    // Intercept Supabase Auth verifyOtp calls
    await page.route('**/auth/v1/verify*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 'usr_test_1001', email: 'newuser@example.com' },
          session: { access_token: 'mock_token', token_type: 'bearer' },
        }),
      });
    });
  });

  test('Signup flow shows live email check, password criteria, and redirects to verify-email', async ({ page }) => {
    await page.goto('/signup');

    // 1. Check title & role headings
    await expect(page.getByRole('heading', { name: 'Join PuffiFlow 4K' })).toBeVisible();

    // 2. Type existing email and verify inline warning
    const emailInput = page.getByPlaceholder('you@example.com');
    await emailInput.fill('existing@example.com');
    await expect(page.getByText('Email already registered.')).toBeVisible();

    // 3. Change to new email
    await emailInput.fill('newuser@example.com');
    await expect(page.getByText('Email already registered.')).not.toBeVisible();

    // 4. Test password criteria & strength meter
    const passwordInputs = page.getByPlaceholder('••••••••••••');
    await passwordInputs.nth(0).fill('Weak1!');
    await expect(page.getByText('8+ characters')).toBeVisible();

    await passwordInputs.nth(0).fill('StrongP@ssw0rd!');
    await passwordInputs.nth(1).fill('StrongP@ssw0rd!');

    // 5. Submit form
    const submitBtn = page.getByRole('button', { name: 'Sign Up & Send Code' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 6. Assert redirection to /verify-email
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.getByRole('heading', { name: 'Enter 6-Digit Code' })).toBeVisible();
  });

  test('OTP 6-box input allows typing code and submitting', async ({ page }) => {
    await page.goto('/verify-email?email=newuser%40example.com');

    await expect(page.getByText('newuser@example.com')).toBeVisible();

    const otpBoxes = page.locator('input[inputmode="numeric"]');
    await expect(otpBoxes).toHaveCount(6);

    // Type 6 digits
    for (let i = 0; i < 6; i++) {
      await otpBoxes.nth(i).fill(String(i + 1));
    }

    const verifyBtn = page.getByRole('button', { name: 'Verify & Launch Dashboard' });
    await expect(verifyBtn).toBeEnabled();
    await verifyBtn.click();

    // Assert redirection to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Login page validates non-existent email and submits credentials', async ({ page }) => {
    // Intercept signInWithPassword
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock_access_token',
          user: { id: 'usr_test_1001', email: 'user@example.com' },
        }),
      });
    });

    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Log in to PuffiFlow' })).toBeVisible();

    const emailInput = page.getByPlaceholder('you@example.com');
    await emailInput.fill('unknown@example.com');
    await expect(page.getByText('Email does not exist.')).toBeVisible();

    await emailInput.fill('user@example.com');
    await page.getByPlaceholder('••••••••••••').fill('ValidPass123!');

    const loginBtn = page.getByRole('button', { name: 'Log In' });
    await loginBtn.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
