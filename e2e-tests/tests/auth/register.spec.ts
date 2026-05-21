import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage';
import { generateRandomUser } from '../../utils/random-data';

test.describe('Authentication Flow - Register', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test('should register a new user successfully with random data', async ({ page }) => {
    // Sử dụng hàm sinh data ngẫu nhiên để tránh lỗi "Email đã tồn tại"
    const newUser = generateRandomUser();
    const response = await registerPage.register(newUser.displayName, newUser.email, newUser.password);

    // 1. Assert: API trả về 201 Created
    expect(response.status()).toBe(201);

    // 2. Assert: Đăng ký xong phải tự động nhảy vào màn dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
});
