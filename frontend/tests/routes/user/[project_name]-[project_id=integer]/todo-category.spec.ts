import { expect } from '@playwright/test';
import { test } from '../../../fixtures/todo-category';

test('create todo category', async ({ projectUtils, todoCategoryUtils }) => {
	await projectUtils.page.goto();

	const projectTitle = 'test';
	const project = await projectUtils.page.create({
		title: projectTitle,
		description: 'test'
	});

	await todoCategoryUtils.page.goto(projectTitle, project.projectId);
	const c1 = await todoCategoryUtils.page.create({
		title: 'test',
		description: 'test'
	});

	const c2 = await todoCategoryUtils.page.create({
		title: 'test',
		description: 'test'
	});

	expect(
		c1.categoryId !== c2.categoryId,
		'event thought the data is the same but category ids should be different'
	).toBeTruthy();

	// check the order

	const categories = await todoCategoryUtils.page.getCategoryIds();

	expect(categories, 'two categories should exist').toHaveLength(2);

	expect(categories[0], 'category order should be from oldest to newest').toEqual(c1.categoryId);

	expect(categories[1], 'category order should be from oldest to newest').toEqual(c2.categoryId);
});

test('update todo category', async ({ projectUtils, todoCategoryUtils }) => {
	await projectUtils.page.goto();

	const projectTitle = 'test';
	const project = await projectUtils.page.create({
		title: projectTitle,
		description: 'test'
	});

	await todoCategoryUtils.page.goto(projectTitle, project.projectId);
	const c1 = await todoCategoryUtils.page.create({
		title: 'test1',
		description: 'test1'
	});

	const c2 = await todoCategoryUtils.page.create({
		title: 'test2',
		description: 'test2'
	});

	await todoCategoryUtils.page.edit({
		categoryId: c1.categoryId,
		title: 'new title1',
		description: 'new description1'
	});

	await todoCategoryUtils.page.edit({
		categoryId: c2.categoryId,
		title: 'new title2',
		description: 'new description2'
	});

	// check the order after update
	const categoryIds = await todoCategoryUtils.page.getCategoryIds();

	expect(categoryIds, 'two categories should exist').toHaveLength(2);

	expect(categoryIds[0], 'category order should be from oldest to newest').toEqual(c1.categoryId);

	expect(categoryIds[1], 'category order should be from oldest to newest').toEqual(c2.categoryId);
});

test('delete todo category', async ({ projectUtils, todoCategoryUtils }) => {
	await projectUtils.page.goto();

	const projectTitle = 'test';
	const project = await projectUtils.page.create({
		title: projectTitle,
		description: 'test'
	});

	await todoCategoryUtils.page.goto(projectTitle, project.projectId);
	const c1 = await todoCategoryUtils.page.create({
		title: 'test1',
		description: 'test1'
	});

	const c2 = await todoCategoryUtils.page.create({
		title: 'test2',
		description: 'test2'
	});

	await todoCategoryUtils.page.delete(c1.categoryId);

	// after 1 deletion only category should exist
	expect(
		await todoCategoryUtils.page.getCategoryIds(),
		'after 1 deletion only category should exist'
	).toHaveLength(1);

	await todoCategoryUtils.page.delete(c2.categoryId);

	// after 2 deletions only no categories should exist
	expect(
		await todoCategoryUtils.page.getCategoryIds(),
		'after 2 deletions only no categories should exist'
	).toHaveLength(0);
});

test('reorder todo category', async ({ projectUtils, todoCategoryUtils }) => {
	await projectUtils.page.goto();

	const projectTitle = 'test';
	const project = await projectUtils.page.create({
		title: projectTitle,
		description: 'test'
	});

	await todoCategoryUtils.page.goto(projectTitle, project.projectId);
	const c1 = await todoCategoryUtils.page.create({
		title: 'test1',
		description: 'test1'
	});

	const c2 = await todoCategoryUtils.page.create({
		title: 'test2',
		description: 'test2'
	});

	const c3 = await todoCategoryUtils.page.create({
		title: 'test3',
		description: 'test3'
	});

	const idsBeforeAtStart = await todoCategoryUtils.page.getCategoryIds();
	expect(
		idsBeforeAtStart[0] == c1.categoryId &&
			idsBeforeAtStart[1] == c2.categoryId &&
			idsBeforeAtStart[2] == c3.categoryId,
		`should be ${c1.categoryId} ${c2.categoryId} ${c3.categoryId}, got: ${JSON.stringify(idsBeforeAtStart)}`
	).toBeTruthy();

	await todoCategoryUtils.page.dragAndDrop(c3.categoryId, c2.categoryId, 'left');
	const idsAfter3MovedBefore2 = await todoCategoryUtils.page.getCategoryIds();
	expect(
		idsAfter3MovedBefore2[0] == c1.categoryId &&
			idsAfter3MovedBefore2[1] == c3.categoryId &&
			idsAfter3MovedBefore2[2] == c2.categoryId,
		`should be ${c1.categoryId} ${c3.categoryId} ${c2.categoryId}, got: ${JSON.stringify(idsAfter3MovedBefore2)}`
	).toBeTruthy();

	// I expect no change here
	await todoCategoryUtils.page.dragAndDrop(c3.categoryId, c1.categoryId, 'right');
	const idsAfter3MovedAfter1 = await todoCategoryUtils.page.getCategoryIds();
	expect(
		idsAfter3MovedAfter1[0] == c1.categoryId &&
			idsAfter3MovedAfter1[1] == c3.categoryId &&
			idsAfter3MovedAfter1[2] == c2.categoryId,
		`should be ${c1.categoryId} ${c3.categoryId} ${c2.categoryId}, got: ${JSON.stringify(idsAfter3MovedAfter1)}`
	).toBeTruthy();

	await todoCategoryUtils.page.dragAndDrop(c2.categoryId, c1.categoryId, 'left');
	const idsAfter2MovedBefore1 = await todoCategoryUtils.page.getCategoryIds();
	expect(
		idsAfter2MovedBefore1[0] == c2.categoryId &&
			idsAfter2MovedBefore1[1] == c1.categoryId &&
			idsAfter2MovedBefore1[2] == c3.categoryId,
		`should be ${c2.categoryId} ${c1.categoryId} ${c3.categoryId}, got: ${JSON.stringify(idsAfter2MovedBefore1)}`
	).toBeTruthy();

	await todoCategoryUtils.page.dragAndDrop(c3.categoryId, c2.categoryId, 'left');
	const idsAfter3MovedBefore2SecondTime = await todoCategoryUtils.page.getCategoryIds();
	expect(
		idsAfter3MovedBefore2SecondTime[0] == c3.categoryId &&
			idsAfter3MovedBefore2SecondTime[1] == c2.categoryId &&
			idsAfter3MovedBefore2SecondTime[2] == c1.categoryId,
		`should be ${c3.categoryId} ${c2.categoryId} ${c1.categoryId}, got: ${JSON.stringify(idsAfter3MovedBefore2SecondTime)}`
	).toBeTruthy();
});

// TODO:
// test('toggle `MARK AS DONE` when there are UNDONE todos', async () => {});
