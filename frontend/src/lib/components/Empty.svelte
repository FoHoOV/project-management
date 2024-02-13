<script lang="ts" context="module">
	import Fa from 'svelte-fa';
	import { faFolderBlank } from '@fortawesome/free-solid-svg-icons';

	export type Props = {
		text?: string;
		class?: string;
	};
</script>

<script lang="ts">
	const { text = 'Nothing to see here', class: className = '' } = $props();
</script>

<div class="flex items-start align-top {className}">
	<div class="flex items-center gap-5 py-2">
		<Fa icon={faFolderBlank}></Fa>
		<h1 class="text-lg">{text}</h1>
	</div>
</div>
