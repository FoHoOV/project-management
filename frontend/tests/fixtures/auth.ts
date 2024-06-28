import { test as baseTest, type EnhancedPage } from './enhanced-page';
import { expect } from '@playwright/test';
import crypto from 'crypto'; // TODO: idk why I need to import this, on windows it works without importing it but on linux it doesnt
import { SERVER_ONLY_KEYS } from '../../src/lib/constants/cookie.server';

export class Auth {
	#enhancedPage: EnhancedPage;
	#currentLoggedInUser:
		| {
				accessToken: string;
				username: string;
				password: string;
		  }
		| undefined;

	constructor(enhancedPage: EnhancedPage) {
		this.#enhancedPage = enhancedPage;
	}

	async login() {
		if (this.isAuthenticated) {
			throw new Error('already logged in, try logging out first.');
		}
		// Generate new user credentials
		const username = 'test' + crypto.getRandomValues(new Uint32Array(1)).join('');
		const password = username;

		// Navigate to the signup page and create a new account
		await this.#enhancedPage.goto('/signup');
		await this.#enhancedPage.locator('input[name="username"]').fill(username);
		await this.#enhancedPage.locator('input[name="password"]').fill(password);
		await this.#enhancedPage.locator('input[name="confirm_password"]').fill(password);
		await this.#enhancedPage.getByRole('button', { name: 'signup' }).click();

		await expect(
			this.#enhancedPage.locator("form div[role='alert'].alert-error"),
			'not errors should have occurred when signing up'
		).not.toBeVisible();

		// Verify redirection to login page after account creation
		await this.#enhancedPage.waitForURL('/login');
		await expect(this.#enhancedPage).toHaveURL('/login');

		// Perform login
		await this.#enhancedPage.locator('input[name="username"]').fill(username);
		await this.#enhancedPage.locator('input[name="password"]').fill(password);
		await this.#enhancedPage.getByRole('button', { name: 'login' }).click();

		await expect(
			this.#enhancedPage.locator("form div[role='alert'].alert-error"),
			'not errors should have occurred when logging in'
		).not.toBeVisible();

		// Verify redirection to projects page after account creation
		await this.#enhancedPage.waitForURL('/user/projects');
		await expect(this.#enhancedPage).toHaveURL('/user/projects');

		// Capture the access_token from cookies
		const cookies = await this.#enhancedPage.context().cookies();
		const accessTokenCookie = cookies.find((cookie) => cookie.name === SERVER_ONLY_KEYS.token);

		expect(accessTokenCookie, 'token cookie should be present').not.toBeNull();

		const accessToken = JSON.parse(decodeURIComponent(accessTokenCookie!.value))?.access_token;

		expect(accessToken, 'token cookie should have an access_token property').not.toBeNull();

		this.#currentLoggedInUser = {
			accessToken: accessToken as string,
			username,
			password
		};
		return this.#currentLoggedInUser;
	}

	async logout() {
		await this.#enhancedPage.goto('/user/logout');
		await expect(this.#enhancedPage.getByTestId('logout-btn')).toBeVisible();
		await this.#enhancedPage.getByTestId('logout-btn').click();
		await expect(this.#enhancedPage).toHaveURL('/login');
		this.#currentLoggedInUser = undefined;
	}

	get currentLoggedInUser() {
		return this.#currentLoggedInUser;
	}

	get isAuthenticated() {
		return this.#currentLoggedInUser !== undefined;
	}
}

// Define a fixture for creating a new user and logging in to capture the access token
export const test = baseTest.extend<{
	authUtils: Auth;
}>({
	authUtils: async ({ enhancedPage }, use) => {
		await use(new Auth(enhancedPage));
	}
});
