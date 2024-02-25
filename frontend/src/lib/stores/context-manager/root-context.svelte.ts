import { ROOT_CONTEXT_MANAGER_KEY } from './constants';
import { getContext, setContext } from 'svelte';

class ContextManager {
	private _contexts: Record<string, unknown> = $state({});

	add<TContext>(key: string, value: TContext) {
		this._contexts[key] = value;
		return value;
	}

	delete(key: string) {
		delete this._contexts[key];
	}

	get<TContext>(key: string): TContext | undefined {
		return this._contexts[key] as TContext;
	}
}
export const contextManager = new ContextManager();

export function createRootContextManager() {
	setContext(ROOT_CONTEXT_MANAGER_KEY, contextManager);
}

export function getRootContextManager() {
	return getContext<ContextManager>(ROOT_CONTEXT_MANAGER_KEY);
}
