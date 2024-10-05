<script lang="ts" module>
import Modal from '$components/popups/Modal.svelte';
import { getMultiStepModal } from '$lib/stores';
import type { ComponentExports } from '$lib/utils/types/svelte';

export type Props = {
	class?: string;
	closeButtonText?: string;
};
</script>

<script lang="ts">
const { class: className = '', closeButtonText = 'close' }: Props = $props();

const multiStepModal = getMultiStepModal();
let modal = $state<ComponentExports<typeof Modal> | null>(null);
const currentStep = $derived(
	multiStepModal.steps$.length > 0 ? multiStepModal.steps$[multiStepModal.steps$.length - 1] : null
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
		{#if currentStep?.component}
			{@const Component = currentStep?.component}
			<Component {...componentProps}></Component>
		{/if}
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
