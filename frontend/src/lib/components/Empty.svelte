<script>
	import { faFolderBlank } from '@fortawesome/free-solid-svg-icons';

	import Fa from 'svelte-fa';

	export let text = 'Nothing to see here!';
</script>

<div class="flex items-center justify-center gap-5 py-2">
	<Fa icon={faFolderBlank}></Fa>
	<h1 class="text-lg">{text}</h1>
</div>
