import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, configDefaults } from 'vitest/config';
import { readFileSync } from 'fs';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		https: {
			key: readFileSync(`${__dirname}/cert/key.pem`),
			cert: readFileSync(`${__dirname}/cert/cert.pem`)
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		setupFiles: 'vitest-setup',
		// Exclude playwright tests folder
		exclude: [...configDefaults.exclude, 'tests']
	}
});
