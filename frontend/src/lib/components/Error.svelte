<script lang="ts">
	import Fa from 'svelte-fa/src/fa.svelte';
	import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
	export let message: string | undefined | null = null;
	export let className: string = '';
</script>

{#if message}
	<div class="alert alert-error rounded-md {className}">
		<Fa icon={faExclamationCircle} />
		<span>{message}</span>
	</div>
{/if}
