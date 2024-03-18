import { expect } from '@playwright/test';
import { getModal } from '../../../../common-locators/modal';
import { test } from '../../../../fixtures/todo-item/todo-item';

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

	await todoItemUtils.page.comments.open(t1.todoId);
	const modal = await getModal(enhancedPage);

	const texts = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(texts).toEqual(['some comment3', 'some comment2', 'some comment1']);
});

test('delete a comment', async ({ enhancedPage, todoItemUtils }) => {
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

	await todoItemUtils.page.comments.open(t1.todoId);
	const modal = await getModal(enhancedPage);

	await todoItemUtils.page.comments.delete(modal, 'some comment2');
	const step1 = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(step1).toEqual(['some comment3', 'some comment1']);

	await todoItemUtils.page.comments.delete(modal, 'some comment1');
	const step2 = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(step2).toEqual(['some comment3']);

	await todoItemUtils.page.comments.delete(modal, 'some comment3');
	const step3 = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(step3).toEqual([]);
});

// test('update a comment', ({ page }) => {
// 	// test the comment counter is the same
// });
