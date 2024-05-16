import type { Locator } from '@playwright/test';
import { PLAYWRIGHT_TEST_ID_ATTRIBUTE } from '../../playwright.config';

export function getByTestId(
	locator: Locator,
	testId: string,
	options: Parameters<Locator['locator']>[1]
) {
	return locator.locator(`[${PLAYWRIGHT_TEST_ID_ATTRIBUTE}='${testId}']`, options);
}
