import { expect } from '@playwright/test';
import { getModal } from '../../../common-locators/modal';
import { test } from '../../../fixtures/todo-item/todo-item';

test('create a tag', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	await todoItemUtils.page.tags.create({
		tag: 'some tag1',
		todoId: t1.todoId
	});

	await todoItemUtils.page.tags.create({
		tag: 'some tag2',
		todoId: t1.todoId
	});

	await todoItemUtils.page.tags.create({
		tag: 'some tag3',
		todoId: t1.todoId
	});

	await todoItemUtils.page.tags.open(t1.todoId);
	const modal = await getModal(enhancedPage);

	const texts = await todoItemUtils.page.tags.getTodoTagTexts(modal);
	expect(texts).toEqual(['some tag3', 'some tag2', 'some tag1']);
});

test('delete a tag', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	await todoItemUtils.page.tags.create({
		tag: 'some tag1',
		todoId: t1.todoId
	});

	await todoItemUtils.page.tags.create({
		tag: 'some tag2',
		todoId: t1.todoId
	});

	await todoItemUtils.page.tags.create({
		tag: 'some tag3',
		todoId: t1.todoId
	});

	await todoItemUtils.page.tags.open(t1.todoId);
	const modal = await getModal(enhancedPage);

	await todoItemUtils.page.tags.delete(modal, 'some tag2');
	const step1 = await todoItemUtils.page.tags.getTodoTagTexts(modal);
	expect(step1).toEqual(['some tag3', 'some tag1']);

	await todoItemUtils.page.tags.delete(modal, 'some tag1');
	const step2 = await todoItemUtils.page.tags.getTodoTagTexts(modal);
	expect(step2).toEqual(['some tag3']);

	await todoItemUtils.page.tags.delete(modal, 'some tag3');
	const step3 = await todoItemUtils.page.tags.getTodoTagTexts(modal);
	expect(step3).toEqual([]);
});

// test('update a tag', ({ page }) => {
// 	// test the tag counter is the same
// });
