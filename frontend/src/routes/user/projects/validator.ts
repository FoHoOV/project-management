import { z } from 'zod';
import type { ProjectAttachAssociation, ProjectCreate, ProjectUpdate } from '$lib/generated-client';

export const createProjectSchema = z.object({
	title: z
		.string()
		.nonempty()
		.min(1)
		.refine((title) => !title.includes('-'), "'-' is not allowed in the project title"),
	description: z.string().nonempty().min(1)
});

({}) as z.infer<typeof createProjectSchema> satisfies ProjectCreate;

export const attachProjectSchema = z.object({
	project_id: z.number({ coerce: true }),
	username: z.string().nonempty().min(3)
});

({}) as z.infer<typeof attachProjectSchema> satisfies ProjectAttachAssociation;

export const editProjectSchema = createProjectSchema.extend({
	project_id: z.number({ coerce: true })
});

({}) as z.infer<typeof editProjectSchema> satisfies ProjectUpdate;
