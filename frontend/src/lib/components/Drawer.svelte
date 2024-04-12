<script lang="ts" context="module">
	import Navbar from '$components/navbar/Navbar.svelte';
	import Fa from 'svelte-fa';

	import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons';
	import { drawer } from '$lib/stores/drawer';
	import type { Snippet } from 'svelte';

	export type SnippetParams = [{ closeDrawer: () => void }];

	export type Props = {
		id: string;
		navbarTitle?: string;
		navbarTitleHref?: string;
		navbarStart?: Snippet<SnippetParams>;
		navbarCenter?: Snippet<SnippetParams>;
		navbarEnd?: Snippet<SnippetParams>;
		sidebar?: Snippet<SnippetParams>;
		content?: Snippet<SnippetParams>;
	};
</script>

<script lang="ts">
	const {
		id,
		navbarTitle = '',
		navbarTitleHref = '',
		navbarStart,
		navbarCenter,
		navbarEnd,
		sidebar,
		content
	}: Props = $props();

	let showDrawer = $state<boolean>(false);

	function closeDrawer() {
		showDrawer = false;
	}
</script>

<div class="drawer lg:drawer-open">
	<input {id} type="checkbox" bind:checked={showDrawer} class="drawer-toggle" />
	<div class="drawer-content z-40 flex h-[100vh] flex-col">
		<Navbar title={navbarTitle} titleHref={navbarTitleHref}>
			{#snippet start()}
				<div class="flex-none lg:hidden">
					<label for="app-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
						<Fa icon={faBarsStaggered} />
					</label>
				</div>
				{@render navbarStart?.({ closeDrawer })}
			{/snippet}

			{#snippet center()}
				{@render navbarCenter?.({ closeDrawer })}
			{/snippet}

			{#snippet end()}
				{#each drawer.navbar.end as snippet}
					{@render snippet({ closeDrawer })}
				{/each}
				{@render navbarEnd?.({ closeDrawer })}
			{/snippet}
		</Navbar>
		{@render content?.({ closeDrawer })}
	</div>
	<div class="drawer-side z-40 lg:!z-10 lg:p-2">
		<label for={id} aria-label="close sidebar" class="drawer-overlay"></label>
		<ul
			class="menu box-border min-h-full w-80 rounded-md bg-base-300 bg-opacity-90 p-4 text-base-content backdrop-blur transition-shadow lg:shadow-2xl"
		>
			{@render sidebar?.({ closeDrawer })}
		</ul>
	</div>
</div>
