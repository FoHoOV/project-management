import { test as baseTest, expect } from '@playwright/test';

// Define a fixture for creating a new user and logging in to capture the access token
export const test = baseTest.extend<{
	auth: { accessToken: string; username: string; password: string };
}>({
	auth: async ({ page }, use) => {
		// Generate new user credentials
		const username = 'test' + crypto.getRandomValues(new Uint32Array(1)).join('');
		const password = username;

		// Navigate to the signup page and create a new account
		await page.goto('/signup');
		await page.locator('input[name="username"]').fill(username);
		await page.locator('input[name="password"]').fill(password);
		await page.locator('input[name="confirm_password"]').fill(password);
		await page.getByRole('button', { name: 'signup' }).click();

		// Verify redirection to login page after account creation
		await expect(page).toHaveURL('/login');

		// Perform login
		await page.locator('input[name="username"]').fill(username);
		await page.locator('input[name="password"]').fill(password);
		await page.getByRole('button', { name: 'login' }).click();

		await expect(page).toHaveURL('/user/projects');

		// Capture the access_token from cookies
		const cookies = await page.context().cookies();
		const accessTokenCookie = cookies.find((cookie) => cookie.name === 'token');

		await expect(accessTokenCookie, 'token cookie should be present').toBeTruthy();

		const accessToken = JSON.parse(decodeURIComponent(accessTokenCookie!.value))?.access_token;

		await expect(accessToken, 'token cookie should have an access_token property').toBeTruthy();

		// Use the access token for subsequent tests
		await use({ accessToken: accessToken!, username, password });
	}
});
