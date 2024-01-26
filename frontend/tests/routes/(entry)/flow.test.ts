import { test, expect } from '@playwright/test';

test('signup then login flow', async ({ page }, testInfo) => {
	testInfo.setTimeout(60 * 1000);

	// goto signup page
	await page.goto('/signup');

	// new user credentials
	const username = 'test' + crypto.getRandomValues(new Uint32Array(1)).join('');
	const password = username;

	// create an account
	await page.locator('input[name="username"]').click();
	await page.locator('input[name="username"]').fill(username);
	await page.locator('input[name="username"]').press('Tab');
	await page.locator('input[name="password"]').fill(password);
	await page.locator('input[name="password"]').press('Tab');
	await page.locator('input[name="confirm_password"]').fill(password);
	await page.getByRole('button', { name: 'signup' }).click();

	// page should be redirected to login
	await expect(page, 'after a successful signup page should be redirected to login').toHaveURL(
		'/login'
	);

	// login with the newly created account
	await page.locator('input[name="username"]').click();
	await page.locator('input[name="username"]').fill(username);
	await page.locator('input[name="username"]').press('Tab');
	await page.locator('input[name="password"]').fill(password);

	await page.getByRole('button', { name: 'login' }).click();

	// expect a successful login
	await expect(page, 'after logging page should be on /projects').toHaveURL('/user/projects');
});

test('incorrect login attempt flow', async ({ page }) => {
	// goto login page
	await page.goto('/login');

	// random user credentials
	const username = 'test' + crypto.getRandomValues(new Uint32Array(1)).join('');
	const password = username;

	// fill the form
	await page.locator('input[name="username"]').click();
	await page.locator('input[name="username"]').fill(username);
	await page.locator('input[name="username"]').press('Tab');
	await page.locator('input[name="password"]').fill(password);

	// try logging in
	await page.locator('input[name="password"]').press('Enter');

	await expect(
		page.getByText('Incorrect username or password'),
		'incorrect username and passwords should be rejected'
	).toBeVisible();
});
