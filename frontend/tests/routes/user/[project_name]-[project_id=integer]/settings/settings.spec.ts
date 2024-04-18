import { test } from '../../../../fixtures/project-settings';
import { Permission } from '../../../../../src/lib/generated-client';
import {
	expectPermissionsToBeEqual,
	setPermissions
} from '../../../../common-locators/project-permissions';
import { expect } from '@playwright/test';

test('change user permissions', async ({ projectUtils, projectSettings, authUtils }) => {
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

	expect(await projectSettings.page.isMySelf(lastUser.username)).not.toBeTruthy();

	expect(
		await projectSettings.page.isMySelf(authUtils.currentLoggedInUser?.username!)
	).toBeTruthy();
	expect(await projectSettings.page.isOwner(authUtils.currentLoggedInUser?.username!)).toBeTruthy();

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

	expect(
		await projectSettings.page.isMySelf(authUtils.currentLoggedInUser?.username!)
	).toBeTruthy();
	expect(
		await projectSettings.page.isOwner(authUtils.currentLoggedInUser?.username!)
	).not.toBeTruthy();
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
	await expect(row.getByRole('button', { name: 'detach' })).toBeVisible();
});

test('when no changes are applied "save-changes" and "cancel" button should be invisible and "detach" button should be visible', async ({
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

	await expect(row.getByRole('button', { name: 'save changes' })).not.toBeVisible();
	await expect(row.getByRole('button', { name: 'cancel' })).not.toBeVisible();
	await expect(row.getByRole('button', { name: 'detach' })).toBeVisible();
});
