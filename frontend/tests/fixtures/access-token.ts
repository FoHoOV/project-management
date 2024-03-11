import { test as baseTest } from './enhanced-page';
import { expect } from '@playwright/test';
import crypto from 'crypto'; // TODO: idk why I need to import this, on windows it works without importing it but on linux it doesnt

// Define a fixture for creating a new user and logging in to capture the access token
export const test = baseTest.extend<{
	auth: { accessToken: string; username: string; password: string };
}>({
	auth: async ({ enhancedPage }, use) => {
		// Generate new user credentials
		const username = 'test' + crypto.getRandomValues(new Uint32Array(1)).join('');
		const password = username;

		// Navigate to the signup page and create a new account
		await enhancedPage.goto('/signup');
		await enhancedPage.locator('input[name="username"]').fill(username);
		await enhancedPage.locator('input[name="password"]').fill(password);
		await enhancedPage.locator('input[name="confirm_password"]').fill(password);
		await enhancedPage.getByRole('button', { name: 'signup' }).click();

		await expect(
			enhancedPage.locator("form div[role='alert'].alert-error"),
			'not errors should have occurred when signing up'
		).not.toBeVisible();

		// Verify redirection to login page after account creation
		await enhancedPage.waitForURL('/login');
		await expect(enhancedPage).toHaveURL('/login');

		// Perform login
		await enhancedPage.locator('input[name="username"]').fill(username);
		await enhancedPage.locator('input[name="password"]').fill(password);
		await enhancedPage.getByRole('button', { name: 'login' }).click();

		await expect(
			enhancedPage.locator("form div[role='alert'].alert-error"),
			'not errors should have occurred when logging in'
		).not.toBeVisible();

		// Verify redirection to projects page after account creation
		await enhancedPage.waitForURL('/user/projects');
		await expect(enhancedPage).toHaveURL('/user/projects');

		// Capture the access_token from cookies
		const cookies = await enhancedPage.context().cookies();
		const accessTokenCookie = cookies.find((cookie) => cookie.name === 'token');

		expect(accessTokenCookie, 'token cookie should be present').toBeTruthy();

		const accessToken = JSON.parse(decodeURIComponent(accessTokenCookie!.value))?.access_token;

		expect(accessToken, 'token cookie should have an access_token property').toBeTruthy();

		// Use the access token for subsequent tests
		await use({ accessToken: accessToken!, username, password });
	}
});
