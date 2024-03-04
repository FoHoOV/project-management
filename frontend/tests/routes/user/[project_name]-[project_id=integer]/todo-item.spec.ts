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

	await todoItemUtils.page.create({
		categoryId: category.categoryId,
		title: 'some radom sheit',
		description: 'some other random sheit'
	});
});

test('deleting todo items', ({ page }) => {});

test('editing todo items', ({ page }) => {});

test('moving todo to another category', ({ page }) => {});

test('reorder todo items', ({ page }) => {});
