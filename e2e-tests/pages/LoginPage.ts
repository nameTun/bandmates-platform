import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  // Khởi tạo các Elements 1 lần duy nhất ở đây
  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder(/email/i).or(page.locator('input[type="email"]'));
    this.passwordInput = page.getByPlaceholder(/mật khẩu|password/i).or(page.locator('input[type="password"]'));
    this.loginButton = page.getByRole('button', { name: /đăng nhập|login/i });
  }

  // Hàm mở trang login (URL đã được cấu hình gốc trong playwright.config.ts)
  async goto() {
    await this.page.goto('/login');
  }

  // Hàm thực hiện hành vi đăng nhập và đợi API
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Bắt và trả về kết quả API ngầm
    const [response] = await Promise.all([
      this.page.waitForResponse(res => res.url().includes('/auth/login')),
      this.loginButton.click()
    ]);
    return response;
  }
}
