import { z } from 'zod';
import type { DetachFromUserProjectsRequest } from '$lib/generated-client/apis/ProjectsApi';
import { Permission, type ProjectUpdateUserPermissions } from '$lib/generated-client/models';

export const detachSchema = z.object({
	userId: z.number({ coerce: true }),
	projectId: z.number({ coerce: true })
});

({}) as z.infer<typeof detachSchema> satisfies DetachFromUserProjectsRequest;

export const updateUserPermissionsSchema = z.object({
	user_id: z.number({ coerce: true }),
	project_id: z.number({ coerce: true }),
	permissions: z.array(z.nativeEnum(Permission))
});

({}) as z.infer<typeof updateUserPermissionsSchema> satisfies ProjectUpdateUserPermissions;
