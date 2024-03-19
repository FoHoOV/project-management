import { test as projectTest } from './project';
import { expect, type Locator } from '@playwright/test';
import { type IPage } from './IPage';
import { type EnhancedPage } from './enhanced-page';
import type { Permission } from '../../src/lib/generated-client';
import { setPermissions } from '../common-locators/project-permissions';
import { generateTodoListSettingsUrl } from '../../src/lib/utils/params/route';
import { waitForSpinnerStateToBeIdle } from '../common-locators/spinner';
import { waitForToastMessage, waitForToastType } from '../common-locators/toast';
import { getConfirmAcceptButton } from '../common-locators/confirm';

export class ProjectSettingsPage implements IPage {
	#enhancedPage: EnhancedPage;

	constructor(enhancedPage: EnhancedPage) {
		this.#enhancedPage = enhancedPage;
	}

	async goto(projectTitle: string, projectId: number | string) {
		await this.#enhancedPage.goto(generateTodoListSettingsUrl(projectTitle, projectId));
	}

	async changePermissions({
		username,
		permissions,
		expectError = false
	}: {
		username: string;
		permissions: Permission[];
		expectError?: boolean;
	}) {
		const row = await this.getUserPermissionsRowLocator(username);
		await row.click();

		await setPermissions(row, permissions);
		await row.getByRole('button', { name: 'save changes' }).click();
		await getConfirmAcceptButton(row).click();
		await waitForSpinnerStateToBeIdle(row);

		if (expectError) {
			await waitForToastType(this.#enhancedPage, 'error', 1000);
		} else {
			await waitForToastMessage(this.#enhancedPage, 'project permissions updated', 1000);
			await expect(await this.getDetachButtonLocator(username)).toBeVisible();
		}
	}

	async getUserPermissionsRowLocator(username: string) {
		const row = this.#enhancedPage
			.getByTestId('user-permissions-wrapper')
			.filter({ hasText: `username: ${username}` });
		await expect(row).toBeAttached();
		return row;
	}

	async isOwner(username: string) {
		return (await (await this.getUserPermissionsRowLocator(username)).textContent())?.includes(
			'(owner)'
		);
	}

	async isMySelf(username: string) {
		return (await (await this.getUserPermissionsRowLocator(username)).textContent())?.includes(
			'(myself)'
		);
	}

	async getDetachButtonLocator(username: string) {
		return (await this.getUserPermissionsRowLocator(username)).getByRole('button', {
			name: 'detach'
		});
	}
}

export const test = projectTest.extend<{ projectSettings: { page: ProjectSettingsPage } }>({
	projectSettings: async ({ enhancedPage }, use) => {
		await use({ page: new ProjectSettingsPage(enhancedPage) });
	}
});
