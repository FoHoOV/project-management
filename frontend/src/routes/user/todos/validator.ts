import { z } from 'zod';
import type { TodoItemCreate, TodoCategoryCreate } from '$lib/client';

export const createTodoItemSchema = z.object({
	category_id: z.number().min(0),
	title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1),
	is_done: z.boolean().default(false)
});

({}) as z.infer<typeof createTodoItemSchema> satisfies TodoItemCreate;

export const createTodoCategorySchema = z.object({
	title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1)
});

({}) as z.infer<typeof createTodoCategorySchema> satisfies TodoCategoryCreate;
