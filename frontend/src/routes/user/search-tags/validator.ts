import { z } from 'zod';
import type { SearchTagsRequest } from '$lib/generated-client/apis/TagsApi';

export const searchTagSchema = z.object({
	name: z.string().min(1).max(20),
	projectId: z.number({ coerce: true }).nullable().default(null)
});

({}) as z.infer<typeof searchTagSchema> satisfies SearchTagsRequest;
