import { expect } from '@playwright/test';
import { test } from '../../fixtures/test';

test('checking login page contents', async ({ enhancedPage }) => {
	await enhancedPage.goto('/login');

	await expect(
		enhancedPage.getByRole('heading', { name: 'Login to your existing account' }),
		'login page should have correct hero text'
	).toBeVisible();

	const loginButton = enhancedPage.getByRole('button', { name: 'login' });
	await loginButton.click();

	expect(
		enhancedPage.url().endsWith('/login'),
		'page should still be on login page because inputs are empty'
	).toBeTruthy();
});

test('changing entry page from login page', async ({ enhancedPage }) => {
	await enhancedPage.goto('/login');

	const signUpLink = enhancedPage.locator('form a[href="/signup"]');
	await expect(signUpLink, 'redirect to signup page should exist in login page').toBeVisible();

	await signUpLink.click();

	await expect(enhancedPage, 'page should be redirected to signup page').toHaveURL('signup');
});

test('changing entry page from signup page', async ({ enhancedPage }) => {
	await enhancedPage.goto('/signup');

	const loginLink = enhancedPage.locator('form a[href="/login"]');
	await expect(loginLink, 'redirect to login page should exist in signup page').toBeVisible();

	await loginLink.click();

	await expect(enhancedPage, 'page should be redirected to login page').toHaveURL('login');
});
