const projectPath = (projectTitle: string, projectId: number | string) =>
	`/user/${projectTitle.replaceAll(' ', '')}-${projectId}`;

export const todoListUrl = (projectTitle: string, projectId: number | string) =>
	`${projectPath(projectTitle, projectId)}/todos`;

export const projectSettingsUrl = (projectTitle: string, projectId: number | string) =>
	`${projectPath(projectTitle, projectId)}/settings`;
