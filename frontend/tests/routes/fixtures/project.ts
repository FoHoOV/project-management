import { test as auth } from './access-token';
import { type Page } from '@playwright/test';

class ProjectLocators {
	#page: Page;

	constructor(page: Page) {
		this.#page = page;
	}

	goto() {
		this.#page.goto('/user/projects');
	}

	create() {}

	edit() {}
}

auth.extend<{ projectFactory: { factory: ProjectLocators } }>({
	projectFactory: async ({ page }, use) => {
		await use({ factory: new ProjectLocators(page) });
	}
});
