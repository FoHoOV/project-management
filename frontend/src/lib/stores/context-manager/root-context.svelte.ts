import { ROOT_CONTEXT_MANAGER_KEY } from './constants';
import { getContext, setContext } from 'svelte';

class ContextManager {
	private _contexts: Record<any, unknown> = $state({});

	add<TContext>(key: any, value: TContext) {
		this._contexts[key] = value;
		return value;
	}

	delete(key: any) {
		delete this._contexts[key];
	}

	get<TContext>(key: any): TContext | undefined {
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
