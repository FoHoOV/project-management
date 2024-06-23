import { setContext as svelteSetContext, getContext as svelteGetContext } from 'svelte';
import { getRootContextManager } from './root-context.svelte';

export function setContext<TValue>(
	value: TValue,
	key: symbol | string,
	setToRootContext: boolean = true
) {
	if (setToRootContext) {
		return getRootContextManager().add(key, value);
	}
	return svelteSetContext(key, value);
}

export function getContext<TValue>(key: symbol | string) {
	return svelteGetContext<TValue | undefined>(key) ?? getRootContextManager().get<TValue>(key);
}
