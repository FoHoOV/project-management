import { expect } from '@playwright/test';
import { test } from '../../../fixtures/todo-item/todo-item';

test('creating todo items', async ({ todoItemUtils, todoCategoryUtils }) => {
	const category = await todoCategoryUtils.helpers.createCategory();

	const t1 = await todoItemUtils.page.create({
		categoryId: category.categoryId,
		title: 't1',
		description: 'some other random sheit'
	});

	const t2 = await todoItemUtils.page.create({
		categoryId: category.categoryId,
		title: 't2',
		description: 'some other random sheit',
		dueDate: new Date(Date.now())
	});

	const t3 = await todoItemUtils.page.create({
		categoryId: category.categoryId,
		title: 't3',
		description: 'some other random sheit'
	});

	const ids = await todoItemUtils.page.getTodoIdsFor(category.categoryId);

	expect(ids, '3 todo items should be created').toHaveLength(3);

	expect(
		ids[0] == t1.todoId && ids[1] == t2.todoId && ids[2] == t3.todoId,
		'created todos should be ordered from oldest to newest'
	).toBeTruthy();
});

test('editing todo items', async ({ todoItemUtils, todoCategoryUtils, projectUtils }) => {
	const category = await todoCategoryUtils.helpers.createCategory();

	const t1 = await todoItemUtils.page.create({
		categoryId: category.categoryId,
		title: 't1',
		description: 'some other random sheit'
	});

	await todoItemUtils.page.edit({
		todoId: t1.todoId,
		title: 'new title t1',
		description: 'new description ',
		dueDate: new Date(Date.now())
	});
});

test('deleting todo items', async ({ todoItemUtils, todoCategoryUtils }) => {
	const category = await todoCategoryUtils.helpers.createCategory();

	const t1 = await todoItemUtils.page.create({
		categoryId: category.categoryId,
		title: 't1'
	});

	const t2 = await todoItemUtils.page.create({
		categoryId: category.categoryId,
		title: 't2'
	});

	// before deletions there should be 2 todos
	expect(
		await todoItemUtils.page.getTodoIdsFor(category.categoryId),
		'before deletions there should be 2 todos'
	).toHaveLength(2);

	await todoItemUtils.page.delete(t1.todoId);

	// after 1 deletion only category should exist
	expect(
		await todoItemUtils.page.getTodoIdsFor(category.categoryId),
		'after 1 deletion only 1 todo item should exist'
	).toHaveLength(1);

	await todoItemUtils.page.delete(t2.todoId);

	// after 2 deletions only no todos should exist
	expect(
		await todoItemUtils.page.getTodoIdsFor(category.categoryId),
		'after 2 deletions only no todos should exist'
	).toHaveLength(0);
});

test('moving todo to another category', async ({
	todoItemUtils,
	todoCategoryUtils,
	projectUtils
}) => {
	const p1 = await projectUtils.page.create({ title: 'p1' });
	const c1 = await todoCategoryUtils.helpers.createCategory({
		projectId: p1.projectId,
		projectTitle: 'p1'
	});
	const c2 = await todoCategoryUtils.helpers.createCategory({
		projectId: p1.projectId,
		projectTitle: 'p1'
	});

	const t1 = await todoItemUtils.page.create({
		categoryId: c1.categoryId,
		title: 't1'
	});

	const t2 = await todoItemUtils.page.create({
		categoryId: c1.categoryId,
		title: 't2'
	});

	const t3 = await todoItemUtils.page.create({
		categoryId: c2.categoryId,
		title: 't3'
	});

	const t4 = await todoItemUtils.page.create({
		categoryId: c2.categoryId,
		title: 't4'
	});

	await todoItemUtils.page.dragAndDrop({
		fromTodoId: t1.todoId,
		toTodoId: t3.todoId,
		direction: 'top'
	});
	const step1 = await todoItemUtils.page.getTodoIdsFor(c2.categoryId);
	expect(step1, `c2 should have 3 todo items now`).toHaveLength(3);
	expect(step1).toEqual([t1.todoId, t3.todoId, t4.todoId]);

	await todoItemUtils.page.dragAndDrop({
		fromTodoId: t1.todoId,
		toTodoId: t2.todoId,
		direction: 'top'
	});
	const step2 = await todoItemUtils.page.getTodoIdsFor(c2.categoryId);
	expect(step2, `c2 should have 2 todo items now`).toHaveLength(2);
	expect(step2).toEqual([t3.todoId, t4.todoId]);

	await todoItemUtils.page.dragAndDrop({
		fromTodoId: t3.todoId,
		toTodoId: t1.todoId,
		direction: 'bottom'
	});
	const step3 = await todoItemUtils.page.getTodoIdsFor(c1.categoryId);
	expect(step3, `c1 should have 3 todo items now`).toHaveLength(3);
	expect(step3).toEqual([t1.todoId, t3.todoId, t2.todoId]);
});

test('reorder todo items in same category', async ({ todoItemUtils, todoCategoryUtils }) => {
	const c1 = await todoCategoryUtils.helpers.createCategory();

	const t1 = await todoItemUtils.page.create({
		categoryId: c1.categoryId,
		title: 't1'
	});

	const t2 = await todoItemUtils.page.create({
		categoryId: c1.categoryId,
		title: 't2'
	});

	const t3 = await todoItemUtils.page.create({
		categoryId: c1.categoryId,
		title: 't3'
	});

	await todoItemUtils.page.dragAndDrop({
		fromTodoId: t1.todoId,
		toTodoId: t2.todoId,
		direction: 'top'
	});
	const step1 = await todoItemUtils.page.getTodoIdsFor(c1.categoryId);
	expect(step1).toEqual([t1.todoId, t2.todoId, t3.todoId]);

	await todoItemUtils.page.dragAndDrop({
		fromTodoId: t1.todoId,
		toTodoId: t2.todoId,
		direction: 'bottom'
	});
	const step2 = await todoItemUtils.page.getTodoIdsFor(c1.categoryId);
	expect(step2).toEqual([t2.todoId, t1.todoId, t3.todoId]);

	await todoItemUtils.page.dragAndDrop({
		fromTodoId: t3.todoId,
		toTodoId: t2.todoId,
		direction: 'top'
	});
	const step3 = await todoItemUtils.page.getTodoIdsFor(c1.categoryId);
	expect(step3).toEqual([t3.todoId, t2.todoId, t1.todoId]);

	const t4 = await todoItemUtils.page.create({
		categoryId: c1.categoryId,
		title: 't4'
	});

	await todoItemUtils.page.dragAndDrop({
		fromTodoId: t4.todoId,
		toTodoId: t3.todoId,
		direction: 'top'
	});

	const step4 = await todoItemUtils.page.getTodoIdsFor(c1.categoryId);
	expect(step4).toEqual([t4.todoId, t3.todoId, t2.todoId, t1.todoId]);
});
