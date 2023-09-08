import { z } from 'zod';
import type { TodoItemCreate } from '$lib/client';

export const schema = z.object({
	category_id: z.number().min(0),
	title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1),
	is_done: z.boolean().default(false)
});

({}) as z.infer<typeof schema> satisfies TodoItemCreate;
