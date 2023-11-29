<script lang="ts">
	import { faSortDown, faSortUp } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let visible: boolean = false;
	export let direction: 'top' | 'bottom';
</script>

<div
	class="glass absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl bg-base-300 opacity-80"
	class:hidden={!visible}
	class:flex-col-reverse={direction == 'bottom'}
>
	<Fa icon={direction == 'top' ? faSortUp : faSortDown} />
	{#if direction == 'top'}
		<span>Move todo to on top of this item</span>
	{:else}
		<span>Move todo under this item</span>
	{/if}
</div>
