import 'dotenv/config';
import { defineConfig } from '@hey-api/openapi-ts';

const apiUrl = process.env.PUBLIC_API_URL?.trim();

if (!apiUrl) {
	throw new Error('PUBLIC_API_URL is not set (see .env.raw)');
}

export default defineConfig({
	input: `${apiUrl}/openapi.json`,
	output: 'src/lib/generated-client',
	plugins: [
		{ name: '@hey-api/client-fetch', baseUrl: false },
		{ name: '@hey-api/typescript', enums: 'javascript' },
		{ name: '@hey-api/transformers', dates: true },
		{ name: '@hey-api/sdk', transformer: true },
		{
			name: 'zod',
			definitions: { name: '{{name}}', case: 'preserve' },
			// The backend serializes naive datetimes (no UTC offset).
			dates: { local: true, offset: true }
		}
	]
});
