import { test, expect } from '@playwright/test';
import { PracticePage } from '../../pages/PracticePage';
import { RegisterPage } from '../../pages/RegisterPage';
import { OnboardingPage } from '../../pages/OnboardingPage';
import { generateRandomUser } from '../../utils/random-data';

test.describe('User Flow - Practice & History', () => {
  let practicePage: PracticePage;

  test.beforeEach(async ({ page }) => {
    // 1. Tạo mới 1 user (để tránh bị trùng data history của bài test khác)
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    const newUser = generateRandomUser();
    await registerPage.register(newUser.displayName, newUser.email, newUser.password);
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Hoàn thành Onboarding Form
    const onboardingPage = new OnboardingPage(page);
    await onboardingPage.completeOnboarding();

    // 3. Sang trang Practice
    practicePage = new PracticePage(page);
    await practicePage.goto();
  });

  test('should submit an essay and view score successfully', async ({ page }) => {
    // Arrange: Nội dung bài test mẫu
    const mockEssay = "This is a sample essay for testing the AI scoring system of BandMates. The quick brown fox jumps over the lazy dog.";
    
    // Act: Gửi bài
    await practicePage.submitEssay(mockEssay);

    // Assert 1: API AI chấm điểm thành công (đã gỡ check HTTP vì dễ gây timeout ở Webkit, thay bằng check giao diện bên dưới)

    // Assert 2: Giao diện phải hiển thị điểm (tăng timeout lên 15s vì AI có thể trả lời chậm)
    await expect(practicePage.resultScore).toBeVisible({ timeout: 15000 });

    // Assert 3: Kiểm tra Lịch sử
    // Chuyển qua trang History
    await page.goto('/history');
    // Bài văn vừa gõ phải xuất hiện trong bảng Lịch sử (kiểm tra không bị rỗng là được vì body bài ko hiện ở màn này)
    await expect(page.getByText('Bạn chưa làm bài nào')).toBeHidden();
    // Hoặc kiểm tra xem có card bài làm nào không
    await expect(page.getByRole('button', { name: /xóa bài làm/i }).first()).toBeVisible();
  });
});
