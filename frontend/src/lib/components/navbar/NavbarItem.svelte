<script lang="ts" context="module">
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
	import { page } from '$app/stores';
	import { toggleClass } from '$lib/actions';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import type { Snippet } from 'svelte';
	import Fa from 'svelte-fa';

	const {
		name,
		href,
		icon = null,
		setActiveClassOnClick = true,
		class: className = '',
		children
	} = $props<Props>();
</script>

<li class="break-words-legacy max-w-full whitespace-normal break-words">
	<a
		on:click
		class="text-xl normal-case {className}"
		{href}
		use:toggleClass={{
			classes: ['active'],
			activateClasses: setActiveClassOnClick && $page.url.href.endsWith(href)
		}}
	>
		{#if icon}
			<Fa {icon} />
		{/if}
		{name}
	</a>
	
	{#if children}
		{@render children()}
	{/if}
</li>
