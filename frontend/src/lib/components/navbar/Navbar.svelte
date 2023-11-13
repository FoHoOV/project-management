<script lang="ts">
	import Fa from 'svelte-fa';
	import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	import Drawer from './Drawer.svelte';

	export let appName: string;
	export let href: string;
	export { className as class };

	let className: string = '';

	onMount(() => {
		themeChange(false);
	});
</script>

<div class="navbar bg-base-100 shadow-2xl {className}">
	<div class="navbar-start">
		<Drawer>
			<svelte:fragment slot="drawer-items" let:closeDrawer>
				<slot name="start" {closeDrawer} />
			</svelte:fragment>
		</Drawer>
		<a class="btn btn-ghost text-xl normal-case" {href}>{appName}</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<slot name="center" />
		</ul>
	</div>
	<div class="navbar-end">
		<label class="swap-rotate swap">
			<!-- this hidden checkbox controls the state -->
			<input type="checkbox" />

			<span class="swap-on" data-key="theme" data-set-theme="dark">
				<Fa icon={faSun} class="h-5 w-10 fill-current" />
			</span>

			<span class="swap-off fill-current" data-key="theme" data-set-theme="light">
				<Fa icon={faMoon} class="h-5 w-10 fill-current" />
			</span>
		</label>
		<ul class="menu px-1">
			<slot name="end" />
		</ul>
	</div>
</div>
