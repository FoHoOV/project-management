<script lang="ts">
	import { faClose, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa/src/fa.svelte';

	export let icon: IconDefinition = faClose;
	export { className as class };

	let className: string = 'h-6 w-6';
</script>

<button class="btn btn-circle {className}" on:click on:dblclick on:blur>
	<Fa {icon} />
</button>
