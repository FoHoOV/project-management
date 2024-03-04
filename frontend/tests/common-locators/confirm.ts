import type { Locator } from '@playwright/test';

export function getConfirmAcceptButton(locator: Locator) {
	return locator.getByTestId('confirm-accept');
}

export function getConfirmCancelButton(locator: Locator) {
	return locator.getByTestId('confirm-cancel');
}
