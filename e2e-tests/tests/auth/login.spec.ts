import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Authentication Flow - Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Gọi class LoginPage đã được cấu trúc
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login as admin and redirect to admin dashboard', async ({ page }) => {
    // 1. Act: Chỉ gọi 1 dòng code duy nhất, code rất sạch
    const response = await loginPage.login('test@gmail.com', 'Test123456');

    // 2. Assert API Response
    expect(response.status()).toBe(201);

    // 3. Assert Navigation
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // 1. Act
    const response = await loginPage.login('wrong@gmail.com', 'WrongPass!');

    // 2. Assert API Response
    expect(response.status()).toBe(401);

    // 3. Assert Navigation (Vẫn phải ở lại trang login)
    await expect(page).toHaveURL(/.*\/login/);
  });
});
