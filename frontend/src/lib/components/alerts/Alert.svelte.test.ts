import { render, type RenderResult } from '@testing-library/svelte/svelte5';
import Alert from './Alert.svelte';
import { expect, test } from 'vitest';
import { tick } from 'svelte';

function getAlertText(locator: RenderResult<Alert>) {
	return locator.queryByTestId('alert-message');
}

function getDismissAlertButton(locator: RenderResult<Alert>) {
	return locator.queryByTestId('alert-close-dismiss-btn');
}

test('shows error messages when they have a value', async () => {
	const element = render(Alert, { type: 'error', message: 'test' });
	expect(getAlertText(element)).toHaveTextContent('test');

	await element.rerender({ type: 'error', message: 'test2' });
	expect(getAlertText(element)).toHaveTextContent('test2');

	await element.rerender({ type: 'error', message: new String('test3') });
	expect(getAlertText(element)).toHaveTextContent('test3');
});

test("doesn't show error messages when null or undefined", async () => {
	const element = render(Alert, { type: 'error' });
	expect(getAlertText(element)).toBeNull();

	await element.rerender({ type: 'error', message: null });
	expect(getAlertText(element)).toBeNull();

	await element.rerender({ type: 'error', message: undefined });
	expect(getAlertText(element)).toBeNull();

	await element.rerender({ type: 'error', message: new String(null) });
	expect(getAlertText(element)).toBeNull();

	await element.rerender({ type: 'error', message: new String(undefined) });
	expect(getAlertText(element)).toBeNull();
});

test('message closes when dismissed', async () => {
	const element = render(Alert, { type: 'error', message: 'test' });

	const dismissBtn = getDismissAlertButton(element);
	expect(dismissBtn).toBeVisible();
	dismissBtn!.click();

	await tick();

	expect(getDismissAlertButton(element)).toBeNull();
	expect(getAlertText(element)).toBeNull();
});

/**
 * why this test?
 * see https://github.com/sveltejs/svelte/issues/10615
 */
test('after message is dismissed it will re-popup if the same value is passed as the message prop', async () => {
	const element = render(Alert, { type: 'error', message: new String('test') });

	const dismissBtn = getDismissAlertButton(element);
	expect(dismissBtn).toBeVisible();
	dismissBtn!.click();

	await element.rerender({ type: 'error', message: new String('test') });

	expect(getAlertText(element)).toBeVisible();
});
