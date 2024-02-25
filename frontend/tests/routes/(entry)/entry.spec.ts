import { expect, test } from '@playwright/test';

test('checking login page contents', async ({ page }) => {
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

test('changing entry page from login page', async ({ page }) => {
	await page.goto('/login');

	const signUpLink = await page.locator('form a[href="/signup"]');
	await expect(signUpLink, 'redirect to signup page should exist in login page').toBeVisible();

	await signUpLink.click();

	await expect(page, 'page should be redirected to signup page').toHaveURL('signup');
});

test('changing entry page from signup page', async ({ page }) => {
	await page.goto('/signup');

	const loginLink = await page.locator('form a[href="/login"]');
	await expect(loginLink, 'redirect to login page should exist in signup page').toBeVisible();

	await loginLink.click();

	await expect(page, 'page should be redirected to login page').toHaveURL('login');
});
