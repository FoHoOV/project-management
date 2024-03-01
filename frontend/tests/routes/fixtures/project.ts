import { test as auth } from './access-token';
import { expect, type Page } from '@playwright/test';
import { getModal } from './modal';
import { getFloatingBtn } from './floating-btn';
import { type IPage } from './IPage';
import { type EnhancedPage } from './test';

class ProjectsPage implements IPage {
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
		await modal.getByRole('button', { name: 'Close' }).click();

		// find the created category
		const createdProject = await this.#enhancedPage
			.locator('.card-title div.flex.items-baseline.gap-2', {
				has: this.#enhancedPage.getByText(title)
			})
			.locator("div[data-tip='project id'] span.text-info")
			.last(); // since its ordered from newest to oldest, then the newest one should be at the end

		await expect(createdProject, 'created project should be present on the page').toHaveCount(1);

		return {
			projectId: parseInt((await createdProject.innerText()).split('#')[1])
		};
	}
}

export const test = auth.extend<{ projectFactory: { factory: ProjectsPage } }>({
	projectFactory: async ({ enhancedPage, auth }, use) => {
		await use({ factory: new ProjectsPage(enhancedPage) });
	}
});
