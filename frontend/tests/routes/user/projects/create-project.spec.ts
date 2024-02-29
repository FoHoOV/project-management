import { expect } from '@playwright/test';
import { projects as test } from '../../fixtures/project';

test('create a project', async ({ projectFactory }) => {
	projectFactory.factory.goto();

	// expect creating projects from templates to work
	const p1 = await projectFactory.factory.create({
		title: 'test me daddy',
		description: 'i love descriptions',
		createFromDefaultTemplate: true
	});

	await expect(p1.projectId).toBeGreaterThan(0);

	// expect creating projects without templates to work
	const p2 = await projectFactory.factory.create({
		title: 'test me daddy',
		description: 'i love descriptions but without default template tho',
		createFromDefaultTemplate: false
	});

	await expect(p2.projectId).toBeGreaterThan(0);
	await expect(p2.projectId).not.toEqual(p1.projectId);
});
