<script lang="ts" module>
	import Alert from '$components/alerts/Alert.svelte';

	import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';

	export type Props = (
		| ({
				type?: 'text-area';
				value?: string | number | undefined;
		  } & Partial<Exclude<HTMLInputAttributes, 'class' | 'placeholder' | 'id'>>)
		| ({
				type?: HTMLInputAttributes['type'] | 'toggle';
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
	}: Props = $props();

	export function focus() {
		input?.focus();
	}

	export function inputElement() {
		return input;
	}

	let input = $state<HTMLInputElement | HTMLTextAreaElement | null>(null);

	let errorMessage = $derived.by(() => {
		if (typeof errors === 'string') {
			return new String(errors);
		} else {
			return errors?.at?.(0) ? new String(errors[0]) : null;
		}
	});

	const defaultInputClasses = $derived.by(() => {
		if (type == 'checkbox') {
			return 'checkbox';
		} else if (type == 'text-area') {
			return 'textarea w-full';
		} else if (type == 'toggle') {
			return 'toggle';
		} else {
			return 'input input-bordered w-full';
		}
	});
</script>

<div class="flex flex-col {wrapperClasses}">
	<label
		class="flex items-start {labelClasses} {type == 'checkbox' || type == 'toggle'
			? 'max-w-full cursor-pointer flex-row items-center justify-between gap-2 rounded-md p-2'
			: 'flex-col'}"
		for={restProps.id}
	>
		{#if !hideLabel}
			<p class="label label-text">{label}</p>
		{/if}
		{#if type == 'text-area'}
			<textarea
				bind:this={input}
				id={restProps.id}
				{name}
				placeholder={label}
				class="{defaultInputClasses} {inputClasses}"
				value={value?.toString()}
				{...restProps as HTMLTextareaAttributes}
			></textarea>
		{:else}
			<input
				bind:this={input}
				type={type == 'toggle' ? 'checkbox' : type}
				id={restProps.id}
				{name}
				placeholder={label}
				class="{defaultInputClasses} {inputClasses}"
				{value}
				{...restProps}
			/>
		{/if}
	</label>

	<Alert type="error" message={errorMessage} class="mt-2" />
</div>
