<script lang="ts" context="module">
	import Modal from '$components/popups/Modal.svelte';
	import { getMultiStepModal } from '$lib/stores';

	export type Props = {
		class?: string;
		closeButtonText?: string;
	};
</script>

<script lang="ts">
	const { class: className = '', closeButtonText = 'close' }: Props = $props();

	const multiStepModal = getMultiStepModal();
	let modal = $state<Modal | null>(null);
	const currentStep = $derived(
		multiStepModal.steps$.length > 0
			? multiStepModal.steps$[multiStepModal.steps$.length - 1]
			: null
	);
	const componentProps = $derived(currentStep?.props());
	const showGoBackButton = $derived(multiStepModal.steps$.length > 1);

	function handleClose() {
		multiStepModal.clear();
	}

	function handleGoBack() {
		multiStepModal.pop();
	}

	$effect(() => {
		if (multiStepModal.showing$) {
			modal?.show();
		}
	});
</script>

<Modal title={currentStep?.title} class={className} onClosed={handleClose} bind:this={modal}>
	{#snippet body({ show, close })}
		<svelte:component this={currentStep?.component} {...componentProps}></svelte:component>
	{/snippet}

	{#snippet actions()}
		<button
			type="button"
			class="btn btn-neutral m-auto"
			class:hidden={!showGoBackButton}
			onclick={handleGoBack}
		>
			go back
		</button>
		<button class="btn btn-neutral">{currentStep?.closeModalButtonText ?? 'close'}</button>
	{/snippet}
</Modal>
