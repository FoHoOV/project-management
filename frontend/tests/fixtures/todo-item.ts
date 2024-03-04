import { expect } from '@playwright/test';
import { closeModal, getModal } from '../common-locators/modal';
import { type IPage } from './IPage';
import type { EnhancedPage } from './test';

import type { TodoCategoryPage } from './todo-category';
import { test as todoCategoriesTest } from './todo-category';

class TodoItemPage implements IPage {
	#enhancedPage: EnhancedPage;
	#todoCategoryFactory: TodoCategoryPage;

	constructor(enhancedPage: EnhancedPage, todoCategoryFactory: TodoCategoryPage) {
		this.#enhancedPage = enhancedPage;
		this.#todoCategoryFactory = todoCategoryFactory;
	}

	async goto(projectTitle: string, projectId: number, projectShouldExist = true) {
		await this.#todoCategoryFactory.goto(projectTitle, projectId, projectShouldExist);
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
		const addTodoBtn = await this.#todoCategoryFactory.getAddTodoItemButton(categoryId);
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
		const createdTodoItem = (await this.#todoCategoryFactory.getCategoryLocatorById(categoryId))
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

	async getTodoIdsFor(categoryId: string | number) {}
}

export const test = todoCategoriesTest.extend<{ todoItemFactory: { factory: TodoItemPage } }>({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	todoItemFactory: async ({ enhancedPage, todoCategoryFactory, auth }, use) => {
		// I have to include auth because we need to be authenticated to use this page
		await use({ factory: new TodoItemPage(enhancedPage, todoCategoryFactory.factory) });
	}
});
