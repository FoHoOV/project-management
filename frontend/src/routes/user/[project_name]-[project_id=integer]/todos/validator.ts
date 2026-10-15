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
	TodoCategoryCreate as TodoCategoryCreateSchema,
	TodoCommentCreate as TodoCommentCreateSchema,
	TodoCommentUpdate as TodoCommentUpdateSchema,
	TodoItemCreate as TodoItemCreateSchema
} from '$lib/generated-client/zod/schemas';

const optionalDescription = (schema: z.ZodString) =>
	z
		.string()
		.transform((t) => (t.length > 0 ? t : '-'))
		.pipe(schema);

const dateSchema = z.string().transform((value, ctx) => {
	if (value.length == 0) {
		return undefined;
	}
	const parsedDate = z
		.date({ coerce: true })
		.min(
			new Date(new Date().setDate(new Date(Date.now()).getDate() - 1)),
			'Due date must be something in the future'
		)
		.safeParse(value);
	if (!parsedDate.success) {
		parsedDate.error.issues.forEach((issue) => {
			ctx.addIssue(issue);
		});
		return undefined;
	}
	return parsedDate.data;
});

export const createTodoItemSchema = TodoItemCreateSchema.extend({
	category_id: z.number({ coerce: true }).min(0),
	description: optionalDescription(TodoItemCreateSchema.shape.description),
	is_done: z
		.union([z.boolean(), z.literal('true'), z.literal('false')])
		.transform((value) => value === true || value === 'true'),
	due_date: dateSchema.optional()
});

({}) as z.infer<typeof createTodoItemSchema> satisfies TodoItemCreate;

export const createTodoCategorySchema = TodoCategoryCreateSchema.extend({
	project_id: z.number({ coerce: true }),
	description: optionalDescription(TodoCategoryCreateSchema.shape.description)
});

({}) as z.infer<typeof createTodoCategorySchema> satisfies TodoCategoryCreate;

export const attachToProjectSchema = z.object({
	project_id: z.number({ coerce: true }),
	category_id: z.number({ coerce: true })
});

({}) as z.infer<typeof attachToProjectSchema> satisfies TodoCategoryAttachAssociation;

export const editTodoCategorySchema = z.object({
	id: z.number({ coerce: true }),
	title: TodoCategoryCreateSchema.shape.title,
	description: optionalDescription(TodoCategoryCreateSchema.shape.description)
});

({}) as z.infer<typeof editTodoCategorySchema> satisfies TodoCategoryUpdateItem;

export const editTodoItemSchema = z.object({
	id: z.number({ coerce: true }),
	category_id: z.number({ coerce: true }),
	title: TodoItemCreateSchema.shape.title,
	description: optionalDescription(TodoItemCreateSchema.shape.description),
	due_date: dateSchema.optional()
});

({}) as z.infer<typeof editTodoItemSchema> satisfies TodoItemUpdateItem;

export const createTodoCommentSchema = TodoCommentCreateSchema.extend({
	todo_id: z.number({ coerce: true })
});

({}) as z.infer<typeof createTodoCommentSchema> satisfies TodoCommentCreate;

export const editTodoCommentSchema = TodoCommentUpdateSchema.extend({
	id: z.number({ coerce: true }),
	todo_id: z.number({ coerce: true })
});

({}) as z.infer<typeof editTodoCommentSchema> satisfies TodoCommentUpdate;

export const addTagSchema = z.object({
	name: z.string().min(1).max(30),
	todo_id: z.number({ coerce: true }),
	project_id: z.number({ coerce: true }),
	create_if_doesnt_exist: z.boolean().default(false)
});

({}) as z.infer<typeof addTagSchema> satisfies TagAttachToTodo;

export const editTagSchema = z.object({
	project_id: z.number({ coerce: true }),
	name: z.string().min(1).max(30)
});

({}) as z.infer<typeof editTagSchema> satisfies TagUpdate;

export const addTodoItemDependencySchema = z.object({
	todo_id: z.number({ coerce: true }),
	dependant_todo_id: z.number({ coerce: true })
});

({}) as z.infer<typeof addTodoItemDependencySchema> satisfies TodoItemAddDependency;
