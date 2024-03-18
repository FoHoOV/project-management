import type { IPage } from './IPage';
import type { EnhancedPage } from './enhanced-page';
import { test as todoItemTest } from './/todo-item/todo-item';
export type SearchTagsUtils = {
	page: SearchTagsPage;
};

export class SearchTagsPage implements IPage {
	#enhancedPage: EnhancedPage;

	constructor(enhancedPage: EnhancedPage) {
		this.#enhancedPage = enhancedPage;
	}
	async goto() {
		await this.#enhancedPage.goto('/user/search-tags');
	}

	async search({ tagName, projectId }: { tagName: string; projectId?: number }) {
		await this.#enhancedPage.getByPlaceholder('tag name').click();
		await this.#enhancedPage.getByPlaceholder('tag name').fill(tagName);
		await this.#enhancedPage.getByPlaceholder('tag name').press('Tab');
		projectId && (await this.#enhancedPage.getByPlaceholder('project id (Optional)').fill('1'));
		await this.#enhancedPage.getByRole('button', { name: 'Search' }).click();
	}

	getResultsWrapperLocator() {
		return this.#enhancedPage.getByTestId('search-tags-results-wrapper');
	}

	async expectNotFoundError() {
		await this.#enhancedPage
			.getByRole('alert')
			.filter({
				hasText:
					"tag not found or doesn't belong to user or you don't have the permission to perform the requested action"
			})
			.waitFor({ state: 'visible' });
	}
}

export const test = todoItemTest.extend<{
	searchTagsUtils: SearchTagsUtils;
}>({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	searchTagsUtils: async ({ enhancedPage, authUtils }, use) => {
		await authUtils.login();
		// I have to include auth because we need to be authenticated to use this page
		const searchTags = new SearchTagsPage(enhancedPage);
		await use({
			page: searchTags
		});
	}
});
