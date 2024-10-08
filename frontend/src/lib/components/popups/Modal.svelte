<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type Events = {
		onClosed?: () => void;
		onOpened?: () => void;
	};

	export type Slots = {
		body?: Snippet<[{ show: () => void; close: () => void }]>;
		actions?: Snippet;
	};

	export type Props = {
		title?: string;
		dialogProps?: Partial<HTMLAttributes<HTMLDialogElement>>;
		wrapperClasses?: string;
		class?: string;
	} & Slots &
		Events;
</script>

<script lang="ts">
	const {
		title,
		dialogProps = {},
		wrapperClasses = '',
		class: modalBodyClasses = '',
		actions,
		body,
		onOpened,
		onClosed
	}: Props = $props();

	let modalElement = $state<HTMLDialogElement | null>(null);

	export function show() {
		modalElement?.show();
		onOpened?.();
	}

	export function close() {
		modalElement?.close();
		onClosed?.();
	}

	function handleKeyupEvent(e: KeyboardEvent) {
		if (e.key !== 'Escape') {
			return;
		}

		close();
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	class="modal modal-bottom cursor-default backdrop-blur-sm backdrop-brightness-50 sm:modal-middle {wrapperClasses}"
	{...dialogProps}
	onkeyup={handleKeyupEvent}
	onclose={close}
	bind:this={modalElement}
>
	<div class="modal-box {modalBodyClasses}">
		<h3 class="mb-3 text-lg font-bold">{title}</h3>
		{@render body?.({ show, close })}
		<div class="modal-action">
			<form method="dialog">
				{#if actions}
					{@render actions()}
				{:else}
					<!-- if there is a button in form, it will close the modal -->
					<button class="btn btn-neutral">Close</button>
				{/if}
			</form>
		</div>
	</div>
</dialog>
