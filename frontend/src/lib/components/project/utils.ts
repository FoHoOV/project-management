import { setContext, getContext } from 'svelte';
import type { Projects } from '../../stores/projects';
import { PROJECTS_CONTEXT_NAME } from './constants';

export function setProjectsStoreToContext<TContext extends Projects | undefined>(store: TContext) {
	return setContext(PROJECTS_CONTEXT_NAME, store);
}

export function getProjectsStoreFromContext() {
	return getContext<Projects | undefined>(PROJECTS_CONTEXT_NAME);
}
