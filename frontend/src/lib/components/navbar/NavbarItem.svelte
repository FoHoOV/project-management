<script lang="ts" module>
	import Fa from 'svelte-fa';
	import { page } from '$app/stores';

	import { toggleClass } from '$lib/actions';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	export type Props = {
		name: string;
		href: string;
		icon?: IconDefinition | null;
		setActiveClassOnClick?: boolean;
		class?: string;
		children?: Snippet;
	} & Partial<Omit<HTMLAnchorAttributes, 'class' | 'href'>>;
</script>

<script lang="ts">
	const {
		name,
		href,
		icon = null,
		setActiveClassOnClick = true,
		class: className = '',
		children,
		...restProps
	}: Props = $props();
</script>

<li class="break-words-legacy max-w-full whitespace-normal break-words">
	<a
		class="text-xl normal-case {className}"
		{href}
		use:toggleClass={{
			classes: ['active'],
			isActive: setActiveClassOnClick && $page.url.href.endsWith(href)
		}}
		{...restProps}
	>
		{#if icon}
			<Fa {icon} />
		{/if}
		{name}
	</a>

	{@render children?.()}
</li>
