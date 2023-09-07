<script lang="ts">
	import Error from '../Error.svelte';

	export let className: string = '';
	export let name: string;
	export let label: string = name;
	export let errors: string | string[] | null | undefined;
	export let hideLabel: boolean = false;
	export let type: 'text' | 'password' | 'hidden' | 'checkbox' = 'text'; // TODO: use the build-in html input type attribute
	export let value: string | number | boolean | undefined = '';
</script>

<div class="flex flex-col {className}">
	<label class="label" class:hidden={hideLabel} for={name}>
		<span class="label-text">{label}</span>
	</label>
	<input {type} id={name} {name} placeholder={label} class="input input-bordered w-full" {value} />
	<Error message={typeof errors === 'string' ? errors : errors?.at(0)} className="mt-2" />
</div>
