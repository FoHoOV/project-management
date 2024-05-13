<script lang="ts" context="module">
	export type Props = {
		visible?: boolean;
	};
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	// it will position absolutely to the nearest position: relative parent.
	const { visible = false }: Props = $props();

	let _internalVisible = $state(visible);

	$effect(() => {
		visible;
		untrack(() => {
			_internalVisible = visible;
		});
	});

	export function show() {
		_internalVisible = true;
	}

	export function hide() {
		_internalVisible = false;
	}
</script>

<div
	class="align-center glass absolute left-0 top-0 z-10 flex h-full w-full justify-center rounded-lg bg-base-300 opacity-80"
	class:hidden={!_internalVisible}
	data-testid="spinner-loading-state"
>
	<span class="loading loading-spinner loading-md dark:text-black"></span>
</div>
