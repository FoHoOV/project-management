<script lang="ts" module>
	import { resolve } from '$app/paths';
	import NavbarItem from '#lib/components/navbar/NavbarItem.svelte';
	import Drawer from '#lib/components/Drawer.svelte';
	import Toasts from '#lib/components/popups/Toasts.svelte';
	import ThemeSwitch from '#lib/components/ThemeSwitch.svelte';

	import '../app.css';

	import { navigating, page } from '$app/state';
	import {
		faArrowRight,
		faHome,
		faProjectDiagram,
		faSearch
	} from '@fortawesome/free-solid-svg-icons';

	import { generateTodoListItemsUrl } from '#lib/utils/params/route.js';
	import { Projects, setProjects } from '#lib/stores/projects/index.js';
	import { onMount, untrack } from 'svelte';
	import {
		Navbar,
		ToastManager,
		setNavbar,
		setToastManager,
		setTheme,
		ThemeManager,
		Persisted,
		setPersistedUtils
	} from '#lib/stores/index.js';
	import { setStorageTypes, StorageTypes } from '#lib';
</script>

<script lang="ts">
	const { data, children } = $props();

	const storageTypes = new StorageTypes({ initialCookies: untrack(() => data.sharedCookies) });
	const persisted = new Persisted(storageTypes);

	const { projectsStore, themeManager } = initializeGlobalStores();

	$effect.pre(() => {
		data;
		untrack(() => {
			projectsStore.set([...data.projects]);
		});
	});

	function initializeGlobalStores() {
		return {
			// we are creating a new array for projects because we should not mutate the data passed from server -_-
			// mutating data sent from server should be a warning in general I guess?
			projectsStore: setProjects(new Projects([...data.projects])),
			navbarStore: setNavbar(new Navbar()),
			toastManagerStore: setToastManager(new ToastManager()),
			themeManager: setTheme(new ThemeManager(persisted)),
			persistedUtils: setPersistedUtils(persisted),
			storageTypes: setStorageTypes(storageTypes)
		};
	}

	onMount(() => {
		// this is for tests
		document.body.setAttribute('data-svelte-hydrated', 'true');
	});
</script>

<Drawer
	id="app-drawer"
	navbarTitle="Todos"
	navbarTitleHref={resolve('/user/projects')}
	data-theme={themeManager.value$}
>
	{#snippet sidebar({ closeDrawer })}
		<NavbarItem icon={faHome} href={resolve('/')} name="Home" onclick={closeDrawer} />
		{#if page.data.username}
			<NavbarItem
				icon={faProjectDiagram}
				href={resolve('/user/projects')}
				name="Projects"
				onclick={closeDrawer}
			>
				<ul>
					{#each projectsStore.value$ as project (project.id)}
						<NavbarItem
							icon={faArrowRight}
							href={generateTodoListItemsUrl(project.title, project.id)}
							name={project.title + ' (' + '#' + project.id + ')'}
							onclick={closeDrawer}
						/>
					{/each}
				</ul>
			</NavbarItem>
			<NavbarItem
				icon={faSearch}
				href={resolve('/user/search-tags')}
				name="Search by tag"
				onclick={closeDrawer}
			></NavbarItem>
		{/if}
	{/snippet}

	{#snippet navbarEnd()}
		<ThemeSwitch />
		{#if page.data.username}
			<NavbarItem href={resolve('/user/logout')} name="logout" setActiveClassOnClick={false} />
		{:else}
			<NavbarItem href={resolve('/(entry)/login')} name="login" setActiveClassOnClick={false} />
		{/if}
	{/snippet}

	{#snippet content()}
		<div class="relative grid h-full overflow-hidden">
			<div class="flex-1 overflow-auto px-6 py-4 lg:px-2 lg:py-1.5">
				{#if navigating.to}
					<span
						class="loading loading-ball loading-lg absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"
					></span>
				{:else}
					<div class="mx-auto h-full overflow-y-auto">
						{@render children()}
						<Toasts></Toasts>
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
</Drawer>
