import { render, type RenderResult } from '@testing-library/svelte/svelte5';
import Alert from './Alert.svelte';
import { expect, test, vi } from 'vitest';
import { tick } from 'svelte';

function getAlertText(locator: RenderResult<typeof Alert>) {
	return locator.queryByTestId('alert-message');
}

function getDismissAlertButton(locator: RenderResult<typeof Alert>) {
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

test('closes itself after the countdown and stops counting', async () => {
	vi.useFakeTimers();
	try {
		const element = render(Alert, { type: 'error', message: 'test' });

		await vi.advanceTimersByTimeAsync(90 * 99);
		expect(getAlertText(element)).toHaveTextContent('test');

		await vi.advanceTimersByTimeAsync(90);
		expect(getAlertText(element)).toBeNull();
		expect(vi.getTimerCount()).toBe(0);
	} finally {
		vi.useRealTimers();
	}
});

test("doesn't start a countdown without a message", () => {
	vi.useFakeTimers();
	try {
		render(Alert, { type: 'error', message: null });
		expect(vi.getTimerCount()).toBe(0);
	} finally {
		vi.useRealTimers();
	}
});
