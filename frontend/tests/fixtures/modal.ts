import { type Page, expect } from '@playwright/test';

export async function getModal(page: Page, shouldBeVisible = true) {
	const modal = await page.locator('dialog.modal').first();
	shouldBeVisible && (await expect(modal, 'modal should be visible').toBeVisible());
	return modal;
}
