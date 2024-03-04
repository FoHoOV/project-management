import { expect, type Locator } from '@playwright/test';

export function getSpinnerIn(locator: Locator) {
	return locator.getByTestId('spinner-loading-state');
}

export async function waitForSpinnerStateToBeIdle(locator: Locator, timeout?: number) {
	const spinner = getSpinnerIn(locator);
	await spinner.waitFor({ state: 'hidden', timeout });
	await expect(
		spinner,
		'no loading state should be visible'
	).not.toBeVisible();
}
