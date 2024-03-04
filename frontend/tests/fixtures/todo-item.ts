import { type IPage } from './IPage';
import type { EnhancedPage } from './test';

import type { TodoCategoryPage } from './todo-category';
import { test as todoCategoriesTest } from './todo-category';

class TodoItemPage implements IPage {
	#page: EnhancedPage;
	#todoCategoryFactory: TodoCategoryPage;

	constructor(page: EnhancedPage, todoCategoryFactory: TodoCategoryPage) {
		this.#page = page;
		this.#todoCategoryFactory = todoCategoryFactory;
	}

	async goto(projectTitle: string, projectId: number, projectShouldExist = true) {
		await this.#todoCategoryFactory.goto(projectTitle, projectId, projectShouldExist);
	}

	async create({
		title,
		description,
		dueDate
	}: {
		title: string;
		description?: string;
		dueDate?: Date;
	}) {}

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
