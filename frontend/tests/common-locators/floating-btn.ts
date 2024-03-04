import { type Page, expect } from '@playwright/test';

export async function getFloatingBtn(page: Page, shouldBeVisible = true) {
	const floatingBtn = page.locator('button.btn-primary.fixed.bottom-8.right-8.h-16.w-16');
	shouldBeVisible && (await expect(floatingBtn, 'floating btn should be visible').toBeVisible());
	return floatingBtn;
}
