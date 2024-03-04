import { expect } from '@playwright/test';
import type { ProjectsPage } from '../../../fixtures/project';
import { TodoCategoryPage } from '../../../fixtures/todo-category';
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
		description: 'some other random sheit'
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

test('deleting todo items', ({ page }) => {});

test('editing todo items', ({ page }) => {});

test('moving todo to another category', ({ page }) => {});

test('reorder todo items', ({ page }) => {});
