<script lang="ts">
	import Alert from '$components/Alert.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	export let name: string;
	export let label: string = name;
	export let errors: string | string[] | null | undefined | (string | null)[];
	export let hideLabel: boolean = false;
	export let type: HTMLInputAttributes['type'] | 'text-area' = 'text';
	export let value:
		| string
		| number
		| (typeof type extends 'text-area' ? never : boolean)
		| undefined = '';
	export let autoFocus: boolean | null = null;
	export let autoComplete: HTMLInputAttributes['autocomplete'] | null = null;
	export { wrapperClasses as class };
	export { inputClasses as inputClasses };

	let wrapperClasses: string = '';
	let inputClasses: string = '';

	let input: HTMLInputElement | HTMLTextAreaElement;

	export function focus() {
		input.focus();
	}
</script>

<div class="flex flex-col {wrapperClasses}">
	{#if !hideLabel}
		<label class="label" class:hidden={hideLabel} for={name}>
			<span class="label-text">{label}</span>
		</label>
	{/if}

	{#if type == 'text-area'}
		<!-- svelte-ignore a11y-autofocus -->
		<textarea
			bind:this={input}
			id={name}
			{name}
			autocomplete={autoComplete}
			placeholder={label}
			class="textarea w-full {inputClasses}"
			value={value?.toString()}
			autofocus={autoFocus}
		/>
	{:else}
		<!-- svelte-ignore a11y-autofocus -->
		<input
			bind:this={input}
			{type}
			autocomplete={autoComplete}
			id={name}
			{name}
			placeholder={label}
			class="input input-bordered w-full {inputClasses}"
			{value}
			autofocus={autoFocus}
		/>
	{/if}

	<Alert type="error" message={typeof errors === 'string' ? errors : errors?.at(0)} class="mt-2" />
</div>
