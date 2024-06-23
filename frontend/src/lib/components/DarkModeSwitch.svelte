<script lang="ts" context="module">
	import Fa from 'svelte-fa';

	import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
	import { getSelectedTheme$, changeTheme } from '$lib/stores/theme';
</script>

<script lang="ts">
	const theme = getSelectedTheme$();

	function handleModeChange(e: Event) {
		if (theme.current == 'dark') {
			changeTheme('light');
			return;
		}
		changeTheme('dark');
	}

	$effect(() => {
		document.documentElement.dataset.theme = theme.current;
	});
</script>

<label class="btn btn-ghost swap swap-rotate text-xl">
	<input type="checkbox" class="theme-controller" onchange={handleModeChange} />

	<span class="swap-on" data-key="theme" data-set-theme="dark">
		<Fa icon={faSun} class="w-10 fill-current" />
	</span>

	<span class="swap-off fill-current" data-key="theme" data-set-theme="light">
		<Fa icon={faMoon} class="w-10 fill-current" />
	</span>
</label>
