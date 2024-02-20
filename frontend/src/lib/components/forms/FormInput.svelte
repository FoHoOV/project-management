<script lang="ts" context="module">
	import Alert from '$components/Alert.svelte';
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';

	export type Props = (
		| ({
				type?: 'text-area';
				value?: string | number | undefined;
		  } & Partial<Exclude<HTMLInputAttributes, 'class' | 'placeholder' | 'id'>>)
		| ({
				type?: HTMLInputAttributes['type'];
				value?: string | boolean | number | undefined;
		  } & Partial<Exclude<HTMLInputAttributes, 'type' | 'class' | 'placeholder' | 'id'>>)
	) & {
		name: string;
		label?: string;
		errors?: string | string[] | null | undefined | (string | null)[];
		hideLabel?: boolean;
		wrapperClasses?: string;
		labelClasses?: string;
		inputClasses?: string;
	};
</script>

<script lang="ts">
	const {
		name,
		value = '',
		label = name,
		errors = null,
		hideLabel = false,
		type = '',
		wrapperClasses = '',
		labelClasses = '',
		inputClasses = '',
		...restProps
	} = $props<Props>();

	let input = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

	export function focus() {
		input?.focus();
	}
</script>

<div class="flex flex-col {wrapperClasses}">
	<label
		class="flex items-start {labelClasses} {type == 'checkbox'
			? 'max-w-full cursor-pointer flex-row items-center justify-between gap-2 rounded-md p-3'
			: 'flex-col'}"
		for={name}
	>
		{#if !hideLabel}
			<p class="label label-text">{label}</p>
		{/if}
		{#if type == 'text-area'}
			<textarea
				bind:this={input}
				id={name}
				{name}
				placeholder={label}
				class="textarea w-full {inputClasses}"
				value={value?.toString()}
				{...restProps as HTMLTextareaAttributes}
			/>
		{:else}
			<input
				bind:this={input}
				{type}
				id={name}
				{name}
				placeholder={label}
				class="{type == 'checkbox' ? 'checkbox' : 'input input-bordered w-full'}  {inputClasses}"
				{value}
				{...restProps}
			/>
		{/if}
	</label>

	<Alert type="error" message={typeof errors === 'string' ? errors : errors?.at(0)} class="mt-2" />
</div>
