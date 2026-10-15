import { z } from 'zod';
import type {
	TodoCommentUpdate,
	TodoCommentCreate,
	TodoItemCreate,
	TodoCategoryCreate,
	TodoCategoryAttachAssociation,
	TodoCategoryUpdateItem,
	TodoItemUpdateItem,
	TagUpdate,
	TagAttachToTodo,
	TodoItemAddDependency
} from '$lib/generated-client';
import {
	TagCreate as TagCreateSchema,
	TagUpdate as TagUpdateSchema,
	TodoCategoryCreate as TodoCategoryCreateSchema,
	TodoCommentCreate as TodoCommentCreateSchema,
	TodoCategoryUpdateItem as TodoCategoryUpdateItemSchema,
	TodoCommentUpdate as TodoCommentUpdateSchema,
	TodoItemCreate as TodoItemCreateSchema,
	TodoItemUpdateItem as TodoItemUpdateItemSchema
} from '$lib/generated-client/zod.gen';
import { requiredField } from '$lib/utils/zod';

const optionalDescription = (schema: z.ZodString) =>
	z
		.string()
		.transform((t) => (t.length > 0 ? t : '-'))
		.pipe(schema);

const dateSchema = z.string().transform((value, ctx) => {
	if (value.length == 0) {
		return undefined;
	}
	const parsedDate = z.coerce
		.date()
		.min(
			new Date(new Date().setDate(new Date(Date.now()).getDate() - 1)),
			'Due date must be something in the future'
		)
		.safeParse(value);
	if (!parsedDate.success) {
		parsedDate.error.issues.forEach((issue) => {
			ctx.addIssue({ code: 'custom', message: issue.message, path: issue.path });
		});
		return undefined;
	}
	return parsedDate.data;
});

export const createTodoItemSchema = TodoItemCreateSchema.extend({
	category_id: z.coerce.number().min(0),
	description: optionalDescription(TodoItemCreateSchema.shape.description),
	is_done: z
		.union([z.boolean(), z.literal('true'), z.literal('false')])
		.transform((value) => value === true || value === 'true'),
	due_date: dateSchema.optional()
});

({}) as z.infer<typeof createTodoItemSchema> satisfies TodoItemCreate;

export const createTodoCategorySchema = TodoCategoryCreateSchema.extend({
	project_id: z.coerce.number(),
	description: optionalDescription(TodoCategoryCreateSchema.shape.description)
});

({}) as z.infer<typeof createTodoCategorySchema> satisfies TodoCategoryCreate;

export const attachToProjectSchema = z.object({
	project_id: z.coerce.number(),
	category_id: z.coerce.number()
});

({}) as z.infer<typeof attachToProjectSchema> satisfies TodoCategoryAttachAssociation;

export const editTodoCategorySchema = z.object({
	id: z.coerce.number(),
	title: requiredField(TodoCategoryUpdateItemSchema.shape.title),
	description: optionalDescription(requiredField(TodoCategoryUpdateItemSchema.shape.description))
});

({}) as z.infer<typeof editTodoCategorySchema> satisfies TodoCategoryUpdateItem;

export const editTodoItemSchema = z.object({
	id: z.coerce.number(),
	category_id: z.coerce.number(),
	title: requiredField(TodoItemUpdateItemSchema.shape.title),
	description: optionalDescription(requiredField(TodoItemUpdateItemSchema.shape.description)),
	due_date: dateSchema.optional()
});

({}) as z.infer<typeof editTodoItemSchema> satisfies TodoItemUpdateItem;

export const createTodoCommentSchema = TodoCommentCreateSchema.extend({
	todo_id: z.coerce.number()
});

({}) as z.infer<typeof createTodoCommentSchema> satisfies TodoCommentCreate;

export const editTodoCommentSchema = TodoCommentUpdateSchema.extend({
	id: z.coerce.number(),
	todo_id: z.coerce.number()
});

({}) as z.infer<typeof editTodoCommentSchema> satisfies TodoCommentUpdate;

export const addTagSchema = z.object({
	name: TagCreateSchema.shape.name,
	todo_id: z.coerce.number(),
	project_id: z.coerce.number(),
	create_if_doesnt_exist: z.boolean().default(false)
});

({}) as z.infer<typeof addTagSchema> satisfies TagAttachToTodo;

export const editTagSchema = TagUpdateSchema.extend({
	project_id: z.coerce.number()
});

({}) as z.infer<typeof editTagSchema> satisfies TagUpdate;

export const addTodoItemDependencySchema = z.object({
	todo_id: z.coerce.number(),
	dependant_todo_id: z.coerce.number()
});

({}) as z.infer<typeof addTodoItemDependencySchema> satisfies TodoItemAddDependency;
