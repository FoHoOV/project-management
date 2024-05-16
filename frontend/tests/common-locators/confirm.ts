import { expect, type Locator } from '@playwright/test';

export async function _getWrapper(locator: Locator) {
	const wrapper = locator.getByTestId('confirm-wrapper').and(locator.locator(':visible'));
	return wrapper;
}

export async function getConfirmAcceptButton(locator: Locator) {
	return (await _getWrapper(locator)).getByTestId('confirm-accept');
}

export async function getConfirmCancelButton(locator: Locator) {
	return (await _getWrapper(locator)).getByTestId('confirm-cancel');
}

export async function acceptConfirmDialog(locator: Locator) {
	await (await getConfirmAcceptButton(locator)).click();
}

export async function denyConfirmDialog(locator: Locator) {
	await (await getConfirmCancelButton(locator)).click();
}
