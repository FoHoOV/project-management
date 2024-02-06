// TODO: pending fix for svelte-5
// import { render, screen } from '@testing-library/svelte';
// import LoadingButton from './LoadingButton.svelte';
// import { expect, test } from 'vitest';

// test('has text when loading is false', async () => {
// 	render(LoadingButton, { text: 'test', loading: false });
// 	const button = screen.getByRole('button');

// 	expect(button, 'expected to have button with text=test').toHaveTextContent('test');
// });

// test('has loading state when loading is true', async () => {
// 	render(LoadingButton, { text: 'test', loading: true });
// 	const button = screen.getByRole('button');

// 	expect(
// 		button.getElementsByClassName('loading').length == 1,
// 		'expected to have loading state'
// 	).toBeTruthy();
// });
