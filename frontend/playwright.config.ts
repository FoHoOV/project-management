import type { PlaywrightTestConfig } from '@playwright/test';

export const PLAYWRIGHT_TEST_ID_ATTRIBUTE = 'data-testid';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build-integration && npm run preview',
		port: 5174
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(spec)\.[jt]s/,
	reporter: [['html', { open: 'on-failure', outputDir: 'test-results' }]],
	use: {
		testIdAttribute: PLAYWRIGHT_TEST_ID_ATTRIBUTE,
		video: 'retain-on-failure'
	},
	timeout: (1 / 2) * 60 * 1000,
	projects: [
		{
			name: 'Chromium',
			use: { browserName: 'chromium' }
		},
		{
			name: 'Firefox',
			use: { browserName: 'firefox' }
		},
		{
			name: 'WebKit',
			use: { browserName: 'webkit' }
		}
	]
};

export default config;
