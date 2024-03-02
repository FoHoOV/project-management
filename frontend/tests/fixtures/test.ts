import { type Page, test as baseTest, type Locator, expect } from '@playwright/test';

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

export async function dragAndDropTo({
	page,
	from,
	to,
	targetPosition = { x: 0, y: 0 },
	waitFor = 5000,
	steps = 5
}: {
	page: Page;
	from: Locator;
	to: Locator;
	targetPosition?: { x: number; y: number };
	waitFor?: number;
	steps?: number;
}) {
	const fromBoundingRect = await from.boundingBox();
	const toBoundingRect = await to.boundingBox();

	expect(fromBoundingRect, '`from` bounding box should have a value').not.toBeNull();
	expect(toBoundingRect, '`to` bounding box should have a value').not.toBeNull();

	if (!fromBoundingRect || !toBoundingRect) {
		// just for TS to shutup
		throw new Error('fromBoundingRect and toBoundingRect must have a value');
	}

	await page.mouse.move(fromBoundingRect.x, fromBoundingRect.y);
	await page.mouse.down();
	for (let i = 0; i < steps; i++) {
		await new Promise((r) => setTimeout(r, waitFor / steps));
		await page.mouse.move(toBoundingRect.x + targetPosition.x, toBoundingRect.y + targetPosition.y);
		await new Promise((r) => setTimeout(r, waitFor / steps));
	}

	await page.mouse.up();
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
