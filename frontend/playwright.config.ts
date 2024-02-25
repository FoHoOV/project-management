import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build-integration && npm run preview',
		port: 5174
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test)\.[jt]s/
};

export default config;
