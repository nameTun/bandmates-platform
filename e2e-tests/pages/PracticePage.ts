import { Page, Locator } from '@playwright/test';

export class PracticePage {
  readonly page: Page;
  readonly textInput: Locator;
  readonly submitButton: Locator;
  readonly resultScore: Locator;

  constructor(page: Page) {
    this.page = page;
    // Giả định locators dựa trên giao diện thông thường
    this.textInput = page.getByPlaceholder(/nhập bài làm|type your essay/i).or(page.locator('textarea').first());
    this.submitButton = page.getByRole('button', { name: /chấm điểm|submit|check/i });
    // Nhận diện kết quả AI trả về qua chữ 'Overall' ở vòng tròn điểm
    this.resultScore = page.getByText('Overall', { exact: true });
  }

  async goto() {
    await this.page.goto('/practice');
    // 1. Chọn đề thi đầu tiên trong thư viện (bấm vào card có chữ 'Làm bài')
    await this.page.locator('.group').filter({ hasText: 'Làm bài' }).first().click();
    // 2. Bấm nút 'Bắt đầu làm bài' để bắt đầu tính giờ
    await this.page.getByRole('button', { name: /bắt đầu làm bài/i }).click();
  }

  async submitEssay(essayText: string) {
    await this.textInput.fill(essayText);
    await this.submitButton.click();
  }
}
