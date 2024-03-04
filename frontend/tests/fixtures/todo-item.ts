import { expect } from '@playwright/test';
import { closeModal, getModal } from '../common-locators/modal';
import { type IPage } from './IPage';
import type { EnhancedPage } from './test';

import type { TodoCategoryPage } from './todo-category';
import { test as todoCategoriesTest } from './todo-category';

class TodoItemPage implements IPage {
	#enhancedPage: EnhancedPage;
	#todoCategoryPage: TodoCategoryPage;

	constructor(enhancedPage: EnhancedPage, todoCategoryFactory: TodoCategoryPage) {
		this.#enhancedPage = enhancedPage;
		this.#todoCategoryPage = todoCategoryFactory;
	}

	async goto(projectTitle: string, projectId: number, projectShouldExist = true) {
		await this.#todoCategoryPage.goto(projectTitle, projectId, projectShouldExist);
	}

	async create({
		categoryId,
		title,
		description,
		dueDate
	}: {
		categoryId: string | number;
		title: string;
		description?: string;
		dueDate?: Date;
	}) {
		const addTodoBtn = await this.#todoCategoryPage.getAddTodoItemButton(categoryId);
		await addTodoBtn.click();
		const modal = await getModal(this.#enhancedPage, true);

		// fill in the data
		await modal.getByPlaceholder('title').click();
		await modal.getByPlaceholder('title').fill(title);
		await modal.getByPlaceholder('title').press('Tab');
		description && (await modal.getByPlaceholder('description (Optional)').fill(description));
		await modal.getByPlaceholder('description (Optional)').press('Tab');
		dueDate &&
			(await modal
				.getByPlaceholder('Due date (Optional)')
				.fill(`${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDay()}`));
		await modal.getByRole('button', { name: 'create' }).click();

		// successful message should exist
		await expect(modal.getByRole('alert'), 'create successful message should exist').toContainText(
			'Todo item created'
		);

		// close the modal
		await closeModal(modal);

		// find the created todo item
		const createdTodoItem = (await this.#todoCategoryPage.getCategoryLocatorById(categoryId))
			.getByTestId('todo-item-wrapper')
			.locator('div', {
				has: this.#enhancedPage.getByText(title)
			})
			.locator("div[data-tip='todo id'] span.text-info")
			.last(); // since its ordered from oldest to newest, then the newest one should be at the end

		await expect(createdTodoItem, 'created todo item should be present on the page').toHaveCount(1);

		return {
			todoId: parseInt((await createdTodoItem.innerText()).split('#')[1])
		};
	}

	async update({
		title,
		description,
		dueDate,
		markAsDone
	}: {
		title?: string;
		description?: string;
		dueDate?: Date;
		markAsDone?: boolean;
	}) {}

	async delete(todoId: number | string) {}

	async dragAndDrop({
		fromTodoId,
		toTodoId,
		direction
	}: {
		fromTodoId: string | number;
		toTodoId: string | number;
		direction: 'top' | 'bottom';
	}) {}

	async getTodoItemLocatorById(id: number | string) {}

	async getDeleteButton(id: number | string) {}

	async getEditButton(id: number | string) {}

	async getCreateButton() {}

	async getManageCommentsButton(id: number | string) {}

	async getManageTagsButton(id: number | string) {}

	async getManageDependenciesButton(id: number | string) {}

	async getTodoIdsFor(categoryId: string | number) {
		const category = await this.#todoCategoryPage.getCategoryLocatorById(categoryId);

		const elements = await category
			.getByTestId('todo-info')
			.locator("div[data-tip='todo id'] span.text-info")
			.all();

		const ids: number[] = [];

		for (let i = 0; i < elements.length; i++) {
			ids.push(parseInt((await elements[i].innerText()).trim().split('#')[1]));
		}

		return ids;
	}
}

export const test = todoCategoriesTest.extend<{ todoItemUtils: { page: TodoItemPage } }>({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	todoItemUtils: async ({ enhancedPage, todoCategoryUtils, auth }, use) => {
		// I have to include auth because we need to be authenticated to use this page
		await use({ page: new TodoItemPage(enhancedPage, todoCategoryUtils.page) });
	}
});
