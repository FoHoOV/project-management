import 'dotenv/config';
import { defineConfig } from '@hey-api/openapi-ts';

const apiUrl = process.env.PUBLIC_API_URL?.trim();

if (!apiUrl) {
	throw new Error('PUBLIC_API_URL is not set (see .env.raw)');
}

export default defineConfig({
	input: `${apiUrl}/openapi.json`,
	output: {
		path: 'src/lib/generated-client',
		// The client plugin always emits a module-level client and has no option to skip it. On the
		// server it would be shared by every user's requests, so delete it (nothing imports it).
		postProcess: [
			{
				name: 'remove client.gen.ts',
				command: process.execPath,
				args: ['-e', "require('node:fs').rmSync(process.argv[1])", '{{path}}/client.gen.ts']
			}
		]
	},
	plugins: [
		// Makes `throwOnError: true` the SDK's type default; createApiClient sets it at runtime.
		{ name: '@hey-api/client-fetch', baseUrl: false, throwOnError: true },
		{ name: '@hey-api/typescript', enums: 'javascript' },
		// `client: false`: every call passes its own client; the SDK doesn't import the deleted one.
		{ name: '@hey-api/sdk', client: false, responseStyle: 'data' },
		{
			name: 'zod',
			definitions: { name: '{{name}}', case: 'preserve' },
			// The backend serializes naive datetimes (no UTC offset).
			dates: { local: true, offset: true }
		}
	]
});
