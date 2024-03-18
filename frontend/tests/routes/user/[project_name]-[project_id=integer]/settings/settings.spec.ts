import { test } from '../../../../fixtures/project-settings';
import { Permission } from '../../../../../src/lib/generated-client';
import {
	expectPermissionsToBeEqual,
	setPermissions
} from '../../../../common-locators/project-permissions';

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

test('canceling the change should reset back to default permissions', async ({
	projectUtils,
	projectSettings,
	authUtils
}) => {
	await projectUtils.page.goto();

	const projectTitle = 'test';
	const project = await projectUtils.page.create({
		title: projectTitle,
		description: 'test'
	});

	await projectSettings.page.goto(projectTitle, project.projectId);

	const row = await projectSettings.page.getUserPermissionsRowLocator(
		authUtils.currentLoggedInUser?.username!
	);
	await row.click();

	await setPermissions(row, [Permission.CreateTodoCategory]);
	await row.getByRole('button', { name: 'cancel' }).click();

	await expectPermissionsToBeEqual(row, [Permission.All]);
});
