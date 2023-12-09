import { z } from 'zod';
import type {
	TodoCommentUpdate,
	TodoCommentCreate,
	TodoItemCreate,
	TodoCategoryCreate,
	TodoCategoryAttachAssociation,
	TodoCategoryUpdateItem,
	TodoItemUpdateItem
} from '$lib/generated-client';
import type { TodoCommentDelete } from '../../../../lib/generated-client/zod/schemas';

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

export const editTodoCategorySchema = z.object({
	id: z.number({ coerce: true }),
	title: z.string().nonempty().min(2),
	description: z.string().nonempty().min(2)
});

({}) as z.infer<typeof editTodoCategorySchema> satisfies TodoCategoryUpdateItem;

export const editTodoItemSchema = z.object({
	id: z.number({ coerce: true }),
	category_id: z.number({ coerce: true }),
	title: z.string().nonempty().min(2),
	description: z.string().nonempty().min(2)
});

({}) as z.infer<typeof editTodoItemSchema> satisfies TodoItemUpdateItem;

export const editTodoCommentSchema = z.object({
	id: z.number({ coerce: true }),
	todo_id: z.number({ coerce: true }),
	message: z.string().min(1).max(2000)
});

({}) as z.infer<typeof editTodoCommentSchema> satisfies TodoCommentUpdate;

export const createTodoCommentSchema = z.object({
	todo_id: z.number({ coerce: true }),
	message: z.string().min(1).max(2000)
});

({}) as z.infer<typeof createTodoCommentSchema> satisfies TodoCommentCreate;
