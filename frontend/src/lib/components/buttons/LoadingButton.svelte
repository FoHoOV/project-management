<script lang="ts" context="module">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type Props = {
		text: string;
		loading?: boolean;
	} & Partial<Exclude<HTMLButtonAttributes, 'text'>>;
</script>

<script lang="ts">
	const {
		text,
		loading = false,
		type = 'button',
		class: className = '',
		...restProps
	}: Props = $props();
</script>

<button
	class="btn disabled:cursor-not-allowed {className}"
	disabled={loading}
	{type}
	{...restProps}
>
	{#if loading}
		<span class="loading loading-dots loading-sm"></span>
	{:else}
		{text}
	{/if}
</button>
