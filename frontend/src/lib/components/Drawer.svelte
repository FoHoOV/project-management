<script lang="ts">
	import Navbar from '$components/navbar/Navbar.svelte';
	import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let id: string;
	export let startDrawerOpened: boolean = false;
	export let navbarTitle: string = '';
	export let navbarTitleHref: string = '';

	let showDrawer = false;

	let closeDrawer = () => {
		showDrawer = false;
	};
</script>

<div class="drawer" class:lg:drawer-open={startDrawerOpened}>
	<input {id} type="checkbox" bind:checked={showDrawer} class="drawer-toggle" />
	<div class="drawer-content z-40 flex h-[100vh] flex-col">
		<Navbar title={navbarTitle} titleHref={navbarTitleHref}>
			<svelte:fragment slot="start">
				<div class="flex-none lg:hidden">
					<label for="app-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
						<Fa icon={faBarsStaggered} />
					</label>
				</div>
				<slot name="drawer-navbar-start" {closeDrawer} />
			</svelte:fragment>
			<svelte:fragment slot="center">
				<slot name="drawer-navbar-center" {closeDrawer} />
			</svelte:fragment>
			<svelte:fragment slot="end">
				<slot name="drawer-navbar-end" {closeDrawer} />
			</svelte:fragment>
		</Navbar>
		<slot name="drawer-content" {closeDrawer} />
	</div>
	<div class="drawer-side z-40 lg:p-2 lg:!z-10">
		<label for={id} aria-label="close sidebar" class="drawer-overlay"></label>
		<ul
			class="menu box-border min-h-full w-80 rounded-md bg-base-300 bg-opacity-90 p-4 text-base-content backdrop-blur transition-shadow lg:shadow-2xl"
		>
			<slot name="drawer-side" {closeDrawer} />
		</ul>
	</div>
</div>
