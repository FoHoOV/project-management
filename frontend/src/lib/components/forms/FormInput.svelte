<script lang="ts" context="module">
	export type Props = (
		| {
				type?: 'text-area';
				value?: string | number | undefined;
		  }
		| {
				type?: HTMLInputAttributes['type'];
				value?: string | boolean | number | undefined;
		  }
	) & {
		name: string;
		label?: string;
		errors?: string | string[] | null | undefined | (string | null)[];
		hideLabel?: boolean;
		autoFocus?: boolean;
		pattern?: HTMLInputAttributes['pattern'];
		autoComplete?: HTMLInputAttributes['autocomplete'] | null;
		wrapperClasses?: string;
		inputClasses?: string;
	};
</script>

<script lang="ts">
	import Alert from '$components/Alert.svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	const {
		name,
		value = '',
		label = name,
		errors = null,
		hideLabel = false,
		type = '',
		autoFocus = null,
		autoComplete = null,
		pattern = null,
		wrapperClasses = '',
		inputClasses = ''
	} = $props<Props>();

	let input = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

	export function focus() {
		input?.focus();
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
			{pattern}
		/>
	{/if}

	<Alert type="error" message={typeof errors === 'string' ? errors : errors?.at(0)} class="mt-2" />
</div>
