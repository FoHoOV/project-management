import { resolve } from '$app/paths';
import type { ResolvedPathname, RouteParams } from '$app/types';

export type ProjectRouteParams = RouteParams<'/user/[project_name]-[project_id=integer]/todos'>;

export function projectRouteParams(projectName: string, projectId: number): ProjectRouteParams {
	return { project_name: projectName.replaceAll(' ', ''), project_id: projectId.toString() };
}

export function generateTodoListItemsUrl(params: ProjectRouteParams): ResolvedPathname {
	return resolve('/user/[project_name]-[project_id=integer]/todos', params);
}

export function generateTodoListSettingsUrl(params: ProjectRouteParams): ResolvedPathname {
	return resolve('/user/[project_name]-[project_id=integer]/settings', params);
}
