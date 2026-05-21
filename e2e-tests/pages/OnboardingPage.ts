import { Page } from '@playwright/test';

export class OnboardingPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async completeOnboarding() {
    // Đợi Modal xuất hiện
    await this.page.getByText('Chào mừng bạn đến với BandMates').waitFor({ state: 'visible' });
    
    // 1. Current band
    await this.page.locator('#currentBand').click();
    for (let i = 0; i < 5; i++) await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    // 2. Target band
    await this.page.locator('#targetBand').click();
    for (let i = 0; i < 12; i++) await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    // 3. Exam type
    await this.page.locator('#examType').click();
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    // 4. Target Date
    await this.page.locator('#targetDate').fill('31/12/2026');
    await this.page.keyboard.press('Enter');

    // 5. Weakest skill
    await this.page.locator('#weakestSkill').click();
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    await this.page.keyboard.press('Escape');

    // 6. Study purpose
    await this.page.locator('#studyPurpose').click();
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');

    // 7. Submit (Thêm delay nhỏ để form kịp cập nhật model trước khi submit)
    await this.page.waitForTimeout(500);
    await this.page.getByRole('button', { name: /bắt đầu lộ trình/i }).click({ force: true });
    
    // Đợi Modal biến mất
    await this.page.getByText('Chào mừng bạn đến với BandMates').waitFor({ state: 'hidden' });
  }
}
