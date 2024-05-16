import { type Page, test as baseTest, type Locator, expect } from '@playwright/test';
import { getByTestId } from '../common-locators/builtins';
import { PLAYWRIGHT_TEST_ID_ATTRIBUTE } from '../../playwright.config';

export interface EnhancedPage extends Page {
	goto(
		url: string,
		options?: Parameters<Page['goto']>[1] & { waitForHydration?: boolean }
	): ReturnType<Page['goto']>;

	getByTestId(
		testId: string,
		options?: Parameters<Page['locator']>[1]
	): ReturnType<Page['locator']>;
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
	offsetFromCenter = { x: 0, y: 0 },
	steps = 1
}: {
	page: Page;
	from: Locator;
	to: Locator;
	offsetFromCenter?: { x: number; y: number };
	steps?: number;
}) {
	function getPoint(boundingRect: NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>) {
		return {
			x: boundingRect.x + boundingRect.width / 2,
			y: boundingRect.y + boundingRect.height / 2
		};
	}

	await from.scrollIntoViewIfNeeded();
	await expect(from).toBeVisible();

	const fromBoundingRect = await from.boundingBox();
	expect(fromBoundingRect, '`from` bounding box should have a value').not.toBeNull();
	if (!fromBoundingRect) {
		// just for TS to shutup
		throw new Error('fromBoundingRect must have a value');
	}

	await page.mouse.move(getPoint(fromBoundingRect).x, getPoint(fromBoundingRect).y, { steps });
	await page.mouse.down();

	for (let i = 0; i < steps; i++) {
		const toBoundingRect = await to.boundingBox();
		expect(toBoundingRect, '`to` bounding box should have a value').not.toBeNull();
		if (!toBoundingRect) {
			// just for TS to shutup
			throw new Error('toBoundingRect must have a value');
		}

		await page.mouse.move(
			getPoint(toBoundingRect).x + offsetFromCenter.x,
			getPoint(toBoundingRect).y + offsetFromCenter.y,
			{
				steps
			}
		);

		await to.scrollIntoViewIfNeeded();
	}

	await expect(to).toBeVisible();
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
				} else if (prop === 'getByTestId') {
					return ((testId, options) => {
						return getByTestId(target, testId, options);
					}) satisfies EnhancedPage['getByTestId'];
				}
				return Reflect.get(target, prop);
			}
		});
		await use(customPage as EnhancedPage);
	}
});
