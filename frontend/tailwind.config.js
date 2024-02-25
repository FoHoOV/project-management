import daisyui from 'daisyui';
import typography from '@tailwindcss/typography';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: ['class', '[data-theme="dark"]'],
	plugins: [typography(), daisyui],
	daisyui: {
		themes: ['light', 'dark']
	},
	theme: {
		screens: {
			xs: '475px',
			...defaultTheme.screens
		}
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
		'flex-col-reverse',
		'active'
	]
};
