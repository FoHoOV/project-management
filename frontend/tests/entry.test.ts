import { expect, test } from '@playwright/test';

test('login page contents', async ({ page }) => {
	await page.goto('/login');

	await expect(
		page.getByRole('heading', { name: 'Login to your existing account' }),
		'login page should have correct hero text'
	).toBeVisible();

	const loginButton = await page.getByRole('button', { name: 'login' });
	await loginButton.click();

	await expect(
		page.url().endsWith('/login'),
		'page should still be on login page because inputs are empty'
	).toBeTruthy();
});
