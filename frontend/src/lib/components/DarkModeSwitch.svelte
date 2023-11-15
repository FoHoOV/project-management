<script lang="ts">
	import { onMount } from 'svelte';
	import { themeChange } from 'theme-change';
	import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	onMount(() => {
		themeChange(false);
	});
</script>

<label class="swap swap-rotate">
	<!-- this hidden checkbox controls the state -->
	<input type="checkbox" />

	<span class="swap-on" data-key="theme" data-set-theme="dark">
		<Fa icon={faSun} class="h-5 w-10 fill-current" />
	</span>

	<span class="swap-off fill-current" data-key="theme" data-set-theme="light">
		<Fa icon={faMoon} class="h-5 w-10 fill-current" />
	</span>
</label>
