import { z } from 'zod';
import type { ProjectDetachAssociation } from '$lib/generated-client/models';

export const detachSchema = z.object({
	user_id: z.number({ coerce: true }),
	project_id: z.number({ coerce: true })
});

({}) as z.infer<typeof detachSchema> satisfies ProjectDetachAssociation;
