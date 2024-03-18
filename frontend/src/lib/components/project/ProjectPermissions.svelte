<script lang="ts" context="module">
	import FormInput from '$components/forms/FormInput.svelte';

	import { Permission } from '$lib';
	import { onMount } from 'svelte';

	import { Set } from 'svelte/reactivity';

	export type Events = {
		onChange?: (permissions: Set<Permission>) => void;
	};

	export type Props = {
		preCheckedPermissions?: Permission[];
	} & Events;
</script>

<script lang="ts">
	const { preCheckedPermissions, onChange }: Props = $props();

	let allowAllAccessRights = $state<boolean>();
	let allowedPermissions = $state<Set<Permission>>(new Set());

	export const selectedPermissions = $derived(allowedPermissions);

	export function reset() {
		setInitValues();
	}

	function setInitValues() {
		allowAllAccessRights = preCheckedPermissions?.indexOf(Permission.All) != -1 ? true : false;
		allowedPermissions = preCheckedPermissions
			? new Set(preCheckedPermissions)
			: null ?? new Set([Permission.All]);
	}

	onMount(() => {
		setInitValues();
	});
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
	onchange={(e)=>{
        allowAllAccessRights = (e.target as HTMLInputElement).checked;
		if (allowAllAccessRights) {
			allowedPermissions = new Set([Permission.All]);
		} else {
			allowedPermissions.delete(Permission.All);
		}
		onChange?.(allowedPermissions);
    }}
></FormInput>
<div class="grid grid-cols-1 gap-2 lg:grid-cols-2" class:hidden={allowAllAccessRights}>
	{#key allowedPermissions}
		{#each Object.values(Permission).filter((value) => value !== Permission.All) as permission}
			<FormInput
				name="permissions[]"
				value={permission}
				label={permission.replaceAll('_', ' ')}
				type="checkbox"
				disabled={allowAllAccessRights ? true : null}
				inputClasses="checkbox-warning"
				labelClasses="border border-info"
				onchange={(e)=>{
					if ((e.target as HTMLInputElement).checked) {
						allowedPermissions.add(permission)
					} else {
						allowedPermissions.delete(permission);
					}
					onChange?.(allowedPermissions);
				}}
				checked={allowedPermissions.has(permission) ? true : null}
			></FormInput>
		{/each}
	{/key}
</div>
