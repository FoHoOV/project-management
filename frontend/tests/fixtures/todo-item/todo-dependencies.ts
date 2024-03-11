import { expect, type Locator } from '@playwright/test';
import { closeModal, getModal } from '../../common-locators/modal';
import { waitForSpinnerStateToBeIdle } from '../../common-locators/spinner';
import type { EnhancedPage } from '../enhanced-page';
import type { TodoItemHelpers, TodoItemPage } from './todo-item';
import { getConfirmAcceptButton } from '../../common-locators/confirm';

export class TodoDependencyPage {
	constructor(
		private enhancedPage: EnhancedPage,
		private todoItemUtils: { page: TodoItemPage; helpers: TodoItemHelpers }
	) {}

	async create({ dependencyId, todoId }: { dependencyId: number; todoId?: number | string }) {
		if (!todoId) {
			todoId = (await this.todoItemUtils.helpers.createTodoItem()).todoId;
		}

		const todoItem = await this.todoItemUtils.page.getTodoItemLocatorById(todoId);
		await todoItem.scrollIntoViewIfNeeded();

		const dependenciesCounterBeforeUpdate = parseInt(
			await (await this.todoItemUtils.page.getManageDependenciesIndicator(todoId)).innerText()
		);

		(await this.todoItemUtils.page.getManageDependenciesButton(todoId)).click();
		const modal = await getModal(this.enhancedPage, true);
		await waitForSpinnerStateToBeIdle(modal);

		await modal.getByRole('button', { name: 'add' }).click();
		await expect(modal).toContainText('Add todo dependencies here');

		await modal.getByPlaceholder('depends on (todo id)').focus();
		await modal.getByPlaceholder('depends on (todo id)').fill(dependencyId.toString());
		await modal.getByRole('button', { name: 'add', exact: true }).click();
		await modal
			.locator('div[role="alert"]', { hasText: 'Todo dependency added' })
			.waitFor({ state: 'visible' });

		await closeModal(modal);

		const dependenciesCounterAfterUpdate = parseInt(
			await (await this.todoItemUtils.page.getManageDependenciesIndicator(todoId)).innerText()
		);

		expect(dependenciesCounterBeforeUpdate).toEqual(dependenciesCounterAfterUpdate - 1);
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param dependencyId - locator should have a text that contains `dependencyId`
	 */

	async delete(locator: Locator, dependencyId: number) {
		const dependency = await this.getWrapper(locator, dependencyId);

		await (await this.getDeleteButton(locator, dependencyId)).click();

		await getConfirmAcceptButton(dependency).click();
		await waitForSpinnerStateToBeIdle(await getModal(this.enhancedPage));
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param dependencyId - locator should have a text that contains `dependencyId`
	 */
	async getWrapper(locator: Locator, dependencyId: number) {
		const wrapper = await locator
			.locator("div[data-testid='todo-dependency-wrapper']", { hasText: `#${dependencyId}` })
			.all();

		expect(wrapper, 'wrapper resolved to many/none dependencies').toHaveLength(1);

		return wrapper[0];
	}

	async open(todoId: number | string) {
		await (await this.todoItemUtils.page.getManageDependenciesButton(todoId)).click();
		const modal = await getModal(this.enhancedPage);
		await waitForSpinnerStateToBeIdle(modal);
	}

	/**
	 * @param locator - search will be relative to this locator
	 * @param dependencyId - locator should have a text that contains `dependencyId`
	 */
	async getDeleteButton(locator: Locator, dependencyId: number) {
		const deleteBtn = (await this.getWrapper(locator, dependencyId)).getByTestId(
			'todo-dependency-delete'
		);

		return deleteBtn;
	}

	async getTodoDependencyIds(locator: Locator) {
		const texts = (await locator.getByTestId('todo-dependency-text').all()).map(async (element) => {
			const content = await element.textContent({ timeout: 500 });
			if (!content) {
				throw new Error('content was null for id');
			}
			return parseInt(content.trim().split('#')[1]);
		});

		return Promise.all(texts);
	}
}
