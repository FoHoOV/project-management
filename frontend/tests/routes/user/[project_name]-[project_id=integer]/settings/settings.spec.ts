import { expect } from '@playwright/test';
import { test } from '../../../../fixtures/todo-category';
import { generateTodoListSettingsUrl } from '../../../../../src/lib/utils/params/route';
import { Permission } from '../../../../../src/lib/generated-client';

test('test change permissions', async ({ enhancedPage, projectUtils, authUtils }) => {
	const lastUser = authUtils.currentLoggedInUser!;

	await authUtils.logout();
	await authUtils.login();

	await projectUtils.page.goto();

	const projectTitle = 'test';
	const project = await projectUtils.page.create({
		title: projectTitle,
		description: 'test'
	});

	await projectUtils.page.attachToUser({
		projectId: project.projectId,
		username: lastUser.username,
		permissions: [Permission.All]
	});

	await enhancedPage.goto(generateTodoListSettingsUrl(projectTitle, project.projectId));
});
