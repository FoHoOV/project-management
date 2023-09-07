import { z } from 'zod';
import type { TodoCreate } from '$lib/client';

export const schema = z.object({
	title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1),
	is_done: z.boolean().default(false)
});

({}) as z.infer<typeof schema> satisfies TodoCreate;
