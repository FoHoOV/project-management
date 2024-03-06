import type { Locator } from '@playwright/test';

export function getConfirmAcceptButton(locator: Locator) {
	return locator
		.locator("div[data-testid='confirm-wrapper']:visible")
		.getByTestId('confirm-accept');
}

export function getConfirmCancelButton(locator: Locator) {
	return locator
		.locator("div[data-testid='confirm-wrapper']:visible")
		.getByTestId('confirm-cancel');
}
