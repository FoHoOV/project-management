<script lang="ts">
	import Modal from '$components/popups/Modal.svelte';
	import multiModal from '$lib/stores/multi-modal';

	export { _wrapperClasses as class };

	let wrapperClasses: string | undefined = undefined;
	let modal: Modal;

	$: currentStep =
		$multiModal.steps.length > 0 ? $multiModal.steps[$multiModal.steps.length - 1] : null;
	$: props = currentStep?.props();

	function handleClose() {
		multiModal.clear();
	}

	function handleGoBack() {
		multiModal.pop();
	}

	$: if ($multiModal.show) {
		modal.show();
	}
</script>

<Modal title={currentStep?.title} class={wrapperClasses} on:closed={handleClose} bind:this={modal}>
	<svelte:component this={currentStep?.component} slot="body" {...props}></svelte:component>

	<button
		slot="actions"
		type="button"
		class="btn btn-neutral m-auto"
		class:hidden={$multiModal.steps.length <= 1}
		on:click={handleGoBack}
	>
		go back
	</button>
</Modal>
