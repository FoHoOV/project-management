import { expect } from '@playwright/test';
import { getModal } from '../../../common-locators/modal';
import { test } from '../../../fixtures/todo-item/todo-item';

test('create a dependency', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	const dep1 = await todoItemUtils.helpers.createTodoItem(t1.categoryId);
	const dep2 = await todoItemUtils.helpers.createTodoItem(t1.categoryId);
	const dep3 = await todoItemUtils.helpers.createTodoItem(t1.categoryId);

	await todoItemUtils.page.dependencies.create({
		dependencyId: dep1.todoId,
		todoId: t1.todoId
	});

	await todoItemUtils.page.dependencies.create({
		dependencyId: dep2.todoId,
		todoId: t1.todoId
	});

	await todoItemUtils.page.dependencies.create({
		dependencyId: dep3.todoId,
		todoId: t1.todoId
	});

	await todoItemUtils.page.dependencies.open(t1.todoId);
	const modal = await getModal(enhancedPage);

	const texts = await todoItemUtils.page.dependencies.getTodoDependencyIds(modal);
	expect(texts).toEqual([dep1.todoId, dep2.todoId, dep3.todoId]);
});

test('delete a dependency', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	const dep1 = await todoItemUtils.helpers.createTodoItem(t1.categoryId);
	const dep2 = await todoItemUtils.helpers.createTodoItem(t1.categoryId);
	const dep3 = await todoItemUtils.helpers.createTodoItem(t1.categoryId);

	await todoItemUtils.page.dependencies.create({
		dependencyId: dep1.todoId,
		todoId: t1.todoId
	});

	await todoItemUtils.page.dependencies.create({
		dependencyId: dep2.todoId,
		todoId: t1.todoId
	});

	await todoItemUtils.page.dependencies.create({
		dependencyId: dep3.todoId,
		todoId: t1.todoId
	});

	await todoItemUtils.page.dependencies.open(t1.todoId);
	const modal = await getModal(enhancedPage);

	await todoItemUtils.page.dependencies.delete(modal, dep2.todoId);
	const step1 = await todoItemUtils.page.dependencies.getTodoDependencyIds(modal);
	expect(step1).toEqual([dep1.todoId, dep3.todoId]);

	await todoItemUtils.page.dependencies.delete(modal, dep1.todoId);
	const step2 = await todoItemUtils.page.dependencies.getTodoDependencyIds(modal);
	expect(step2).toEqual([dep3.todoId]);

	await todoItemUtils.page.dependencies.delete(modal, dep3.todoId);
	const step3 = await todoItemUtils.page.dependencies.getTodoDependencyIds(modal);
	expect(step3).toEqual([]);
});

// test('update a dependency', ({ page }) => {
// 	// test the dependency counter is the same
// });
