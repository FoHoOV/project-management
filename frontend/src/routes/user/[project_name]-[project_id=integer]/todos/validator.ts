import { z } from 'zod';
import type {
	TodoItemCreate,
	TodoCategoryCreate,
	TodoCategoryAttachAssociation
} from '$lib/client';

export const createTodoItemSchema = z.object({
	category_id: z.number({ coerce: true }).min(0),
	title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1),
	is_done: z
		.union([z.boolean(), z.literal('true'), z.literal('false')])
		.transform((value) => value === true || value === 'true')
});

({}) as z.infer<typeof createTodoItemSchema> satisfies TodoItemCreate;

export const createTodoCategorySchema = z.object({
	project_id: z.number({ coerce: true }),
	title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1)
});

({}) as z.infer<typeof createTodoCategorySchema> satisfies TodoCategoryCreate;

export const attachToProjectSchema = z.object({
	project_id: z.number({ coerce: true }),
	category_id: z.number({ coerce: true })
});

({}) as z.infer<typeof attachToProjectSchema> satisfies TodoCategoryAttachAssociation;
