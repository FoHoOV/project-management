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

	expect(
		c1.categoryId !== c2.categoryId,
		'event thought the data is the same but category ids should be different'
	).toBeTruthy();

	// check the order

	const categories = await enhancedPage.locator("div[data-tip='category id'] span.text-info").all();

	expect(categories, 'two categories should exist').toHaveLength(2);

	await expect(categories[0], 'category order should be from oldest to newest').toHaveText(
		`#${c1.categoryId}`
	);

	await expect(categories[1], 'category order should be from oldest to newest').toHaveText(
		`#${c2.categoryId}`
	);
});

test('update todo category', async ({  projectFactory, todoCategoryFactory }) => {
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
	const categoryIds = await todoCategoryFactory.factory.getCategoryIds();

	expect(categoryIds, 'two categories should exist').toHaveLength(2);

	expect(categoryIds[0], 'category order should be from oldest to newest').toEqual(
		c1.categoryId
	);

	expect(categoryIds[1], 'category order should be from oldest to newest').toEqual(
		c2.categoryId
	);
});

test('delete todo category', async ({  projectFactory, todoCategoryFactory }) => {
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
	expect(
		await todoCategoryFactory.factory.getCategoryIds(),
		'after 1 deletion only category should exist'
	).toHaveLength(1);

	await todoCategoryFactory.factory.delete(c2.categoryId);

	// after 2 deletions only no categories should exist
	expect(
		await todoCategoryFactory.factory.getCategoryIds(),
		'after 2 deletions only no categories should exist'
	).toHaveLength(0);
});

test('reorder todo category', async ({ projectFactory, todoCategoryFactory }) => {
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

	const c3 = await todoCategoryFactory.factory.create({
		title: 'test2',
		description: 'test2'
	});

	const idsBeforeAtStart = await todoCategoryFactory.factory.getCategoryIds();
	expect(
		idsBeforeAtStart.every((current, i) => {
			if (i === idsBeforeAtStart.length - 1) {
				return true;
			}
			return current < idsBeforeAtStart[i + 1];
		}),
		'by default elements should be sorted from oldest to newest'
	).toBeTruthy();

	await todoCategoryFactory.factory.dragAndDrop(c3.categoryId, c2.categoryId, 'left');
	const idsAfter3MovedBefore2 = await todoCategoryFactory.factory.getCategoryIds();
	expect(
		idsAfter3MovedBefore2[0] == c1.categoryId &&
			idsAfter3MovedBefore2[1] == c3.categoryId &&
			idsAfter3MovedBefore2[2] == c2.categoryId,
		'should 1 3 2'
	).toBeTruthy();

	// I expect no change here
	await todoCategoryFactory.factory.dragAndDrop(c3.categoryId, c1.categoryId, 'right');
	const idsAfter3MovedAfter1 = await todoCategoryFactory.factory.getCategoryIds();
	expect(
		idsAfter3MovedAfter1[0] == c1.categoryId &&
			idsAfter3MovedAfter1[1] == c3.categoryId &&
			idsAfter3MovedAfter1[2] == c2.categoryId,
		'should be 1 3 2'
	).toBeTruthy();

	await todoCategoryFactory.factory.dragAndDrop(c2.categoryId, c1.categoryId, 'left');
	const idsAfter2MovedBefore1 = await todoCategoryFactory.factory.getCategoryIds();
	expect(
		idsAfter2MovedBefore1[0] == c2.categoryId &&
			idsAfter3MovedAfter1[1] == c1.categoryId &&
			idsAfter3MovedAfter1[2] == c3.categoryId,
		'should be 2 1 3'
	).toBeTruthy();

	await todoCategoryFactory.factory.dragAndDrop(c3.categoryId, c2.categoryId, 'left');
	const idsAfter3MovedBefore2SecondTime = await todoCategoryFactory.factory.getCategoryIds();
	expect(
		idsAfter3MovedBefore2SecondTime[0] == c3.categoryId &&
		idsAfter3MovedBefore2SecondTime[1] == c2.categoryId &&
		idsAfter3MovedBefore2SecondTime[2] == c1.categoryId,
		'should be 3 2 1'
	).toBeTruthy();
});

test('toggle `MARK AS DONE` when there are UNDONE todos', async ({ enhancedPage }) => {});
