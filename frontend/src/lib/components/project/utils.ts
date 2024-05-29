import type { Projects } from '$lib/stores/projects';
import { PROJECTS_CONTEXT_NAME } from './constants';
import { getRootContextManager } from '$lib/stores/context-manager';
import { getContext, setContext } from 'svelte';

export function setProjectsStoreToContext<TContext extends Projects | undefined>(
	store: TContext,
	setToRootContext?: boolean
) {
	if (setToRootContext) {
		return getRootContextManager().add(PROJECTS_CONTEXT_NAME, store);
	}
	return setContext(PROJECTS_CONTEXT_NAME, store);
}

export function getProjectsStoreFromContext() {
	return (
		getContext<Projects | undefined>(PROJECTS_CONTEXT_NAME) ??
		getRootContextManager().get<Projects>(PROJECTS_CONTEXT_NAME)
	);
}
