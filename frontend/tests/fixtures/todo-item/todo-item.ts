import { expect } from '@playwright/test';
import { closeModal, getModal } from '../../common-locators/modal';
import { type IPage } from '../IPage';
import { dragAndDropTo, waitForAnimationEnd, type EnhancedPage } from '../test';

import type { TodoCategoryHelpers, TodoCategoryPage, TodoCategoryUtils } from '../todo-category';
import { test as todoCategoriesTest } from '../todo-category';
import { getConfirmAcceptButton } from '../../common-locators/confirm';
import { waitForSpinnerStateToBeIdle } from '../../common-locators/spinner';
import { TodoCommentPage } from './todo-comments';

export type TodoItemUtils = { page: TodoItemPage; helpers: TodoItemHelpers };

export class TodoItemPage implements IPage {
	#enhancedPage: EnhancedPage;
	#todoCategoryPage: TodoCategoryPage;
	public readonly comments: TodoCommentPage;
	constructor(enhancedPage: EnhancedPage, todoCategoryUtils: TodoCategoryUtils) {
		this.#enhancedPage = enhancedPage;
		this.#todoCategoryPage = todoCategoryUtils.page;
		this.comments = new TodoCommentPage(enhancedPage, {
			page: this,
			helpers: new TodoItemHelpers(enhancedPage, this, todoCategoryUtils)
		});
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
				.fill(this._convertDateToString(dueDate)));
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

		const createdTodoId = parseInt((await createdTodoItem.innerText()).split('#')[1]);
		const todoItem = await this.getTodoItemLocatorById(createdTodoId);
		await expect(
			todoItem.getByTestId('todo-info'),
			'selected todo item should contain the provided id'
		).toContainText(`#${createdTodoId}`);
		await expect(
			todoItem.getByTestId('todo-info'),
			'selected todo item should contain the title'
		).toContainText(title);
		await expect(todoItem, 'selected todo item should contain the description').toContainText(
			description ?? '-'
		);
		await expect(todoItem, 'selected todo item should contain to the due date').toContainText(
			dueDate ? dueDate.toLocaleDateString() : '-'
		);

