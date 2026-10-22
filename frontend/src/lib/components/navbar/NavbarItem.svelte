<script lang="ts" module>
	import type { ResolvedPathname } from '$app/types';
	import Fa from 'svelte-fa';
	import { page } from '$app/state';

	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	export type Props = {
		name: string;
		href: ResolvedPathname;
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
		class={[
			'text-xl normal-case',
			className,
			{ active: setActiveClassOnClick && page.url.href.endsWith(href) }
		]}
		{href}
		{...restProps}
	>
		{#if icon}
			<Fa {icon} />
		{/if}
		{name}
	</a>

	{@render children?.()}
</li>
