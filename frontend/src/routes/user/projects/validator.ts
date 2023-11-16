import { z } from 'zod';
import type { ProjectCreate } from '$lib/client';

export const createProjectSchema = z.object({
	title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1)
});

({}) as z.infer<typeof createProjectSchema> satisfies ProjectCreate;
