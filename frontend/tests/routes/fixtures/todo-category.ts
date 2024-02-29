import { expect, type Page } from '@playwright/test';
import type { IPage } from './IPage';
import { generateTodoListUrl } from '../../../src/lib/utils/params/route';
import { test as projects } from './project';
import { getModal } from './modal';
import { getFloatingBtn } from './floating-btn';

class TodoCategoryPage implements IPage {
	#page: Page;

	constructor(page: Page) {
		this.#page = page;
	}

	async goto(projectTitle: string, projectId: number, projectShouldExist = true) {
		const response = await this.#page.goto(generateTodoListUrl(projectTitle, projectId));
		if (projectShouldExist) {
			expect(response, 'response should exist').toBeTruthy();
			await expect(response!.status() == 200, 'todo category page should exist').toBeTruthy();
		}
	}

	async create({ title, description }: { title: string; description?: string }) {
		await (await getFloatingBtn(this.#page)).click();

		const modal = await getModal(this.#page);

		await modal.getByPlaceholder('title').fill(title);
		await modal.getByPlaceholder('title').press('Tab');
		description && (await modal.getByPlaceholder('description (Optional)').fill(description));
		await modal.getByRole('button', { name: 'create' }).click();
		await expect(modal.getByRole('alert')).toContainText('Todo category created');
		await modal.getByRole('button', { name: 'Close' }).click();

		const createdTodoCategory = await this.#page
			.locator('div.relative.flex.h-full.w-full.rounded-xl', {
				has: this.#page.getByText(title)
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
		const category = await this.#page
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
	todoCategoryFactory: async ({ page, auth }, use) => {
		await use({ factory: new TodoCategoryPage(page) });
	}
});
