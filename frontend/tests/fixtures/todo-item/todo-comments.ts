import { expect, type Locator } from '@playwright/test';
import { closeModal, getModal } from '../../common-locators/modal';
import { waitForSpinnerStateToBeIdle } from '../../common-locators/spinner';
import type { EnhancedPage } from '../enhanced-page';
import type { TodoItemHelpers, TodoItemPage } from './todo-item';
import { acceptConfirmDialog } from '../../common-locators/confirm';

export class TodoCommentPage {
	constructor(
		private enhancedPage: EnhancedPage,
		private todoItemUtils: { page: TodoItemPage; helpers: TodoItemHelpers }
	) {}

	async create({ comment, todoId }: { comment: string; todoId?: number | string }) {
		if (!todoId) {
			todoId = (await this.todoItemUtils.helpers.createTodoItem()).todoId;
		}

		const todoItem = await this.todoItemUtils.page.getTodoItemLocatorById(todoId);
		await todoItem.scrollIntoViewIfNeeded();

		const commentsCounterBeforeUpdate = parseInt(
			await (await this.todoItemUtils.page.getManageCommentsIndicator(todoId)).innerText()
		);

		(await this.todoItemUtils.page.getManageCommentsButton(todoId)).click();
		const modal = await getModal(this.enhancedPage, true);
		await waitForSpinnerStateToBeIdle(modal);

		await modal.getByRole('button', { name: 'add comment' }).click();
		await expect(modal).toContainText('Add a comment to the selected todo item');

		await modal.getByPlaceholder('message').focus();
		await modal.getByPlaceholder('message').fill(comment);
		await modal.getByRole('button', { name: 'add', exact: true }).click();
		await modal
			.locator('div[role="alert"]', { hasText: 'Todo comment created' })
			.waitFor({ state: 'visible' });

		await closeModal(modal);

		const commentsCounterAfterUpdate = parseInt(
			await (await this.todoItemUtils.page.getManageCommentsIndicator(todoId)).innerText()
		);

		expect(commentsCounterBeforeUpdate).toEqual(commentsCounterAfterUpdate - 1);
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param commentText - locator should have a comment that contains `commentText`
	 */

	async delete(locator: Locator, commentText: string) {
		const comment = await this.getWrapper(locator, commentText);

		await (await this.getDeleteButton(locator, commentText)).click();

		await acceptConfirmDialog(comment);
		await waitForSpinnerStateToBeIdle(await getModal(this.enhancedPage));
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param commentText - will return the wrapper for a comment that contains `commentText`
	 */
	async getWrapper(locator: Locator, commentText: string) {
		const wrapper = await locator
			.locator("div[data-testid='todo-comments-wrapper']", { hasText: commentText })
			.all();

		expect(
			wrapper,
			'wrapper resolved to many/none comments - use a more specific comment text or a create a unique comment text to make your life easier (for instance by using crypto.randomUUID())'
		).toHaveLength(1);

		return wrapper[0];
	}

	async open(todoId: number | string) {
		await (await this.todoItemUtils.page.getManageCommentsButton(todoId)).click();
		const modal = await getModal(this.enhancedPage);
		await waitForSpinnerStateToBeIdle(modal);
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param commentText - will return a delete button for a comment that contains `commentText`
	 */
	async getDeleteButton(locator: Locator, commentText: string) {
		const deleteBtn = (await this.getWrapper(locator, commentText)).getByTestId(
			'todo-comment-delete'
		);

		return deleteBtn;
	}

	async getTodoCommentTexts(locator: Locator) {
		const texts = (await locator.getByTestId('todo-comment-text').all()).map(
			async (element) => await element.textContent()
		);

		return Promise.all(texts);
	}
}
