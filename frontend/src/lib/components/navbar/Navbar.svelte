<script lang="ts" context="module">
	import DarkModeSwitch from '$components/DarkModeSwitch.svelte';
	import type { Snippet } from 'svelte';

	export type Props = {
		title: string;
		titleHref: string;
		class?: string;
		start?: Snippet;
		center?: Snippet;
		end?: Snippet;
	};
</script>

<script lang="ts">
	const { title, titleHref, class: className = '', start, center, end }: Props = $props();
</script>

<div class="lg:p-2">
	<div
		class="navbar sticky top-0 z-30 flex min-h-16 w-full justify-center rounded-md bg-base-300 bg-opacity-90 text-base-content shadow-xl backdrop-blur transition-shadow duration-100 [transform:translate3d(0,0,0)] {className}"
	>
		<div class="navbar-start">
			{#if start}
				{@render start()}
			{/if}
			<a class="btn btn-ghost text-xl normal-case" href={titleHref}>{title}</a>
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1">
				{#if center}
					{@render center()}
				{/if}
			</ul>
		</div>
		<div class="navbar-end">
			<DarkModeSwitch />
			<ul class="menu px-1">
				{#if end}
					{@render end()}
				{/if}
			</ul>
		</div>
	</div>
</div>
