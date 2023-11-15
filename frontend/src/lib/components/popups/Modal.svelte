<script lang="ts">
	export let title: string = '';

	let modalElement: HTMLDialogElement;

	export function show() {
		modalElement.show();
	}

	export function close() {
		modalElement.close();
	}
</script>

<dialog class="modal modal-bottom sm:modal-middle" bind:this={modalElement}>
	<div class="modal-box">
		<h3 class="mb-3 text-lg font-bold">{title}</h3>
		<slot name="body" {show} {close} />
		<div class="modal-action">
			<form method="dialog">
				<!-- if there is a button in form, it will close the modal -->
				<button class="btn">Close</button>
			</form>
		</div>
	</div>
</dialog>
