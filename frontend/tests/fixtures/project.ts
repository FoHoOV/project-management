import { test as auth } from './auth';
import { expect } from '@playwright/test';
import { getModal, closeModal } from '../common-locators/modal';
import { getFloatingBtn } from '../common-locators/floating-btn';
import { type IPage } from './IPage';
import { type EnhancedPage } from './enhanced-page';
import type { Permission } from '../../src/lib/generated-client';
import { setPermissions } from '../common-locators/project-permissions';
import { acceptConfirmDialog } from '../common-locators/confirm';

export class ProjectsPage implements IPage {
	#enhancedPage: EnhancedPage;

	constructor(enhancedPage: EnhancedPage) {
		this.#enhancedPage = enhancedPage;
	}
	async goto() {
		await this.#enhancedPage.goto('/user/projects');
	}

	async create({
		title,
		description,
		createFromDefaultTemplate
	}: {
		title: string;
		description?: string;
		createFromDefaultTemplate?: boolean;
	}) {
		await (await getFloatingBtn(this.#enhancedPage)).click();
		const modal = await getModal(this.#enhancedPage);

		// fill the data
		await modal.getByPlaceholder('title').fill(title);
		await modal.getByPlaceholder('title').press('Tab');
		description &&
			(await this.#enhancedPage.getByPlaceholder('description (Optional)').fill(description));
		await modal.getByPlaceholder('description (Optional)').press('Tab');
		createFromDefaultTemplate &&
			(await this.#enhancedPage.getByPlaceholder('Create from default template?').check());
		await modal.getByPlaceholder('Create from default template?').press('Tab');
		await modal.getByRole('button', { name: 'reset' }).press('Tab');
		await modal.getByRole('button', { name: 'create' }).press('Enter');
		await expect(modal.getByText('Project created')).toHaveCount(1);

		// close the modal
		await closeModal(modal);

		// find the created category
		const createdProject = this.#enhancedPage
			.locator('.card-title div.flex.items-baseline.gap-2', {
				has: this.#enhancedPage.getByText(title)
			})
			.locator("div[data-tip='project id'] span.text-info")
			.last(); // since its ordered from newest to oldest, then the newest one should be at the end

		await expect(createdProject, 'created project should be present on the page').toHaveCount(1);

		return {
			projectId: parseInt((await createdProject.innerText()).split('#')[1]),
			projectTitle: title,
			projectDescription: description
		};
	}

	async detach({ projectId }: { projectId: number | string }) {
		(await this.getDetachButtonLocator(projectId)).click();

		const projectLocator = await this.getProjectWrapperById(projectId);

		await acceptConfirmDialog(projectLocator);
		await projectLocator.waitFor({ state: 'detached' });
	}

	async attachToUser({
		projectId,
		username,
		permissions
	}: {
		projectId: number | string;
		username: string;
		permissions: Permission[];
	}) {
		await (await this.getShareAccessButtonLocator(projectId)).click();
		const modal = await getModal(this.#enhancedPage);

		await setPermissions(modal, permissions);

		// fill the data
		await modal.getByPlaceholder('username').fill(username);
		await modal.getByPlaceholder('username').press('Tab');
		await modal.getByRole('button', { name: 'reset' }).press('Tab');
		await modal.getByRole('button', { name: 'share' }).press('Enter');
		await expect(modal.getByText('Project is now shared with the specified user')).toHaveCount(1);

		// close the modal
		await closeModal(modal);

		await expect(await this.getProjectWrapperById(projectId)).toContainText(username);
	}

	getResultsWrapperLocator() {
		return this.#enhancedPage.getByTestId('project-item-wrapper');
	}

	async getShareAccessButtonLocator(projectId: string | number) {
		return (await this.getProjectWrapperById(projectId)).getByTestId('share-project-access');
	}

	async getDetachButtonLocator(projectId: string | number) {
		return (await this.getProjectWrapperById(projectId)).getByTestId('detach-project');
	}

	async getProjectWrapperById(id: string | number) {
		const project = await this.#enhancedPage
			.getByTestId('project-item-wrapper', {
				has: this.#enhancedPage.locator("div[data-tip='project id'] span.text-info", {
					hasText: `#${id}`
				})
			})
			.all();

		expect(project, 'only one project with this id should exist on the page').toHaveLength(1);

		return project[0];
	}
}

export const test = auth.extend<{ projectUtils: { page: ProjectsPage } }>({
	projectUtils: async ({ enhancedPage, authUtils }, use) => {
		// I have to include auth because we need to be authenticated to use this page
		await authUtils.login();
		await use({ page: new ProjectsPage(enhancedPage) });
	}
});
