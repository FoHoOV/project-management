import { test } from '../../../fixtures/todo-category';

test('create-delete-create-goto project', async ({ projectUtils, todoCategoryUtils }) => {
	await projectUtils.page.goto();

	const projectTitle = 'p1';
	const p1 = await projectUtils.page.create({
		title: projectTitle
	});

	await projectUtils.page.detach({ projectId: p1.projectId });

	const p2 = await projectUtils.page.create({
		title: projectTitle
	});

	await todoCategoryUtils.page.goto(projectTitle, p2.projectId);
});

test('create-delete-goback project', async ({ enhancedPage, projectUtils, todoCategoryUtils }) => {
	await projectUtils.page.goto();

	const projectTitle = 'p1';
	const p1 = await projectUtils.page.create({
		title: 'p1'
	});

	await projectUtils.page.detach({ projectId: p1.projectId });

	await todoCategoryUtils.page.goto(projectTitle, p1.projectId, false);
});
