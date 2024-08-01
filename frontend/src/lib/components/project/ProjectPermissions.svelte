<script lang="ts" context="module">
	import FormInput from '$components/forms/FormInput.svelte';

	import { Permission } from '$lib';
	import { onMount } from 'svelte';

	import { SvelteSet } from 'svelte/reactivity';

	export type Events = {
		onChange?: (permissions: SvelteSet<Permission>) => void;
	};

	export type Props = {
		preCheckedPermissions?: Permission[];
	} & Events;
</script>

<script lang="ts">
	const { preCheckedPermissions, onChange }: Props = $props();

	let allowAllAccessRights = $state<boolean>();
	let selectedPermissions = $state() as SvelteSet<Permission>;

	export function getSelectedPermissions() {
		return selectedPermissions;
	}

	export function reset() {
		setInitValues();
	}

	function setInitValues() {
		allowAllAccessRights = preCheckedPermissions?.indexOf(Permission.All) != -1 ? true : false;
		selectedPermissions = preCheckedPermissions
			? new SvelteSet(preCheckedPermissions)
			: (null ?? new SvelteSet([Permission.All]));
	}

	setInitValues();
</script>

<FormInput
	name="permissions[]"
	value={Permission.All}
	checked={allowAllAccessRights}
	label="Allow all permissions"
	type="toggle"
	wrapperClasses="mb-2"
	inputClasses="toggle toggle-success"
	labelClasses="border border-info"
	onchange={(e) => {
		allowAllAccessRights = (e.target as HTMLInputElement).checked;
		if (allowAllAccessRights) {
			selectedPermissions = new SvelteSet([Permission.All]);
		} else {
			selectedPermissions.delete(Permission.All);
		}
		onChange?.(selectedPermissions);
	}}
></FormInput>
<div class="grid grid-cols-1 gap-2 lg:grid-cols-2" class:hidden={allowAllAccessRights}>
	{#key selectedPermissions}
		{#each Object.values(Permission).filter((value) => value !== Permission.All) as permission}
			<FormInput
				name="permissions[]"
				value={permission}
				label={permission.replaceAll('_', ' ')}
				type="checkbox"
				disabled={allowAllAccessRights ? true : null}
				inputClasses="checkbox-warning"
				labelClasses="border border-info"
				onchange={(e) => {
					if ((e.target as HTMLInputElement).checked) {
						selectedPermissions.add(permission);
					} else {
						selectedPermissions.delete(permission);
					}
					onChange?.(selectedPermissions);
				}}
				checked={selectedPermissions.has(permission) ? true : null}
			></FormInput>
		{/each}
	{/key}
</div>
