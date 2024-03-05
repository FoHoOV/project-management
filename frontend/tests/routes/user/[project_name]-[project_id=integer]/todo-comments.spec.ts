import { expect } from '@playwright/test';
import { getModal } from '../../../common-locators/modal';
import { test } from '../../../fixtures/todo-item/todo-item';
import { waitForSpinnerStateToBeIdle } from '../../../common-locators/spinner';

test('create a comment', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	await todoItemUtils.page.comments.create({
		comment: 'some comment1',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.create({
		comment: 'some comment2',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.create({
		comment: 'some comment3',
		todoId: t1.todoId
	});

	await (await todoItemUtils.page.getManageCommentsButton(t1.todoId)).click();
	const modal = await getModal(enhancedPage);
	await waitForSpinnerStateToBeIdle(modal);

	const texts = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(texts).toEqual(['some comment3', 'some comment2', 'some comment1']);
});

// test('update a comment', ({ page }) => {
// 	// test the comment counter is the same
// });

// test('delete a comment', ({ page }) => {
// 	// test the comments counter has decreased
// });
