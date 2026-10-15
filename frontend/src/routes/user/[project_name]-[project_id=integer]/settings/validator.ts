import { z } from 'zod';
import type { DetachFromUserProjectsRequest } from '$lib/generated-client/apis/ProjectsApi';
import type { ProjectUpdateUserPermissions as ProjectUpdateUserPermissionsModel } from '$lib/generated-client/models';
import { ProjectUpdateUserPermissions } from '$lib/generated-client/zod/schemas';

export const detachSchema = z.object({
	userId: z.number({ coerce: true }),
	projectId: z.number({ coerce: true })
});

({}) as z.infer<typeof detachSchema> satisfies DetachFromUserProjectsRequest;

export const updateUserPermissionsSchema = ProjectUpdateUserPermissions.extend({
	user_id: z.number({ coerce: true }),
	project_id: z.number({ coerce: true })
});

({}) as z.infer<typeof updateUserPermissionsSchema> satisfies ProjectUpdateUserPermissionsModel;
