<script lang="ts" context="module">
	export type Props = {
		title?: string;
		dialogProps?: Partial<HTMLAttributes<HTMLDialogElement>>;
		wrapperClasses?: string;
		class?: string;
	};
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	const {
		title = '',
		dialogProps = {},
		wrapperClasses = '',
		class: modalBodyClasses = ''
	} = $props<Props>();

	const dispatch = createEventDispatcher<{ closed: {}; opened: {} }>();

	let modalElement = $state<HTMLDialogElement | null>(null);

	export function show() {
		modalElement?.show();
		dispatch('opened', {});
	}

	export function close() {
		modalElement?.close();
		dispatch('closed', {});
	}

	function handleKeyupEvent(e: KeyboardEvent) {
		if (e.key !== 'Escape') {
			return;
		}

		close();
	}
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog
	class="modal modal-bottom cursor-default backdrop-blur-sm backdrop-brightness-50 sm:modal-middle {wrapperClasses}"
	{...dialogProps}
	on:keyup={handleKeyupEvent}
	on:close={close}
	bind:this={modalElement}
>
	<div class="modal-box {modalBodyClasses}">
		<h3 class="mb-3 text-lg font-bold">{title}</h3>
		<slot name="body" {show} {close} />
		<div class="modal-action">
			<form method="dialog">
				<slot name="actions" />
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn btn-neutral">Close</button>
			</form>
		</div>
	</div>
</dialog>
