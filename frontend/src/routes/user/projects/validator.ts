import { z } from 'zod';
import type { ProjectAttachAssociation, ProjectCreate } from '$lib/client';

export const createProjectSchema = z.object({
	title: z.string().nonempty().min(1),
	description: z.string().nonempty().min(1)
});

({}) as z.infer<typeof createProjectSchema> satisfies ProjectCreate;

export const attachProjectSchema = z.object({
	project_id: z.number({ coerce: true }),
	username: z.string().nonempty().min(3)
});

({}) as z.infer<typeof attachProjectSchema> satisfies ProjectAttachAssociation;
