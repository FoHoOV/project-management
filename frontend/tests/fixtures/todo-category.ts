import { expect } from '@playwright/test';
import type { IPage } from './IPage';
import { generateTodoListUrl } from '../../src/lib/utils/params/route';
import { ProjectsPage, test as projects } from './project';
import { getModal, closeModal } from '../common-locators/modal';
import { getFloatingBtn } from '../common-locators/floating-btn';
import { dragAndDropTo, waitForAnimationEnd, type EnhancedPage } from './test';
import { getConfirmAcceptButton } from '../common-locators/confirm';
import { waitForSpinnerStateToBeIdle } from '../common-locators/spinner';
import crypto from 'crypto';

export class TodoCategoryPage implements IPage {
	#enhancedPage: EnhancedPage;

	constructor(enhancedPage: EnhancedPage) {
		this.#enhancedPage = enhancedPage;
	}

	async goto(projectTitle: string, projectId: number, projectShouldExist = true) {
		const response = await this.#enhancedPage.goto(generateTodoListUrl(projectTitle, projectId));
		if (projectShouldExist) {
			expect(response, 'response should exist').toBeTruthy();
			expect(response!.status() == 200, 'todo category page should exist').toBeTruthy();
		}
	}

	async create({ title, description }: { title: string; description?: string }) {
		await (await this.getCreateButton()).click();

		const modal = await getModal(this.#enhancedPage);

		// fill in the data
		await modal.getByPlaceholder('title').fill(title);
		await modal.getByPlaceholder('title').press('Tab');
		description && (await modal.getByPlaceholder('description (Optional)').fill(description));
		await modal.getByRole('button', { name: 'create' }).click();
		await expect(modal.getByRole('alert')).toContainText('Todo category created');

		// close the modal
		await closeModal(modal);

		// find the created category
		const createdTodoCategory = this.#enhancedPage
			.locator('div.relative.flex.h-full.w-full.rounded-xl', {
				has: this.#enhancedPage.getByText(title)
			})
			.locator("div[data-tip='category id'] span.text-info")
			.last(); // since its ordered from oldest to newest, then the newest one should be at the end

		await expect(
			createdTodoCategory,
			'created todo category should be present on the page'
		).toHaveCount(1);

		const createdTodoCategoryId = parseInt((await createdTodoCategory.innerText()).split('#')[1]);
		const targetCategory = await this.getCategoryLocatorById(createdTodoCategoryId);
		await expect(
			targetCategory.getByTestId('category-info'),
			'selected category should contain the created id'
		).toContainText(`#${createdTodoCategoryId}`);
		await expect(
			targetCategory.getByTestId('category-info'),
			'selected category should contain the  title'
		).toContainText(title);
		await expect(
			targetCategory.getByTestId('category-info'),
			'selected category should be contain the description'
		).toContainText(description ?? '-');

		return {
			categoryId: createdTodoCategoryId
		};
	}

	async edit({
		categoryId,
		title,
		description
	}: {
		categoryId: number | string;
		title: string;
		description?: string;
	}) {
		const targetCategory = await this.getCategoryLocatorById(categoryId);

		await (await this.getEditButton(categoryId)).click();

		const modal = await getModal(this.#enhancedPage);

		// fill in the data
		await modal.getByPlaceholder('title').fill(title);
		await modal.getByPlaceholder('title').press('Tab');
		description && (await modal.getByPlaceholder('description (Optional)').fill(description));
		await modal.getByRole('button', { name: 'edit' }).click();

		// successful message should exist
		await expect(modal.getByRole('alert'), 'edit successful message should exist').toContainText(
			'Todo category edited'
		);

		// close the modal
		await closeModal(modal);

		await expect(
			targetCategory.getByTestId('category-info'),
			'selected category should contain the provided id'
		).toContainText(`#${categoryId}`);
		await expect(
			targetCategory.getByTestId('category-info'),
			'selected category should be updated to the new title'
		).toContainText(title);
		await expect(
			targetCategory.getByTestId('category-info'),
			'selected category should be updated to the new description'
		).toContainText(description ?? '-');
	}

	async delete(categoryId: number | string) {
		const category = await this.getCategoryLocatorById(categoryId);
		await (await this.getDeleteButton(categoryId)).click();
		await getConfirmAcceptButton(category).click();
		await category.waitFor({ state: 'detached' });
	}

	async dragAndDrop(
		fromCategoryId: string | number,
		targetCategoryId: string | number,
		direction: 'right' | 'left'
	) {
		const currentCategory = await this.getCategoryLocatorById(fromCategoryId);
		const targetCategory = await this.getCategoryLocatorById(targetCategoryId);

		await dragAndDropTo({
			page: this.#enhancedPage,
			from: currentCategory,
			to: targetCategory,
			offsetFromCenter: direction == 'right' ? { x: 5, y: 0 } : { x: -5, y: 0 },
			steps: 10 // but like this is a lucky guess :|
		});

		await expect(
			targetCategory.getByRole('alert'),
			'no errors should have occurred'
		).not.toBeVisible();

		await waitForSpinnerStateToBeIdle(targetCategory);
		await waitForAnimationEnd(currentCategory);
		await waitForAnimationEnd(targetCategory);
	}

	async getCategoryLocatorById(id: number | string) {
		const category = await this.#enhancedPage
			.locator("div[data-testid='todo-category-wrapper']", {
				has: this.#enhancedPage.getByTestId('category-info').locator('span', { hasText: `#${id}` })
			})
			.all();

		expect(category, 'only one category with this id should exist on the page').toHaveLength(1);

		return category[0];
	}

	async getDeleteButton(id: number | string) {
		const category = await this.getCategoryLocatorById(id);
		return category.getByTestId('delete-category');
	}

	async getUpdateActionsButton(id: number | string) {
		const category = await this.getCategoryLocatorById(id);
		return category.getByTestId('update-category-actions');
	}

	async getEditButton(id: number | string) {
		const category = await this.getCategoryLocatorById(id);
		return category.getByTestId('edit-category');
	}

	async getCreateButton() {
		return await getFloatingBtn(this.#enhancedPage);
	}

	async getAddTodoItemButton(id: number | string) {
		const category = await this.getCategoryLocatorById(id);
		return category.getByRole('button', { name: 'Add todo' });
	}

	async getAttachToProjectButton(id: number | string) {
		const category = await this.getCategoryLocatorById(id);
		return category.getByRole('button', { name: 'Attach to project' });
	}

	async getCategoryIds() {
		const elements = await this.#enhancedPage
			.getByTestId('category-info')
			.locator("div[data-tip='category id'] span.text-info")
			.all();
		const ids: number[] = [];

		for (let i = 0; i < elements.length; i++) {
			ids.push(parseInt((await elements[i].innerText()).trim().split('#')[1]));
		}

		return ids;
	}
}

export class TodoCategoryHelpers {
	#enhancedPage: EnhancedPage;
	#projectsPage: ProjectsPage;
	#todoCategoryPage: TodoCategoryPage;

	constructor(
		enhancedPage: EnhancedPage,
		projectsPage: ProjectsPage,
		todoCategoryPage: TodoCategoryPage
	) {
		this.#enhancedPage = enhancedPage;
		this.#projectsPage = projectsPage;
		this.#todoCategoryPage = todoCategoryPage;
	}

	async createCategory(existingProject?: { projectId: number; projectTitle: string }) {
		await this.#projectsPage.goto();

		let createdProject: { projectId: number; projectTitle: string };

		if (!existingProject) {
			const projectTitle = `test${crypto.getRandomValues(new Uint32Array(1)).join('')}`;
			const projectId = (
				await this.#projectsPage.create({
					title: projectTitle,
					description: 'test'
				})
			).projectId;

			createdProject = { projectId, projectTitle };
		} else {
			createdProject = existingProject;
		}

		await this.#todoCategoryPage.goto(createdProject.projectTitle, createdProject.projectId);

		const categoryTitle = `title-${crypto.randomUUID()}`;
		const categoryDesc = `desc-${crypto.randomUUID()}`;
		const createdCategory = await this.#todoCategoryPage.create({
			title: categoryTitle,
			description: categoryDesc
		});
		return { categoryId: createdCategory.categoryId, categoryTitle, categoryDesc };
	}
}

export const test = projects.extend<{
	todoCategoryUtils: { page: TodoCategoryPage; helpers: TodoCategoryHelpers };
}>({
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	todoCategoryUtils: async ({ enhancedPage, projectUtils }, use) => {
		// I have to include auth because we need to be authenticated to use this page

		const todoCategoryPage = new TodoCategoryPage(enhancedPage);
		await use({
			page: todoCategoryPage,
			helpers: new TodoCategoryHelpers(enhancedPage, projectUtils.page, todoCategoryPage)
		});
	}
});
