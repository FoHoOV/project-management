<script lang="ts" context="module">
	export type Props = {
		text: string;
		loading?: boolean;
		type?: 'submit' | 'button';
		class?: string;
	};
</script>

<script lang="ts">
	const { text, loading = false, type = 'button', class: className = '' }: Props = $props();
</script>

<button on:click class="btn disabled:cursor-not-allowed {className}" disabled={loading} {type}>
	{#if loading}
		<span class="loading loading-dots loading-sm" />
	{:else}
		{text}
	{/if}
</button>
