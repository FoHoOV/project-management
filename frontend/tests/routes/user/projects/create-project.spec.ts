import { expect } from '@playwright/test';
import { test } from '../../../fixtures/project';

test('create a project', async ({ projectUtils }) => {
	await projectUtils.page.goto();

	// expect creating projects from templates to work
	const p1 = await projectUtils.page.create({
		title: 'test me daddy',
		description: 'i love descriptions',
		createFromDefaultTemplate: true
	});

	expect(p1.projectId).toBeGreaterThan(0);

	// expect creating projects without templates to work
	const p2 = await projectUtils.page.create({
		title: 'test me daddy',
		description: 'i love descriptions but without default template tho',
		createFromDefaultTemplate: false
	});

	expect(p2.projectId).toBeGreaterThan(0);
	expect(p2.projectId).not.toEqual(p1.projectId);
});
