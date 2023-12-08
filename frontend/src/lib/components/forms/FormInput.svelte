<script lang="ts">
	import Alert from '$components/Alert.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	export let name: string;
	export let label: string = name;
	export let errors: string | string[] | null | undefined | (string | null)[];
	export let hideLabel: boolean = false;
	export let type: HTMLInputAttributes['type'] = 'text';
	export let value: string | number | boolean | undefined = '';
	export let autoFocus: boolean | null = null;
	export { className as class };

	let className: string = '';

	let input: HTMLInputElement;

	export function focus() {
		input.focus();
	}
</script>

<div class="flex flex-col {className}">
	<label class="label" class:hidden={hideLabel} for={name}>
		<span class="label-text">{label}</span>
	</label>
	<!-- svelte-ignore a11y-autofocus -->
	<input
		bind:this={input}
		{type}
		id={name}
		{name}
		placeholder={label}
		class="input input-bordered w-full"
		{value}
		autofocus={autoFocus}
	/>
	<Alert type="error" message={typeof errors === 'string' ? errors : errors?.at(0)} class="mt-2" />
</div>
