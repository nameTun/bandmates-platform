import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AdminTopicsPage } from '../../pages/AdminTopicsPage';

test.describe('Admin Flow - Manage Topics', () => {
  let adminTopicsPage: AdminTopicsPage;

  test.beforeEach(async ({ page }) => {
    // 1. Kịch bản yêu cầu Đăng nhập Admin trước
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@gmail.com', 'Admin123456');
    await expect(page).toHaveURL(/.*\/admin/); // Đảm bảo vào đúng quyền Admin

    // 2. Di chuyển tới trang quản lý Topics
    adminTopicsPage = new AdminTopicsPage(page);
    await adminTopicsPage.goto();
  });

  test('should create a new topic successfully', async ({ page }) => {
    // Gắn thêm timestamp để tên Topic không bao giờ bị trùng
    const uniqueTopicName = `QA Auto Topic ${Date.now()}`;
    const response = await adminTopicsPage.createTopic(uniqueTopicName);

    // 1. Assert: Gọi API POST /topics thành công
    expect(response.status()).toBe(201);

    // 2. Assert: Chữ của Topic mới phải xuất hiện rành rành trên giao diện màn hình
    await expect(page.getByText(uniqueTopicName)).toBeVisible();
  });
});
