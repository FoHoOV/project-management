import { z } from 'zod';
import type { SearchTagsRequest } from '$lib/generated-client/apis/TagsApi';
import { search_tagsSchema } from '$lib/generated-client/zod/schemas';

export const searchTagSchema = z.object({
	name: search_tagsSchema.query.shape.name,
	projectId: z.number({ coerce: true }).nullable().default(null)
});

({}) as z.infer<typeof searchTagSchema> satisfies SearchTagsRequest;
