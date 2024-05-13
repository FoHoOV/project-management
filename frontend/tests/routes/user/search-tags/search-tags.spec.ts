import { expect } from '@playwright/test';
import { test } from '../../../fixtures/search-tags';

test('search for tags that exist', async ({ todoItemUtils, searchTagsUtils }) => {
	const t1 = await todoItemUtils.helpers.createTodoItem();

	await todoItemUtils.page.tags.create({
		tag: 'test',
		todoId: t1.todoId
	});

	await searchTagsUtils.page.goto();

	await searchTagsUtils.page.search({
		tagName: 'test'
	});

	await expect(searchTagsUtils.page.getResultsWrapperLocator()).toContainText(`${t1.todoId}`);
});

test("search for tags that don't exist", async ({ searchTagsUtils }) => {
	await searchTagsUtils.page.goto();

	await searchTagsUtils.page.search({
		tagName: 'test'
	});

	await searchTagsUtils.page.expectNotFoundError();
});

test('pressing reset should remove errors and inputs', async ({
	enhancedPage,
	searchTagsUtils
}) => {
	await searchTagsUtils.page.goto();

	await searchTagsUtils.page.search({
		tagName: 'test'
	});

	await searchTagsUtils.page.getResetButton().click();

	await expect(enhancedPage.getByRole('alert')).not.toBeVisible();
	await expect(searchTagsUtils.page.getTagNameInput()).toHaveText('');
	await expect(searchTagsUtils.page.getProjectIdInput()).toHaveText('');
});
