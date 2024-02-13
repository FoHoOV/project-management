<script lang="ts" context="module">
	import Modal from '$components/popups/Modal.svelte';
	import { multiStepModal } from '$lib/stores/multi-step-modal';

	export type Props = {
		class?: string;
	};
</script>

<script lang="ts">
	const { class: className = '' } = $props<Props>();
	let modal = $state<Modal | null>(null);
	const currentStep = $derived(
		multiStepModal.steps.length > 0 ? multiStepModal.steps[multiStepModal.steps.length - 1] : null
	);
	const componentProps = $derived(currentStep?.props());
	const showGoBackButton = $derived(multiStepModal.steps.length > 1);

	function handleClose() {
		multiStepModal.clear();
	}

	function handleGoBack() {
		multiStepModal.pop();
	}

	$effect(() => {
		if (multiStepModal.showing) {
			modal?.show();
		}
	});
</script>

<Modal title={currentStep?.title} class={className} onClosed={handleClose} bind:this={modal}>
	<svelte:component this={currentStep?.component} slot="body" {...componentProps}
	></svelte:component>

	<button
		slot="actions"
		type="button"
		class="btn btn-neutral m-auto"
		class:hidden={!showGoBackButton}
		on:click={handleGoBack}
	>
		go back
	</button>
</Modal>
