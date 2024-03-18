import type { Page } from '@playwright/test';
import type { Toast } from '../../src/lib/stores/toasts';

/**
 * @param timeout - timeout in ms
 */
export async function waitForToastMessage(page: Page, message: string, timeout?: number) {
	await page.locator('.toast', { hasText: message }).waitFor({ state: 'visible', timeout });
}

export async function waitForToastType(page: Page, type: Toast['type'], timeout?: number) {
	await page.locator(`.toast .alert-${type}`).waitFor({ state: 'visible', timeout });
}
