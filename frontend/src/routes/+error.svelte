<script lang="ts" module>
	import Fa from 'svelte-fa';

	import { page } from '$app/stores';
	import { faWarning } from '@fortawesome/free-solid-svg-icons';
</script>

<div class="flex w-full flex-col items-center gap-3 pt-10">
	<h1 class="text-9xl font-extrabold text-error">{$page.status}</h1>
	<h2 class="mb-5 text-4xl font-bold">{$page.error?.message}</h2>
	<div class="flex flex-row items-center gap-2">
		<Fa icon={faWarning} class="text-error" />
		<p class="text-lg">An error has occurred, please try again</p>
	</div>
</div>
