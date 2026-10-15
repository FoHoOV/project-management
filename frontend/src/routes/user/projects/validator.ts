import { z } from 'zod';
import type {
	ProjectAttachAssociation as ProjectAttachAssociationModel,
	ProjectCreate as ProjectCreateModel,
	ProjectUpdate as ProjectUpdateModel
} from '$lib/generated-client';
import { ProjectAttachAssociation, ProjectCreate } from '$lib/generated-client/zod/schemas';

const optionalDescriptionSchema = z
	.string()
	.transform((t) => (t.length > 0 ? t : '-'))
	.pipe(ProjectCreate.shape.description);

export const createProjectSchema = ProjectCreate.extend({
	title: ProjectCreate.shape.title.refine(
		(title) => !title.includes('-'),
		"'-' is not allowed in the project title"
	),
	description: optionalDescriptionSchema,
	create_from_default_template: z.boolean({ coerce: true }).default(false)
});

({}) as z.infer<typeof createProjectSchema> satisfies ProjectCreateModel;

export const attachProjectSchema = ProjectAttachAssociation.extend({
	project_id: z.number({ coerce: true })
});

({}) as z.infer<typeof attachProjectSchema> satisfies ProjectAttachAssociationModel;

export const editProjectSchema = createProjectSchema.extend({
	project_id: z.number({ coerce: true })
});

({}) as z.infer<typeof editProjectSchema> satisfies ProjectUpdateModel;
