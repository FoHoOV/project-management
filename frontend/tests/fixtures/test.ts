import { type Page, test as baseTest, type Locator } from '@playwright/test';

export interface EnhancedPage extends Page {
	goto(
		url: string,
		options?: Parameters<Page['goto']>[1] & { waitForHydration?: boolean }
	): ReturnType<Page['goto']>;
}

export async function waitForAnimationEnd(locator: Locator) {
	const handle = await locator.elementHandle();
	await handle?.waitForElementState('stable');
	handle?.dispose();
}

export async function waitForHydration(page: Page) {
	await page
		.locator("body[data-svelte-hydrated='true']")
		.waitFor({ state: 'attached', timeout: 5000 });
}

export const test = baseTest.extend<{ enhancedPage: EnhancedPage }>({
	enhancedPage: async ({ page }, use) => {
		const customPage = new Proxy(page, {
			get(target, prop) {
				if (prop === 'goto') {
					return (async (url, options) => {
						const result = await target.goto(url, options);
						if (options?.waitForHydration !== false) {
							// Default to true if not specified
							await waitForHydration(target);
						}
						return result;
					}) satisfies EnhancedPage['goto'];
				}
				return Reflect.get(target, prop);
			}
		});
		await use(customPage as EnhancedPage);
	}
});
