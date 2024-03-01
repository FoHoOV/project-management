import { expect } from '@playwright/test';
import { test } from '../../../fixtures/todo-category';

test('create todo category', async ({ enhancedPage, projectFactory, todoCategoryFactory }) => {
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

	const categories = await enhancedPage.locator("div[data-tip='category id'] span.text-info").all();

	await expect(categories, 'two categories should exist').toHaveLength(2);

	await expect(categories[0], 'category order should be from oldest to newest').toHaveText(
		`#${c1.categoryId}`
	);

	await expect(categories[1], 'category order should be from oldest to newest').toHaveText(
		`#${c2.categoryId}`
	);
});

test('update todo category', async ({ enhancedPage, projectFactory, todoCategoryFactory }) => {
	await projectFactory.factory.goto();

	const projectTitle = 'test';
	const project = await projectFactory.factory.create({
		title: projectTitle,
		description: 'test'
	});

	await todoCategoryFactory.factory.goto(projectTitle, project.projectId);
	const c1 = await todoCategoryFactory.factory.create({
		title: 'test1',
		description: 'test1'
	});

	const c2 = await todoCategoryFactory.factory.create({
		title: 'test2',
		description: 'test2'
	});

	await todoCategoryFactory.factory.edit({
		categoryId: c1.categoryId,
		title: 'new title1',
		description: 'new description1'
	});

	await todoCategoryFactory.factory.edit({
		categoryId: c2.categoryId,
		title: 'new title2',
		description: 'new description2'
	});

	// check the order after update
	const categories = await enhancedPage.locator("div[data-tip='category id'] span.text-info").all();

	await expect(categories, 'two categories should exist').toHaveLength(2);

	await expect(categories[0], 'category order should be from oldest to newest').toHaveText(
		`#${c1.categoryId}`
	);

	await expect(categories[1], 'category order should be from oldest to newest').toHaveText(
		`#${c2.categoryId}`
	);
});

test('delete todo category', async ({ enhancedPage, projectFactory, todoCategoryFactory }) => {
	await projectFactory.factory.goto();

	const projectTitle = 'test';
	const project = await projectFactory.factory.create({
		title: projectTitle,
		description: 'test'
	});

	await todoCategoryFactory.factory.goto(projectTitle, project.projectId);
	const c1 = await todoCategoryFactory.factory.create({
		title: 'test1',
		description: 'test1'
	});

	const c2 = await todoCategoryFactory.factory.create({
		title: 'test2',
		description: 'test2'
	});

	await todoCategoryFactory.factory.delete(c1.categoryId);

	// after 1 deletion only category should exist
	await expect(
		await enhancedPage.locator("div[data-tip='category id'] span.text-info").all(),
		'after 1 deletion only category should exist'
	).toHaveLength(1);

	await todoCategoryFactory.factory.delete(c2.categoryId);

	// after 2 deletions only no categories should exist
	await expect(
		await enhancedPage.locator("div[data-tip='category id'] span.text-info").all(),
		'after 2 deletions only no categories should exist'
	).toHaveLength(0);
});

test('reorder todo category', ({ enhancedPage }) => {});

test('toggle `MARK AS DONE` when there are UNDONE todos', ({ enhancedPage }) => {});
