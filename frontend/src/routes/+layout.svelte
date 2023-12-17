<script lang="ts">
	import '../app.css';
	import NavbarItem from '$lib/components/navbar/NavbarItem.svelte';
	import { navigating, page } from '$app/stores';
	import type { PageData } from './$types';
	import Drawer from '$components/Drawer.svelte';
	import {
		faArrowRight,
		faHome,
		faProjectDiagram,
		faSearch
	} from '@fortawesome/free-solid-svg-icons';
	import Toasts from '$components/popups/Toasts.svelte';
	import projects from '$lib/stores/projects/projects';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import { browser } from '$app/environment';

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

	$: browser && projects.setProjects(data.projects);
</script>

<Drawer
	id="app-drawer"
	startDrawerOpened={true}
	navbarTitle="Todos"
	navbarTitleHref="/user/projects"
>
	<svelte:fragment slot="drawer-side" let:closeDrawer>
		<NavbarItem icon={faHome} href="/" name="Home" on:click={closeDrawer} />
		{#if $page.data.token}
			<NavbarItem
				icon={faProjectDiagram}
				href="/user/projects"
				name="Projects"
				on:click={closeDrawer}
			>
				<ul>
					{#each browser ? $projects : data.projects as project (project.id)}
						<NavbarItem
							icon={faArrowRight}
							href={generateTodoListUrl(project.title, project.id)}
							name={project.title + ' (' + '#' + project.id + ')'}
							on:click={closeDrawer}
						/>
					{/each}
				</ul>
			</NavbarItem>
			<NavbarItem
				icon={faSearch}
				href="/user/search-tags"
				name="Search by tag"
				on:click={closeDrawer}
			></NavbarItem>
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="drawer-navbar-end">
		{#if $page.data.token}
			<NavbarItem href="/user/logout" name="logout" setActiveClassOnClick={false} />
		{:else}
			<NavbarItem href="/login" name="login" setActiveClassOnClick={false} />
		{/if}
	</svelte:fragment>

	<div class="grid h-full overflow-hidden" slot="drawer-content" let:closeDrawer>
		<div class="flex-1 overflow-auto px-6 py-4 lg:px-2 lg:py-1.5">
			{#if $navigating}
				<span
					class="loading loading-ball loading-lg absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"
				/>
			{:else}
				<div class="mx-auto h-full overflow-y-auto">
					<slot />
					<Toasts></Toasts>
				</div>
			{/if}
		</div>
	</div>
</Drawer>
