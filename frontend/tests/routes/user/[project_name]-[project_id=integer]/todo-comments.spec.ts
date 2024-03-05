import { expect } from '@playwright/test';
import { getModal } from '../../../common-locators/modal';
import { waitForSpinnerStateToBeIdle } from '../../../common-locators/spinner';
import { test } from '../../../fixtures/todo-item';

test('create a comment', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	const todoItem = await todoItemUtils.page.getTodoItemLocatorById(t1.todoId);
	await todoItem.scrollIntoViewIfNeeded();

	const commentsCounterBeforeUpdate = parseInt(
		await (await todoItemUtils.page.getManageCommentsIndicator(t1.todoId)).innerText()
	);

	(await todoItemUtils.page.getManageCommentsButton(t1.todoId)).click();
	const modal = await getModal(enhancedPage, true);
	await waitForSpinnerStateToBeIdle(modal);

	await modal.getByRole('button', { name: 'add comment' }).click();
	await expect(modal).toContainText('Add a comment to the selected todo item');

	await modal.getByPlaceholder('message').focus();
	await modal.getByPlaceholder('message').fill('some text');
	await modal.getByRole('button', { name: 'add', exact: true }).click();
	await modal
		.locator('div[role="alert"]', { hasText: 'Todo comment created' })
		.waitFor({ state: 'visible' });

	const commentsCounterAfterUpdate = parseInt(
		await (await todoItemUtils.page.getManageCommentsIndicator(t1.todoId)).innerText()
	);

	expect(commentsCounterBeforeUpdate).toEqual(commentsCounterAfterUpdate - 1);
});

// test('update a comment', ({ page }) => {
// 	// test the comment counter is the same
// });

// test('delete a comment', ({ page }) => {
// 	// test the comments counter has decreased
// });
