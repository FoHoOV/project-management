import { expect } from '@playwright/test';
import { test } from '../../fixtures/test';

test('signup then login flow', async ({ enhancedPage }, testInfo) => {
	testInfo.setTimeout(60 * 1000);

	// goto signup page
	await enhancedPage.goto('/signup');

	// new user credentials
	const username = 'test' + crypto.getRandomValues(new Uint32Array(1)).join('');
	const password = username;

	// create an account
	await enhancedPage.locator('input[name="username"]').click();
	await enhancedPage.locator('input[name="username"]').fill(username);
	await enhancedPage.locator('input[name="username"]').press('Tab');
	await enhancedPage.locator('input[name="password"]').fill(password);
	await enhancedPage.locator('input[name="password"]').press('Tab');
	await enhancedPage.locator('input[name="confirm_password"]').fill(password);
	await enhancedPage.getByRole('button', { name: 'signup' }).click();

	// page should be redirected to login
	await expect(
		enhancedPage,
		'after a successful signup page should be redirected to login'
	).toHaveURL('/login');

	// login with the newly created account
	await enhancedPage.locator('input[name="username"]').click();
	await enhancedPage.locator('input[name="username"]').fill(username);
	await enhancedPage.locator('input[name="username"]').press('Tab');
	await enhancedPage.locator('input[name="password"]').fill(password);

	await enhancedPage.getByRole('button', { name: 'login' }).click();

	// expect a successful login
	await expect(enhancedPage, 'after logging page should be on /projects').toHaveURL(
		'/user/projects'
	);
});

test('incorrect login attempt flow', async ({ enhancedPage }) => {
	// goto login page
	await enhancedPage.goto('/login');

	// random user credentials
	const username = 'test' + crypto.getRandomValues(new Uint32Array(1)).join('');
	const password = username;

	// fill the form
	await enhancedPage.locator('input[name="username"]').click();
	await enhancedPage.locator('input[name="username"]').fill(username);
	await enhancedPage.locator('input[name="username"]').press('Tab');
	await enhancedPage.locator('input[name="password"]').fill(password);

	// try logging in
	await enhancedPage.locator('input[name="password"]').press('Enter');

	await expect(
		enhancedPage.getByText('Incorrect username or password'),
		'incorrect username and passwords should be rejected'
	).toBeVisible();
});
