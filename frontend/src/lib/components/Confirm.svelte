<script lang="ts" context="module">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type Events = {
		onConfirmed?: () => void;
		onCanceled?: () => void;
	};

	export type Props = {
		confirmText?: string;
		cancelText?: string;
		confirmButtonType?: HTMLButtonAttributes['type'];
	} & Events;
</script>

<script lang="ts">
	const {
		confirmText = 'confirm',
		cancelText = 'cancel',
		confirmButtonType = 'button',
		onConfirmed,
		onCanceled
	}: Props = $props();

	export function show() {
		visible = true;
	}

	export function hide() {
		visible = false;
	}

	let visible = $state<boolean>(false);
</script>

<div
	class="glass absolute left-0 top-0 z-20 flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-base-300"
	class:hidden={!visible}
	data-testid="confirm-wrapper"
>
	<button
		class="btn btn-neutral"
		on:click={() => {
			hide();
			onCanceled?.();
		}}
		type={confirmButtonType}
		data-testid="confirm-cancel"
	>
		{cancelText}
	</button>

	<button
		class="btn btn-warning"
		on:click={() => {
			hide();
			onConfirmed?.();
		}}
		type="button"
		data-testid="confirm-accept"
	>
		{confirmText}
	</button>
</div>
