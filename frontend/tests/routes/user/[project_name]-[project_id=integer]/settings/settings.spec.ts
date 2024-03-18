import { test } from '../../../../fixtures/project-settings';
import { Permission } from '../../../../../src/lib/generated-client';

test('test change permissions', async ({ projectUtils, projectSettings, authUtils }) => {
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
		permissions: [Permission.CreateTag]
	});

	await projectSettings.page.goto(projectTitle, project.projectId);

	await projectSettings.page.changePermissions({
		username: lastUser.username,
		permissions: [Permission.All]
	});

	await projectSettings.page.changePermissions({
		username: authUtils.currentLoggedInUser?.username!,
		permissions: [Permission.CreateComment]
	});

	await projectSettings.page.changePermissions({
		username: authUtils.currentLoggedInUser?.username!,
		permissions: [Permission.All],
		expectError: true
	});
});
