import fs from 'fs';
import { join } from 'path';

const SCHEMA_FOLDER_PATH = './src/lib/client/zod';
const SCHEMA_FILE_PATH = join(SCHEMA_FOLDER_PATH, 'schemas.ts');
const contents = fs.readFileSync(SCHEMA_FILE_PATH, { encoding: 'utf-8' });
const groups = Array.from(contents.matchAll(
	/^([\s\S]*)\/\/ <\/ApiClientTypes>\n\n\/\/ <ApiClient>\nexport class ApiClient \{[\s\S]*\/\/ <\/ApiClient/g
));

if (groups.length > 1) {
	throw new Error("couldn't extract zod schemas: matched more than one schemas regex");
}

fs.writeFileSync(SCHEMA_FILE_PATH, groups[0][1]);
