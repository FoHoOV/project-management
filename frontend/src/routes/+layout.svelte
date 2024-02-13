<script lang="ts">
	import '../app.css';
	import NavbarItem from '$lib/components/navbar/NavbarItem.svelte';
	import { navigating, page } from '$app/stores';
	import Drawer from '$components/Drawer.svelte';
	import {
		faArrowRight,
		faHome,
		faProjectDiagram,
		faSearch
	} from '@fortawesome/free-solid-svg-icons';
	import Toasts from '$components/popups/Toasts.svelte';
	import { projects } from '$lib/stores/projects/projects.svelte';
	import { generateTodoListUrl } from '$lib/utils/params/route';
	import MultiModal from '$components/popups/MultiModal.svelte';
	import { untrack } from 'svelte';
	import { browser } from '$app/environment';

	const { data, children } = $props();
	const environmentSpecificProjects = $derived(browser ? projects.current : data.projects);

	$effect(() => {
		data;
		untrack(() => {
			projects.set(data.projects);
		});
	});
</script>

<Drawer id="app-drawer" navbarTitle="Todos" navbarTitleHref="/user/projects">
	{#snippet sidebar({ closeDrawer })}
		<NavbarItem icon={faHome} href="/" name="Home" on:click={closeDrawer} />
		{#if $page.data.token}
			<NavbarItem
				icon={faProjectDiagram}
				href="/user/projects"
				name="Projects"
				on:click={closeDrawer}
			>
				<ul>
					{#each environmentSpecificProjects as project (project.id)}
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
	{/snippet}

	{#snippet navbarEnd()}
		{#if $page.data.token}
			<NavbarItem href="/user/logout" name="logout" setActiveClassOnClick={false} />
		{:else}
			<NavbarItem href="/login" name="login" setActiveClassOnClick={false} />
		{/if}
	{/snippet}

	{#snippet content()}
		<div class="grid h-full overflow-hidden">
			<div class="flex-1 overflow-auto px-6 py-4 lg:px-2 lg:py-1.5">
				{#if $navigating}
					<span
						class="loading loading-ball loading-lg absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"
					/>
				{:else}
					<div class="mx-auto h-full overflow-y-auto">
						{@render children()}
						<Toasts></Toasts>
						<MultiModal class="border border-success border-opacity-20"></MultiModal>
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
</Drawer>
