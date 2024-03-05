import { expect } from '@playwright/test';
import { closeModal, getModal } from '../../common-locators/modal';
import { waitForSpinnerStateToBeIdle } from '../../common-locators/spinner';
import type { EnhancedPage } from '../test';
import type { TodoItemHelpers, TodoItemPage } from './todo-item';

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
}
