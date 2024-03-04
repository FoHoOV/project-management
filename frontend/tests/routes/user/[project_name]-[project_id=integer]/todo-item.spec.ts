import { test } from '../../../fixtures/todo-item';

test.describe('todos test that all depend on a project and a category', () => {
	test.beforeEach(async ({ todoCategoryFactory, projectFactory }) => {
		await projectFactory.factory.goto();

		const projectTitle = `test${crypto.randomUUID()}`;
		const project = await projectFactory.factory.create({
			title: projectTitle,
			description: 'test'
		});

		await todoCategoryFactory.factory.goto(projectTitle, project.projectId);
		const c1 = await todoCategoryFactory.factory.create({
			title: `test${crypto.randomUUID()}`,
			description: 'test1'
		});
	});

	test('creating todo items', ({ todoItemFactory, projectFactory }) => {});

	test('deleting todo items', ({ page }) => {});

	test('editing todo items', ({ page }) => {});

	test('moving todo to another category', ({ page }) => {});

	test('reorder todo items', ({ page }) => {});
});
