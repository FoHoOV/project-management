<script lang="ts">
	import { page } from '$app/stores';
	import { faWarning } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
</script>

<div>
	<h1 class="mb-5 text-4xl font-bold">Whoops! an error has occurred!</h1>
	<div class="flex flex-row items-center gap-2">
		<Fa icon={faWarning} />
		<p class="text-lg">
			Error <span class="text-xl font-bold">{$page.status}</span>
		</p>
	</div>
	<p class="text-lg">
		{$page.error?.message}, Please try again!
	</p>
</div>
