import fs from 'fs';
import { join } from 'path';

const openapitoolsJson = {
	$schema: './node_modules/@openapitools/openapi-generator-cli/config.schema.json',
	spaces: 2,
	'generator-cli': {
		version: '7.0.0',
		generators: {
			'typescript-fetch': {
				generatorName: 'typescript-fetch',
				inputSpec: `${process.env.PUBLIC_API_URL.trim()}`,
				output: './src/lib/generated-client',
				additionalProperties: {
					modelPropertyNaming: 'original',
					supportsES6: true,
					useSingleRequestParameter: false
				}
			}
		}
	}
};

const SCHEMA_FILE_PATH = join('./', 'openapitools.json');
fs.writeFileSync(SCHEMA_FILE_PATH, JSON.stringify(openapitoolsJson, null, 2));
