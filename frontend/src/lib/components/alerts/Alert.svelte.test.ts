import { render, screen, type RenderResult } from '@testing-library/svelte/svelte5';
import Alert from './Alert.svelte';
import { expect, test } from 'vitest';
import { tick } from 'svelte';

function getAlertText(locator: RenderResult<Alert>) {
	return locator.queryByTestId('alert-message');
}

function getDismissAlertButton(locator: RenderResult<Alert>) {
	return locator.queryByTestId('alert-close-dismiss-btn');
}

test('shows error message when has value', async () => {
	const element = render(Alert, { type: 'error', message: 'test' });
	expect(getAlertText(element)).toHaveTextContent('test');

	await element.rerender({ type: 'error', message: new String('test2') });
	expect(getAlertText(element)).toHaveTextContent('test2');
});

test('doesnt show error message when null or undefined', async () => {
	const element = render(Alert, { type: 'error', message: null });
	expect(getAlertText(element)).toBeNull();

	await element.rerender({ type: 'error', message: undefined });
	expect(getAlertText(element)).toBeNull();

	await element.rerender({ type: 'error', message: new String(null) });
	expect(getAlertText(element)).toBeNull();

	await element.rerender({ type: 'error', message: new String(undefined) });
	expect(getAlertText(element)).toBeNull();
});

test('message closes', async () => {
	const element = render(Alert, { type: 'error', message: 'test' });

	const dismissBtn = getDismissAlertButton(element);
	expect(dismissBtn).toBeVisible();
	dismissBtn!.click();

	await tick();

	expect(getDismissAlertButton(element)).toBeNull();
	expect(getAlertText(element)).toBeNull();
});

test('after message is closed it will popup again if the same value is passed again', async () => {
	const element = render(Alert, { type: 'error', message: new String('test') });

	const dismissBtn = getDismissAlertButton(element);
	expect(dismissBtn).toBeVisible();
	dismissBtn!.click();

	await element.rerender({ type: 'error', message: new String('test') });

	expect(getAlertText(element)).toBeVisible();
});
