<script lang="ts" context="module">
	import Fa from 'svelte-fa';
	import { page } from '$app/stores';

	import { toggleClass } from '$lib/actions';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import type { Snippet } from 'svelte';

	export type Props = {
		name: string;
		href: string;
		icon?: IconDefinition | null;
		setActiveClassOnClick?: boolean;
		class?: string;
		children?: Snippet;
	};
</script>

<script lang="ts">
	const {
		name,
		href,
		icon = null,
		setActiveClassOnClick = true,
		class: className = '',
		children
	}: Props = $props();
</script>

<li class="break-words-legacy max-w-full whitespace-normal break-words">
	<a
		on:click
		class="text-xl normal-case {className}"
		{href}
		use:toggleClass={{
			classes: ['active'],
			isActive: setActiveClassOnClick && $page.url.href.endsWith(href)
		}}
	>
		{#if icon}
			<Fa {icon} />
		{/if}
		{name}
	</a>

	{@render children?.()}
</li>
