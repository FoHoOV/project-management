<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faBarsStaggered, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
	import { themeChange } from 'theme-change';
	import { onMount } from 'svelte';
	import Drawer from './Drawer.svelte';
	export let appName: string;
	export let href: string;

	onMount(() => {
		themeChange(false);
	});
</script>

<div class="navbar shadow-2xl bg-base-100">
	<div class="navbar-start">
		<Drawer>
			<svelte:fragment slot="drawer-items" let:closeDrawer>
				<slot name="start" {closeDrawer} />
			</svelte:fragment>
		</Drawer>
		<a class="btn btn-ghost normal-case text-xl" {href}>{appName}</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<slot name="center" />
		</ul>
	</div>
	<div class="navbar-end">
		<label class="swap swap-rotate">
			<!-- this hidden checkbox controls the state -->
			<input type="checkbox" />

			<span class="swap-on" data-key="theme" data-set-theme="dark">
				<Fa icon={faSun} class="fill-current w-10 h-5" />
			</span>

			<span class="swap-off fill-current" data-key="theme" data-set-theme="light">
				<Fa icon={faMoon} class="fill-current w-10 h-5" />
			</span>
		</label>
		<ul class="menu px-1">
			<slot name="end" />
		</ul>
	</div>
</div>