		return {
			todoId: createdTodoId
		};
	}

	async edit({
		todoId,
		title,
		description,
		dueDate,
		markAsDone
	}: {
		todoId: string | number;
		title: string;
		description?: string;
		dueDate?: Date;
		markAsDone?: boolean;
	}) {
		const editTodoBtn = await this.getEditButton(todoId);
		await editTodoBtn.click();
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
				.fill(this._convertDateToString(dueDate)));

		markAsDone != null && (await (await this.getMarkAsDoneLocator(todoId)).setChecked(markAsDone));

		await modal.getByRole('button', { name: 'edit' }).click();

		// successful message should exist
		await expect(modal.getByRole('alert'), 'edit successful message should exist').toContainText(
			'Todo item edited'
		);

		// close the modal
		await closeModal(modal);

		// find and validate the edited todo item
		const todoItem = await this.getTodoItemLocatorById(todoId);
		await expect(
			todoItem.getByTestId('todo-info'),
			'selected todo item should contain the provided id'
		).toContainText(`#${todoId}`);
		await expect(
			todoItem.getByTestId('todo-info'),
			'selected todo item should be updated to the new title'
		).toContainText(title);
		await expect(
			todoItem,
			'selected todo item should be updated to the new description'
		).toContainText(description ?? '-');

		if (dueDate) {
			await expect(
				todoItem,
				'selected todo item should be updated to the new due date'
			).toContainText(dueDate ? dueDate.toLocaleDateString() : '-');
		}

		if (markAsDone != null) {
			expect(
				(await (await this.getMarkAsDoneLocator(todoId)).isChecked()) == markAsDone,
				'mark as done status should be same as input'
			).toBeTruthy();
		}
	}

	async delete(todoId: number | string) {
		const todo = await this.getTodoItemLocatorById(todoId);
		await (await this.getDeleteButton(todoId)).click();
		await getConfirmAcceptButton(todo).click();
		await todo.waitFor({ state: 'detached' });
	}

	async dragAndDrop({
		fromTodoId,
		toTodoId,
		direction
	}: {
		fromTodoId: string | number;
		toTodoId: string | number;
		direction: 'top' | 'bottom';
	}) {
		const currentTodoItem = await this.getTodoItemLocatorById(fromTodoId);
		const targetTodoItem = await this.getTodoItemLocatorById(toTodoId);

		await dragAndDropTo({
			page: this.#enhancedPage,
			from: currentTodoItem,
			to: targetTodoItem,
			offsetFromCenter: direction == 'top' ? { x: 0, y: -5 } : { x: 0, y: 5 },
			steps: 25 // but like this is a lucky guess :|
		});

		await expect(
			targetTodoItem.getByRole('alert'),
			'no errors should have occurred'
		).not.toBeVisible();

		await waitForSpinnerStateToBeIdle(targetTodoItem);
		await waitForAnimationEnd(currentTodoItem);
		await waitForAnimationEnd(targetTodoItem);
	}

	async getTodoItemLocatorById(id: number | string) {
		const todoItem = await this.#enhancedPage
			.locator("div[data-testid='todo-item-wrapper']", { hasText: `#${id}` })
			.all();

		expect(
			todoItem.length == 1,
			'only one todo-item with this id should exist on the page'
		).toBeTruthy();

		return todoItem[0];
	}

	async getDeleteButton(id: number | string) {
		const todoItem = await this.getTodoItemLocatorById(id);
		return todoItem.getByTestId('todo-item-delete');
	}

	async getEditButton(id: number | string) {
		const todoItem = await this.getTodoItemLocatorById(id);
		return todoItem.getByTestId('todo-item-edit');
	}

	async getCreateButton(categoryId: number | string) {
		return await this.#todoCategoryPage.getAddTodoItemButton(categoryId);
	}

	async getManageCommentsWrapper(id: number | string) {
		const todoItem = await this.getTodoItemLocatorById(id);
		return todoItem.getByTestId('todo-item-comments');
	}

	async getManageCommentsButton(id: number | string) {
		return (await this.getManageCommentsWrapper(id)).getByRole('button', { name: 'comments' });
	}

	async getManageCommentsIndicator(id: number | string) {
		return (await this.getManageCommentsWrapper(id)).locator('span.indicator-item');
	}

	async getManageTagsWrapper(id: number | string) {
		const todoItem = await this.getTodoItemLocatorById(id);
		return todoItem.getByTestId('todo-item-tags');
	}

	async getManageTagsButton(id: number | string) {
		return (await this.getManageTagsWrapper(id)).getByRole('button', { name: 'tags' });
	}

	async getManageTagsIndicator(id: number | string) {
		return (await this.getManageTagsWrapper(id)).locator('span.indicator-item');
	}

	async getManageDependenciesWrapper(id: number | string) {
		const todoItem = await this.getTodoItemLocatorById(id);
		return todoItem.getByTestId('todo-item-dependencies');
	}

	async getManageDependenciesButton(id: number | string) {
		return (await this.getManageDependenciesWrapper(id)).getByRole('button', {
			name: 'dependencies'
		});
	}

	async getManageDependenciesIndicator(id: number | string) {
		return (await this.getManageDependenciesWrapper(id)).locator('span.indicator-item');
	}

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

	async getMarkAsDoneLocator(id: string | number) {
		return (await this.getTodoItemLocatorById(id)).getByTestId('todo-item-is-done');
	}

	private _convertDateToString(date: Date) {
		return new Intl.DateTimeFormat('sv-SE').format(date);
	}
}

export class TodoItemHelpers {
	#enhancedPage: EnhancedPage;
	#todoItemPage: TodoItemPage;
	#todoCategoryHelpers: TodoCategoryHelpers;

	constructor(
		enhancedPage: EnhancedPage,
		todoItemPage: TodoItemPage,
		todoCategoryUtils: TodoCategoryUtils
	) {
		this.#enhancedPage = enhancedPage;
		this.#todoItemPage = todoItemPage;
		this.#todoCategoryHelpers = todoCategoryUtils.helpers;
	}

	async createTodoItem(existingCategoryId?: number | string) {
		let createdCategoryId: string | number = existingCategoryId ?? -1;

		if (!existingCategoryId) {
			createdCategoryId = (await this.#todoCategoryHelpers.createCategory()).categoryId;
		}

		return await this.#todoItemPage.create({
			categoryId: createdCategoryId,
			title: 't1'
		});
	}
}

export const test = todoCategoriesTest.extend<{
	todoItemUtils: TodoItemUtils;
}>({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	todoItemUtils: async ({ enhancedPage, todoCategoryUtils, auth }, use) => {
		// I have to include auth because we need to be authenticated to use this page
		const todoItemPage = new TodoItemPage(enhancedPage, todoCategoryUtils);
		await use({
			page: todoItemPage,
			helpers: new TodoItemHelpers(enhancedPage, todoItemPage, todoCategoryUtils)
		});
	}
});
