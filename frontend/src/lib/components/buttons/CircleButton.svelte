<script lang="ts" context="module">
	import Fa from 'svelte-fa';
	import { faClose, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type Props = {
		icon?: IconDefinition;
		class?: string;
	} & Partial<Omit<HTMLButtonAttributes, 'class'>>;
</script>

<script lang="ts">
	const { icon = faClose, class: className = 'h-6 w-6', ...restProps }: Props = $props();
</script>

<button class="btn btn-circle {className}" {...restProps}>
	<Fa {icon} />
</button>
