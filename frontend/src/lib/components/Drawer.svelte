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

<div class="drawer {startDrawerOpened ? 'lg:drawer-open' : ''}">
	<input {id} type="checkbox" class="drawer-toggle" />
	<div class="drawer-content flex h-[100vh] flex-col">
		<Navbar title={navbarTitle} titleHref={navbarTitleHref}>
			<svelte:fragment slot="start">
				<div class="flex-none lg:hidden">
					<label for="app-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
						<Fa icon={faBarsStaggered} />
					</label>
				</div>
				<slot name="drawer-navbar-start" />
			</svelte:fragment>
			<svelte:fragment slot="center">
				<slot name="drawer-navbar-center" />
			</svelte:fragment>
			<svelte:fragment slot="end">
				<slot name="drawer-navbar-end" />
			</svelte:fragment>
		</Navbar>
		<slot name="drawer-content" {closeDrawer} />
	</div>
	<div class="drawer-side">
		<label for={id} aria-label="close sidebar" class="drawer-overlay"></label>
		<ul class="menu min-h-full w-80 bg-base-200 p-4">
			<slot name="drawer-side" {closeDrawer} />
		</ul>
	</div>
</div>
