<script lang="ts" context="module">
	export type Props = {
		icon?: IconDefinition;
		class?: string;
	};
</script>

<script lang="ts">
	import { faClose, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	const { icon = faClose, class: className = 'h-6 w-6' } = $props<Props>();
</script>

<button class="btn btn-circle {className}" on:click on:dblclick on:blur>
	<Fa {icon} />
</button>
