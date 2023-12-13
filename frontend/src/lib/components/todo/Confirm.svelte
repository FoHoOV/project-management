<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let confirmText: string = 'confirm';
	export let cancelText: string = 'cancel';

	export function show() {
		visible = true;
	}

	export function hide() {
		visible = false;
	}

	let visible: boolean = false;
	const dispatcher = createEventDispatcher<{ onConfirm: {}; onCancel: {} }>();
</script>

<div
	class="glass absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-base-300"
	class:hidden={!visible}
>
	<button
		class="btn btn-warning"
		on:click={() => {
			hide();
			dispatcher('onConfirm', {});
		}}
	>
		{confirmText}
	</button>

	<button
		class="btn btn-neutral"
		on:click={() => {
			hide();
			dispatcher('onCancel', {});
		}}
	>
		{cancelText}
	</button>
</div>
