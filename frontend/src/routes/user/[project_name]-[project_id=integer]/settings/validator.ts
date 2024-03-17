import { z } from 'zod';
import {
	Permission,
	type ProjectDetachAssociation,
	type ProjectUpdateUserPermissions
} from '$lib/generated-client/models';

export const detachSchema = z.object({
	user_id: z.number({ coerce: true }),
	project_id: z.number({ coerce: true })
});

({}) as z.infer<typeof detachSchema> satisfies ProjectDetachAssociation;

export const updateUserPermissionsSchema = z.object({
	user_id: z.number({ coerce: true }),
	project_id: z.number({ coerce: true }),
	permissions: z.array(z.nativeEnum(Permission))
});

({}) as z.infer<typeof updateUserPermissionsSchema> satisfies ProjectUpdateUserPermissions;
