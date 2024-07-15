import { expect } from '@playwright/test';
import { closeModal, getModal } from '../../../../common-locators/modal';
import { test } from '../../../../fixtures/todo-item/todo-item';

test('create a comment', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	await todoItemUtils.page.comments.create({
		comment: 'some comment1',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.create({
		comment: 'some comment2',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.create({
		comment: 'some comment3',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.open(t1.todoId);
	const modal = await getModal(enhancedPage);

	const texts = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(texts).toEqual(['some comment3', 'some comment2', 'some comment1']);
});

test('delete a comment', async ({ enhancedPage, todoItemUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	await todoItemUtils.page.comments.create({
		comment: 'some comment1',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.create({
		comment: 'some comment2',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.create({
		comment: 'some comment3',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.open(t1.todoId);
	const modal = await getModal(enhancedPage);

	await todoItemUtils.page.comments.delete(modal, 'some comment2');
	const step1 = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(step1).toEqual(['some comment3', 'some comment1']);

	await todoItemUtils.page.comments.delete(modal, 'some comment1');
	const step2 = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(step2).toEqual(['some comment3']);

	await todoItemUtils.page.comments.delete(modal, 'some comment3');
	const step3 = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
	expect(step3).toEqual([]);
});

test('switch between comments', async ({
	enhancedPage,
	projectUtils,
	todoCategoryUtils,
	todoItemUtils
}) => {
	const project = await projectUtils.page.create({ title: 'test' });
	const c1 = await todoCategoryUtils.helpers.createCategory({
		projectId: project.projectId,
		projectTitle: project.projectTitle
	});
	const c2 = await todoCategoryUtils.helpers.createCategory({
		projectId: project.projectId,
		projectTitle: project.projectTitle
	});
	const t1 = await todoItemUtils.helpers.createTodoItem(c1.categoryId);
	const t2 = await todoItemUtils.helpers.createTodoItem(c2.categoryId);

	await todoItemUtils.page.comments.create({
		comment: 't1 comment1',
		todoId: t1.todoId
	});

	await todoItemUtils.page.comments.create({
		comment: 't2 comment1',
		todoId: t2.todoId
	});

	await todoItemUtils.page.comments.create({
		comment: 't2 comment2',
		todoId: t2.todoId
	});

	const checkComments = async (todoId: number, texts: string[]) => {
		await todoItemUtils.page.comments.open(todoId);
		const modal = await getModal(enhancedPage);

		const comments = await todoItemUtils.page.comments.getTodoCommentTexts(modal);
		expect(comments).toEqual(texts);
		await closeModal(modal);
	};

	const t1Comments = ['t1 comment1'];
	const t2Comments = ['t2 comment2', 't2 comment1'];
	await checkComments(t1.todoId, t1Comments);
	await checkComments(t2.todoId, t2Comments);
	await checkComments(t2.todoId, t2Comments);
	await checkComments(t1.todoId, t1Comments);
	await checkComments(t1.todoId, t1Comments);
	await checkComments(t2.todoId, t2Comments);
});
