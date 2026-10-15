import { z } from 'zod';
import type { SearchTagsData } from '$lib/generated-client';
import { zSearchTagsQuery } from '$lib/generated-client/zod.gen';

const emptyToNull = (value: unknown) => (value === '' ? null : value);

export const searchTagSchema = zSearchTagsQuery.extend({
	project_id: z.preprocess(emptyToNull, z.coerce.number().nullable()).default(null)
});

({}) as z.infer<typeof searchTagSchema> satisfies SearchTagsData['query'];
