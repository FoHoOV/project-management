<script lang="ts" context="module">
	import { createEventDispatcher } from 'svelte';

	export type Props = {
		confirmText?: string;
		cancelText?: string;
	};
</script>

<script lang="ts">
	const { confirmText = 'confirm', cancelText = 'cancel' } = $props<Props>();

	export function show() {
		visible = true;
	}

	export function hide() {
		visible = false;
	}

	let visible = $state<boolean>(false);
	const dispatcher = createEventDispatcher<{ onConfirm: {}; onCancel: {} }>();
</script>

<div
	class="glass absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-base-300"
	class:hidden={!visible}
>
	<button
		class="btn btn-neutral"
		on:click={() => {
			hide();
			dispatcher('onCancel', {});
		}}
	>
		{cancelText}
	</button>

	<button
		class="btn btn-warning"
		on:click={() => {
			hide();
			dispatcher('onConfirm', {});
		}}
	>
		{confirmText}
	</button>
</div>
