import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build-integration && npm run preview',
		port: 5174
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(spec)\.[jt]s/,
	reporter: [['html', { open: 'on-failure', outputDir: 'test-results' }]]
};

export default config;
