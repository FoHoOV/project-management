<script lang="ts" context="module">
	export type Props = {
		class?: string;
	};
</script>

<script lang="ts">
	import Modal from '$components/popups/Modal.svelte';
	import multiModal from '$lib/stores/multi-modal';

	const { class: className = '' } = $props<Props>();

	let modal = $state<Modal | null>(null);

	const currentStep = $derived(
		$multiModal.steps.length > 0 ? $multiModal.steps[$multiModal.steps.length - 1] : null
	);
	const componentProps = $derived(currentStep?.props());

	function handleClose() {
		multiModal.clear();
	}

	function handleGoBack() {
		multiModal.pop();
	}

	$effect(() => {
		if ($multiModal.show) {
			modal?.show();
		}
	});
</script>

<Modal title={currentStep?.title} class={className} on:closed={handleClose} bind:this={modal}>
	<svelte:component this={currentStep?.component} slot="body" {...componentProps}
	></svelte:component>

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
