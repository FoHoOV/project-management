import { getContext, setContext } from '$lib/stores';
import { MultiStepModal } from './multi-step-modal.svelte';

export const MULTI_STEP_MODAL_CONTEXT_KEY = Symbol();
export function getMultiStepModal() {
	return getContext<MultiStepModal>(MULTI_STEP_MODAL_CONTEXT_KEY);
}

export function setMultiStepModal(store: MultiStepModal) {
	return setContext(store, MULTI_STEP_MODAL_CONTEXT_KEY);
}
