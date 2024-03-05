import { test } from '../../../fixtures/todo-item/todo-item';

test('create a comment', async ({ todoItemUtils }) => {
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
});

// test('update a comment', ({ page }) => {
// 	// test the comment counter is the same
// });

// test('delete a comment', ({ page }) => {
// 	// test the comments counter has decreased
// });
