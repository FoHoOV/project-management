export function generateBaseTodoListUrl(projectName: string, projectId: number | string): string {
	return `/user/${projectName.replaceAll(' ', '')}-${projectId}`;
}

export function generateTodoListUrl(projectName: string, projectId: number | string): string {
	return `${generateBaseTodoListUrl(projectName, projectId)}/todos`;
}

export function generateTodoListSettingsUrl(
	projectName: string,
	projectId: number | string
): string {
	return `${generateBaseTodoListUrl(projectName, projectId)}/settings`;
}
