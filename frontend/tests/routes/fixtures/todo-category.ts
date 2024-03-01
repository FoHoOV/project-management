import { expect, type Page } from '@playwright/test';
import type { IPage } from './IPage';
import { generateTodoListUrl } from '../../../src/lib/utils/params/route';
import { test as projects } from './project';
import { getModal } from './modal';
import { getFloatingBtn } from './floating-btn';
import { type EnhancedPage } from './test';

class TodoCategoryPage implements IPage {
	#enhancedPage: EnhancedPage;

	constructor(enhancedPage: EnhancedPage) {
		this.#enhancedPage = enhancedPage;
	}

	async goto(projectTitle: string, projectId: number, projectShouldExist = true) {
		const response = await this.#enhancedPage.goto(generateTodoListUrl(projectTitle, projectId));
		if (projectShouldExist) {
			expect(response, 'response should exist').toBeTruthy();
			await expect(response!.status() == 200, 'todo category page should exist').toBeTruthy();
		}
	}

	async create({ title, description }: { title: string; description?: string }) {
		await (await getFloatingBtn(this.#enhancedPage)).click();

		const modal = await getModal(this.#enhancedPage);

		// fill in the data
		await modal.getByPlaceholder('title').fill(title);
		await modal.getByPlaceholder('title').press('Tab');
		description && (await modal.getByPlaceholder('description (Optional)').fill(description));
		await modal.getByRole('button', { name: 'create' }).click();
		await expect(modal.getByRole('alert')).toContainText('Todo category created');

		// close the modal
		await modal.getByRole('button', { name: 'Close' }).click();

		// find the created category
		const createdTodoCategory = await this.#enhancedPage
			.locator('div.relative.flex.h-full.w-full.rounded-xl', {
				has: this.#enhancedPage.getByText(title)
			})
			.locator("div[data-tip='category id'] span.text-info")
			.last(); // since its ordered from oldest to newest, then the newest one should be at the end

		await expect(
			createdTodoCategory,
			'created todo category should be present on the page'
		).toHaveCount(1);

		return {
			categoryId: parseInt((await createdTodoCategory.innerText()).split('#')[1])
		};
	}

	async getCategoryLocatorById(id: number) {
		const category = await this.#enhancedPage
			.locator('div.relative.flex.h-full.w-full.rounded-xl', {
				hasText: `#${id}`
			})
			.all();

		await expect(
			category.length == 1,
			'only one category with this id should exist on the page'
		).toBeTruthy();
		return category[0];
	}
}

export const test = projects.extend<{ todoCategoryFactory: { factory: TodoCategoryPage } }>({
	todoCategoryFactory: async ({ enhancedPage, auth }, use) => {
		await use({ factory: new TodoCategoryPage(enhancedPage) });
	}
});
