<script lang="ts">
	import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	let showDrawer = false;

	let closeDrawer = () => {
		showDrawer = false;
	};
</script>

<div class="drawer">
	<input id="navbar-drawer" type="checkbox" class="drawer-toggle" bind:checked={showDrawer} />
	<div class="drawer-content flex flex-col">
		<div class="flex-none lg:hidden">
			<label for="navbar-drawer" class="btn btn-square btn-ghost">
				<Fa icon={faBarsStaggered} />
			</label>
		</div>
		<div class="hidden flex-none lg:inline-flex">
			<ul class="menu menu-horizontal">
				<slot name="drawer-items" {closeDrawer} />
			</ul>
		</div>
	</div>
	<div class="drawer-side z-10">
		<label for="navbar-drawer" class="drawer-overlay" />
		<ul class="menu h-full w-80 bg-base-200 p-4">
			<slot name="drawer-items" {closeDrawer} />
		</ul>
	</div>
</div>
