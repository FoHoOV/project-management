<script lang="ts" module>
	import NavbarItem from '$lib/components/navbar/NavbarItem.svelte';
	import MultiStepModal from '$components/popups/MultiStepModal.svelte';
	import Drawer from '$components/Drawer.svelte';
	import Toasts from '$components/popups/Toasts.svelte';
	import ThemeSwitch from '$components/ThemeSwitch.svelte';

	import '../app.css';

	import { navigating, page } from '$app/stores';
	import {
		faArrowRight,
		faHome,
		faProjectDiagram,
		faSearch
	} from '@fortawesome/free-solid-svg-icons';

	import { generateTodoListItemsUrl } from '$lib/utils/params/route';
	import { Projects, setProjects } from '$lib/stores/projects';
	import { createRootContextManager } from '$lib/stores/context-manager';
	import { onMount, untrack } from 'svelte';
	import {
		Navbar,
		ToastManager,
		setMultiStepModal,
		setNavbar,
		setToastManager,
		setTheme,
		MultiStepModal as MultiStepModalStore,
		ThemeManager,
		Persisted,
		setPersistedUtils
	} from '$lib/stores';
	import { setStorageTypes, StorageTypes } from '$lib';
</script>

<script lang="ts">
	const { data, children } = $props();

	createRootContextManager();

	const storageTypes = new StorageTypes({ initialCookies: data.sharedCookies });
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
			multiStepModalStore: setMultiStepModal(new MultiStepModalStore([], false)),
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
	navbarTitleHref="/user/projects"
	data-theme={themeManager.value$}
>
	{#snippet sidebar({ closeDrawer })}
		<NavbarItem icon={faHome} href="/" name="Home" onclick={closeDrawer} />
		{#if $page.data.token}
			<NavbarItem
				icon={faProjectDiagram}
				href="/user/projects"
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
				href="/user/search-tags"
				name="Search by tag"
				onclick={closeDrawer}
			></NavbarItem>
		{/if}
	{/snippet}

	{#snippet navbarEnd()}
		<ThemeSwitch />
		{#if $page.data.token}
			<NavbarItem href="/user/logout" name="logout" setActiveClassOnClick={false} />
		{:else}
			<NavbarItem href="/login" name="login" setActiveClassOnClick={false} />
		{/if}
	{/snippet}

	{#snippet content()}
		<div class="relative grid h-full overflow-hidden">
			<div class="flex-1 overflow-auto px-6 py-4 lg:px-2 lg:py-1.5">
				{#if $navigating}
					<span
						class="loading loading-ball loading-lg absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2"
					></span>
				{:else}
					<div class="mx-auto h-full overflow-y-auto">
						{@render children()}
						<Toasts></Toasts>
						<MultiStepModal class="border border-success border-opacity-20"></MultiStepModal>
					</div>
				{/if}
			</div>
		</div>
	{/snippet}
</Drawer>
