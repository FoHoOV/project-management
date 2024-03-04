import { expect } from '@playwright/test';
import type { ProjectsPage } from '../../../fixtures/project';
import { TodoCategoryPage } from '../../../fixtures/todo-category';
import crypto from 'crypto'; // TODO: idk why I need to import this, on windows it works without importing it but on linux it doesnt
import { test } from '../../../fixtures/todo-item';

async function createCategory(todoCategoryPage: TodoCategoryPage, projectsPage: ProjectsPage) {
	await projectsPage.goto();

	const projectTitle = `test${crypto.getRandomValues(new Uint32Array(1)).join('')}`;
	const project = await projectsPage.create({
		title: projectTitle,
		description: 'test'
	});

	await todoCategoryPage.goto(projectTitle, project.projectId);

	const categoryTitle = `title-${crypto.randomUUID()}`;
	const categoryDesc = `desc-${crypto.randomUUID()}`;
	const createdCategory = await todoCategoryPage.create({
		title: categoryTitle,
		description: categoryDesc
	});
	return { categoryId: createdCategory.categoryId, categoryTitle, categoryDesc };
}

test('creating todo items', async ({ todoItemUtils, todoCategoryUtils, projectUtils }) => {
	const category = await createCategory(todoCategoryUtils.page, projectUtils.page);

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
	const category = await createCategory(todoCategoryUtils.page, projectUtils.page);

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

test('deleting todo items', async ({ todoItemUtils, todoCategoryUtils, projectUtils }) => {
	const category = await createCategory(todoCategoryUtils.page, projectUtils.page);

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

test('moving todo to another category', ({ page }) => {});

test('reorder todo items in same category', ({ page }) => {});
