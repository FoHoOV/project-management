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

const optionalDescriptionSchema = z
	.string()
	.transform((t) => (t.length > 0 ? t : '-'))
	.pipe(z.string().min(1));

const dateSchema = z.string().transform((value, ctx) => {
	if (value.length == 0) {
		return undefined;
	}
	const parsedDate = z.date({ coerce: true }).safeParse(value);
	if (!parsedDate.success) {
		ctx.addIssue({
			code: z.ZodIssueCode.invalid_date
		});
		return undefined;
	}
	return parsedDate.data;
});

export const createTodoItemSchema = z.object({
	category_id: z.number({ coerce: true }).min(0),
	title: z.string().min(2),
	description: optionalDescriptionSchema,
	is_done: z
		.union([z.boolean(), z.literal('true'), z.literal('false')])
		.transform((value) => value === true || value === 'true'),
	due_date: dateSchema.optional()
});

({}) as z.infer<typeof createTodoItemSchema> satisfies TodoItemCreate;

export const createTodoCategorySchema = z.object({
	project_id: z.number({ coerce: true }),
	title: z.string().min(2),
	description: optionalDescriptionSchema
});

({}) as z.infer<typeof createTodoCategorySchema> satisfies TodoCategoryCreate;

export const attachToProjectSchema = z.object({
	project_id: z.number({ coerce: true }),
	category_id: z.number({ coerce: true })
});

({}) as z.infer<typeof attachToProjectSchema> satisfies TodoCategoryAttachAssociation;

export const editTodoCategorySchema = z.object({
	id: z.number({ coerce: true }),
	title: z.string().min(2),
	description: optionalDescriptionSchema
});

({}) as z.infer<typeof editTodoCategorySchema> satisfies TodoCategoryUpdateItem;

export const editTodoItemSchema = z.object({
	id: z.number({ coerce: true }),
	category_id: z.number({ coerce: true }),
	title: z.string().min(2),
	description: optionalDescriptionSchema,
	due_date: dateSchema.optional().optional()
});

({}) as z.infer<typeof editTodoItemSchema> satisfies TodoItemUpdateItem;

export const createTodoCommentSchema = z.object({
	todo_id: z.number({ coerce: true }),
	message: z.string().min(1).max(50000)
});

({}) as z.infer<typeof createTodoCommentSchema> satisfies TodoCommentCreate;

export const editTodoCommentSchema = z.object({
	id: z.number({ coerce: true }),
	todo_id: z.number({ coerce: true }),
	message: z.string().min(1).max(50000)
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
	id: z.number({ coerce: true }),
	name: z.string().min(1).max(30)
});

({}) as z.infer<typeof editTagSchema> satisfies TagUpdate;

export const addTodoItemDependencySchema = z.object({
	todo_id: z.number({ coerce: true }),
	dependant_todo_id: z.number({ coerce: true })
});

({}) as z.infer<typeof addTodoItemDependencySchema> satisfies TodoItemAddDependency;
