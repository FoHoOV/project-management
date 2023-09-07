<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/navbar/Navbar.svelte';
	import NavbarItem from '$lib/components/navbar/NavbarItem.svelte';
	import { navigating, page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	// beforeNavigate(async ({ to, cancel }) => {
	// 	if (browser && isRouteProtected(to?.route.id!) && !$page.data.token) {
	// 		// because if the client-side router kicks in and page does NOT
	// 		// have a page.server.ts which doesn't fire the hooks.server.ts then
	// 		// the an unauthenticated user might see an authenticated page
	// 		// * in form submissions if the action redirects then this is called before invalidateAll
	// 		// doing so might cause the hooks.server.ts to run after beforeNavigation and not set the token to page.data
	// 		cancel();
	// 		await goto('/user/login');
	// 	}
	// });
</script>

<Navbar appName="Todos" href="/user/todos">
	<svelte:fragment slot="start" let:closeDrawer>
		<NavbarItem href="/" name="home" on:click={()=> closeDrawer()} />
	</svelte:fragment>
	<svelte:fragment slot="end">
		{#if data.token}
			<NavbarItem href="/user/logout" name="logout" />
		{:else}
			<NavbarItem href="/login" name="login" />
		{/if}
	</svelte:fragment>
</Navbar>
<div class="mx-auto px-6 pt-6">
	{#if $navigating}
		<span
			class="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 loading loading-ball loading-lg"
		/>
	{:else}
		<slot />
	{/if}
</div>
