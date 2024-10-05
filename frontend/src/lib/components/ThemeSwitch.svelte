<script lang="ts" module>
	import Fa from 'svelte-fa';

	import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
	import { getTheme } from '$lib/stores';
</script>

<script lang="ts">
	const themeManagerStore = getTheme();

	function handleModeChange(e: Event) {
		if (themeManagerStore.value$ == 'dark') {
			themeManagerStore.change('light');
			(e.target as HTMLInputElement).checked = false;
			return;
		}
		themeManagerStore.change('dark');
		(e.target as HTMLInputElement).checked = true;
	}
</script>

<label class="btn btn-ghost swap swap-rotate text-xl">
	<input
		type="checkbox"
		class="theme-controller"
		onchange={handleModeChange}
		checked={themeManagerStore.value$ == 'light'}
	/>

	<span class="swap-on" data-key="theme" data-set-theme="dark">
		<Fa icon={faSun} class="w-10 fill-current" />
	</span>

	<span class="swap-off fill-current" data-key="theme" data-set-theme="light">
		<Fa icon={faMoon} class="w-10 fill-current" />
	</span>
</label>
