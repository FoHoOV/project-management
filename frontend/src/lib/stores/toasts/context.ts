import { getContext, setContext } from 'svelte';
import { ToastManager } from './toasts.svelte';

export const TOASTS_CONTEXT_KEY = Symbol();

export function getToastManager() {
	return getContext<ToastManager>(TOASTS_CONTEXT_KEY);
}

export function setToastManager(store: ToastManager) {
	return setContext(TOASTS_CONTEXT_KEY, store);
}
