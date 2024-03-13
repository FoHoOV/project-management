<script lang="ts" context="module">
	import Fa from 'svelte-fa';
	import { faClose, type IconDefinition } from '@fortawesome/free-solid-svg-icons';

	export type Props = {
		icon?: IconDefinition;
		class?: string;
	};
</script>

<script lang="ts">
	const { icon = faClose, class: className = 'h-6 w-6' }: Props = $props();
</script>

<button class="btn btn-circle {className}" on:click on:dblclick on:blur>
	<Fa {icon} />
</button>
