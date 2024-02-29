import { test as auth } from './access-token';
import { expect, type Page } from '@playwright/test';
import { getModal } from './modal';
import { getFloatingBtn } from './floating-btn';
import { type IPage } from './IPage';

class ProjectsPage implements IPage {
	#page: Page;

	constructor(page: Page) {
		this.#page = page;
	}

	async goto() {
		await this.#page.goto('/user/projects');
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
		await (await getFloatingBtn(this.#page)).click();
		const modal = await getModal(this.#page);
		await modal.getByPlaceholder('title').fill(title);
		await modal.getByPlaceholder('title').press('Tab');
		description && (await this.#page.getByPlaceholder('description (Optional)').fill(description));
		await modal.getByPlaceholder('description (Optional)').press('Tab');
		createFromDefaultTemplate &&
			(await this.#page.getByPlaceholder('Create from default template?').check());
		await modal.getByPlaceholder('Create from default template?').press('Tab');
		await modal.getByRole('button', { name: 'reset' }).press('Tab');
		await modal.getByRole('button', { name: 'create' }).press('Enter');
		await expect(modal.getByText('Project created')).toHaveCount(1);
		await modal.getByRole('button', { name: 'Close' }).click();

		const createdProject = await this.#page
			.locator('.card-title div.flex.items-baseline.gap-2', {
				has: this.#page.getByText(title)
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
	projectFactory: async ({ page, auth }, use) => {
		await use({ factory: new ProjectsPage(page) });
	}
});
