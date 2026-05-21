import { Page, Locator } from '@playwright/test';

export class AdminTopicsPage {
  readonly page: Page;
  readonly createButton: Locator;
  readonly nameInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createButton = page.locator('button').filter({ hasText: /tạo chủ đề/i });
    this.nameInput = page.getByPlaceholder(/Health, Environment/i).or(page.locator('.ant-modal-content input').first());
    this.saveButton = page.getByRole('button', { name: /xác nhận tạo/i });
  }

  async goto() {
    await this.page.goto('/admin/categories');
  }

  async createTopic(topicName: string) {
    await this.createButton.click();
    await this.nameInput.fill(topicName);
    
    // Đợi API trả về thành công khi bấm Save
    const [response] = await Promise.all([
      this.page.waitForResponse(res => res.url().includes('/topics') && res.request().method() === 'POST'),
      this.saveButton.click()
    ]);
    return response;
  }
}
