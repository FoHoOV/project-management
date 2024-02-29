import { expect } from '@playwright/test';
import { test } from '../../fixtures/todo-category';

test('create todo category', async ({ page, projectFactory, todoCategoryFactory }) => {
	await projectFactory.factory.goto();

	const projectTitle = 'test';
	const project = await projectFactory.factory.create({
		title: projectTitle,
		description: 'test'
	});

	await todoCategoryFactory.factory.goto(projectTitle, project.projectId);
	const c1 = await todoCategoryFactory.factory.create({
		title: 'test',
		description: 'test'
	});

	const c2 = await todoCategoryFactory.factory.create({
		title: 'test',
		description: 'test'
	});

	await expect(
		c1.categoryId !== c2.categoryId,
		'event thought the data is the same but category ids should be different'
	).toBeTruthy();

	// check the order

	const categories = await page.locator("div[data-tip='category id'] span.text-info").all();

	await expect(categories, 'two categories should exist').toHaveLength(2);

	await expect(categories[0], 'category order should be from oldest to newest').toHaveText(
		`#${c1.categoryId}`
	);

	await expect(categories[1], 'category order should be from oldest to newest').toHaveText(
		`#${c2.categoryId}`
	);
});

test('update todo category', ({ page }) => {});

test('delete todo category', ({ page }) => {});

test('reorder todo category', ({ page }) => {});

test('toggle category actions', ({ page }) => {});

test('toggle `MARK AS DONE` when there are UNDONE todos', ({ page }) => {});
