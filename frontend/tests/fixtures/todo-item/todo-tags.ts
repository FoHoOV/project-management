import { expect, type Locator } from '@playwright/test';
import { closeModal, getModal } from '../../common-locators/modal';
import { waitForSpinnerStateToBeIdle } from '../../common-locators/spinner';
import type { EnhancedPage } from '../enhanced-page';
import type { TodoItemHelpers, TodoItemPage } from './todo-item';
import { acceptConfirmDialog } from '../../common-locators/confirm';
import { getByTestId } from '../../common-locators/builtins';

export class TodoTagPage {
	constructor(
		private enhancedPage: EnhancedPage,
		private todoItemUtils: { page: TodoItemPage; helpers: TodoItemHelpers }
	) {}

	async create({ tag, todoId }: { tag: string; todoId?: number | string }) {
		if (!todoId) {
			todoId = (await this.todoItemUtils.helpers.createTodoItem()).todoId;
		}

		const todoItem = await this.todoItemUtils.page.getTodoItemLocatorById(todoId);
		await todoItem.scrollIntoViewIfNeeded();

		const tagsCounterBeforeUpdate = parseInt(
			await (await this.todoItemUtils.page.getManageTagsIndicator(todoId)).innerText()
		);

		(await this.todoItemUtils.page.getManageTagsButton(todoId)).click();
		const modal = await getModal(this.enhancedPage, true);
		await waitForSpinnerStateToBeIdle(modal);

		await modal.getByRole('button', { name: 'add' }).click();
		await expect(modal).toContainText('Add tags to this todo item');

		await modal.getByPlaceholder('name').focus();
		await modal.getByPlaceholder('name').fill(tag);
		await modal.getByRole('button', { name: 'add', exact: true }).click();
		await modal
			.locator('div[role="alert"]', { hasText: 'Tag created' })
			.waitFor({ state: 'visible' });

		await closeModal(modal);

		const tagsCounterAfterUpdate = parseInt(
			await (await this.todoItemUtils.page.getManageTagsIndicator(todoId)).innerText()
		);

		expect(tagsCounterBeforeUpdate).toEqual(tagsCounterAfterUpdate - 1);
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param tagName - locator should have a tag that contains `tagName`
	 */

	async delete(locator: Locator, tagName: string) {
		const tag = await this.getWrapper(locator, tagName);

		await (await this.getDeleteButton(locator, tagName)).click();

		await acceptConfirmDialog(tag);
		await waitForSpinnerStateToBeIdle(await getModal(this.enhancedPage));
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param tagName - locator should have a tag that contains `tagName`
	 */
	async getWrapper(locator: Locator, tagName: string) {
		const wrapper = await getByTestId(locator, 'todo-tags-wrapper', {
			hasText: tagName
		}).all();

		expect(
			wrapper,
			'wrapper resolved to many/none tags - use a more specific tag name or a create a unique tag name to make your life easier (for instance by using crypto.randomUUID())'
		).toHaveLength(1);

		return wrapper[0];
	}

	async open(todoId: number | string) {
		await (await this.todoItemUtils.page.getManageTagsButton(todoId)).click();
		const modal = await getModal(this.enhancedPage);
		await waitForSpinnerStateToBeIdle(modal);
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param tagName - will return a delete button for a tag that contains `tagName`
	 */
	async getDeleteButton(locator: Locator, tagName: string) {
		const deleteBtn = (await this.getWrapper(locator, tagName)).getByTestId('todo-tag-delete');

		return deleteBtn;
	}

	async getTodoTagTexts(locator: Locator) {
		const texts = (await locator.getByTestId('todo-tag-text').all()).map(
			async (element) => await element.textContent()
		);

		return Promise.all(texts);
	}
}
