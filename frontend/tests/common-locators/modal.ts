import { type Page, type Locator, expect } from '@playwright/test';

export async function getModal(page: Page, shouldBeVisible = true) {
	const modal = await page.locator('dialog.modal').first();
	shouldBeVisible && (await expect(modal, 'modal should be visible').toBeVisible());
	return modal;
}

export async function closeModal(modal: Locator) {
	await modal.getByRole('button', { name: 'Close' }).click();
}
