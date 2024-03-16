<script lang="ts" context="module">
	import FormInput from '$components/forms/FormInput.svelte';

	import { Permission } from '$lib';

	export type Events = {
		onChange?: (permissions: Set<Permission>) => void;
	};

	export type Props = {
		preCheckedPermissions?: Permission[];
	} & Events;
</script>

<script lang="ts">
	const { preCheckedPermissions, onChange }: Props = $props();

	let allowAllAccessRights = $state<boolean>(
		preCheckedPermissions?.indexOf(Permission.All) != -1 ? true : false
	);
	let allowedPermissions = $state<Set<Permission>>(
		preCheckedPermissions ? new Set(preCheckedPermissions) : null ?? new Set([Permission.All])
	);
</script>

<FormInput
	id="permissions:{Permission.All}"
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
		if(allowAllAccessRights) {
			allowedPermissions = new Set([Permission.All]);
			onChange?.(allowedPermissions);
		}
    }}
></FormInput>
<div class="grid grid-cols-1 gap-2 lg:grid-cols-2" class:hidden={allowAllAccessRights}>
	{#each Object.values(Permission).filter((value) => value !== Permission.All) as permission}
		<FormInput
			id="permissions:{permission}"
			name="permissions[]"
			value={permission}
			label={permission.replaceAll('_', ' ')}
			type="checkbox"
			disabled={allowAllAccessRights}
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
			checked={preCheckedPermissions?.find((v) => v == permission) ? true : null}
		></FormInput>
	{/each}
</div>
