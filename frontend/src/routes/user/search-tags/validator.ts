import { z } from 'zod';
import type { SearchTagRequest } from '$lib/generated-client/apis/TagApi';

export const searchTagSchema = z.object({
	name: z.string().min(1).max(20),
	projectId: z.number({ coerce: true }).nullable().default(null)
});

({}) as z.infer<typeof searchTagSchema> satisfies SearchTagRequest;
