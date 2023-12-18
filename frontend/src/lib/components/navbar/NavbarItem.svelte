<script lang="ts">
	import { page } from '$app/stores';
	import { toggleClass } from '$lib/actions';
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let name: string;
	export let href: string;
	export let icon: IconDefinition | null = null;
	export let setActiveClassOnClick: boolean = true;
	export { className as class };

	let className: string = '';
</script>

<li class="max-w-full whitespace-normal break-all">
	<a
		on:click
		class="text-xl normal-case {className}"
		{href}
		use:toggleClass={{
			classes: ['active'],
			activateClasses: setActiveClassOnClick && $page.url.href.endsWith(href)
		}}
	>
		{#if icon}
			<Fa {icon} />
		{/if}
		{name}
	</a>
	<slot />
</li>
