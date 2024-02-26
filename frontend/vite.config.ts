import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import 'dotenv/config';

let serverSettings = {};
if (process.env.TEST_HTTPS == 'true') {
	serverSettings = {
		server: {
			https: {
				key: readFileSync(`${__dirname}/cert/key.pem`),
				cert: readFileSync(`${__dirname}/cert/cert.pem`)
			},
			proxy: {}
		}
	};
}

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom'
	},
	...serverSettings
});
