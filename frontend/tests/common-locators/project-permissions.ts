import { expect, type Locator } from '@playwright/test';
import { Permission } from '../../src/lib/generated-client';

export async function getCheckBoxes(locator: Locator) {
	const checkboxesQuery = locator.locator('input[type="checkbox"][name="permissions[]"]');
	await checkboxesQuery.first().waitFor({ state: 'visible', timeout: 1000 });
	const checkboxes = await checkboxesQuery.all();
	expect(checkboxes.length).toBeGreaterThanOrEqual(1);
	return checkboxes;
}

export async function toggleAllPermissions(locator: Locator, on: boolean) {
	const checkboxes = await getCheckBoxes(locator);
	const allPermissions = (
		await Promise.all(
			checkboxes.map(async (checkbox) =>
				(await checkbox.getAttribute('value')) == Permission.All ? checkbox : null
			)
		)
	).filter((checkbox) => checkbox !== null);

	expect(allPermissions.length).toEqual(1);
	expect(allPermissions[0]).not.toBeNull();
	await allPermissions[0]!.setChecked(on);
}

export async function setPermissions(locator: Locator, permissions: Permission[]) {
	const checkboxes = await getCheckBoxes(locator);

	if (permissions.length == 1 && permissions[0] == Permission.All) {
		await toggleAllPermissions(locator, true);
		return;
	}

	await toggleAllPermissions(locator, false);

	await Promise.all(
		checkboxes.map(async (checkbox) => {
			const value = await checkbox.getAttribute('value');
			if (permissions.some((permission) => permission == value)) {
				await checkbox.setChecked(true);
			}
		})
	);

	await expectPermissionsToBeEqual(locator, permissions);
}

export async function getPermissions(locator: Locator): Promise<Permission[]> {
	const checkboxes = await getCheckBoxes(locator);
	const result: Permission[] = [];
	await Promise.all(
		checkboxes.map(async (checkbox) => {
			if (!(await checkbox.isChecked())) {
				return;
			}
			const value = await checkbox.getAttribute('value');
			result.push(value as Permission);
		})
	);
	return result;
}

export async function expectPermissionsToBeEqual(locator: Locator, permissions: Permission[]) {
	expect((await getPermissions(locator)).sort()).toEqual(permissions.sort());
}
