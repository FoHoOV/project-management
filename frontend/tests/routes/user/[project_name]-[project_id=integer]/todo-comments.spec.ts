import { expect } from 'vitest';
import { getModal } from '../../../common-locators/modal';
import { waitForSpinnerStateToBeIdle } from '../../../common-locators/spinner';
import { test } from '../../../fixtures/todo-item';

test('create a comment', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();
	const todo = await todoItemUtils.page.getTodoItemLocatorById(t1.todoId);

	(await todoItemUtils.page.getManageCommentsButton(t1.todoId)).click();
	const modal = await getModal(enhancedPage, true);
	await waitForSpinnerStateToBeIdle(modal);

	await modal.getByRole('button', { name: 'add comment' }).click();
	expect();
});

// test('update a comment', ({ page }) => {
// 	// test the comment counter is the same
// });

// test('delete a comment', ({ page }) => {
// 	// test the comments counter has decreased
// });
