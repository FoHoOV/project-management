<script lang="ts">
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let name: string;
	export let href: string;
	export let icon: IconDefinition | null = null;
	export { className as class };

	let className: string = '';
</script>

<li>
	<a on:click class="text-xl normal-case {className}" {href}>
		{#if icon}
			<Fa {icon} />
		{/if}
		{name}
	</a>
</li>
