import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	plugins: [typography, daisyui],
	daisyui: {
		themes: ['light', 'dark']
	},
	safelist: [
		'alert-success',
		'alert-info',
		'alert-error',
		'alert-warning',
		'cursor-grab',
		'pointer-events-none',
		'border',
		'rounded-2xl',
		'flex-row-reverse',
		'flex-row',
		'flex-col',
		'flex-col-reverse'
	]
};
