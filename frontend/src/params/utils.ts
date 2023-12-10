export function generateTodoListUrl(projectTitle: string, projectId: number | string): string {
	return `/user/${projectTitle.replaceAll(' ', '')}-${projectId}/todos`;
}
