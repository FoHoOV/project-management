import { z } from 'zod';
import type {
	DetachFromUserProjectsData,
	ProjectUpdateUserPermissions as ProjectUpdateUserPermissionsModel
} from '$lib/generated-client';
import { ProjectUpdateUserPermissions } from '$lib/generated-client/zod.gen';

export const detachSchema = z.object({
	user_id: z.coerce.number(),
	project_id: z.coerce.number()
});

({}) as z.infer<typeof detachSchema> satisfies DetachFromUserProjectsData['path'];

export const updateUserPermissionsSchema = ProjectUpdateUserPermissions.extend({
	user_id: z.coerce.number(),
	project_id: z.coerce.number()
});

({}) as z.infer<typeof updateUserPermissionsSchema> satisfies ProjectUpdateUserPermissionsModel;
