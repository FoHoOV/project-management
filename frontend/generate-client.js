import 'dotenv/config';
import { execSync } from 'child_process';
import { rmSync } from 'fs';

const OUTPUT_DIRECTORY = './src/lib/generated-client';
const apiUrl = process.env.PUBLIC_API_URL?.trim();

if (!apiUrl) {
	throw new Error('PUBLIC_API_URL is not set (see .env.raw)');
}

rmSync(OUTPUT_DIRECTORY, { recursive: true, force: true });

execSync(
	[
		'pnpm exec client-generator generate',
		`--uri ${apiUrl}/openapi.json`,
		`--out ${OUTPUT_DIRECTORY}`,
		'--additional-openapitools-options modelPropertyNaming=original,supportsES6=true,useSingleRequestParameter=false'
	].join(' '),
	{ stdio: 'inherit' }
);
