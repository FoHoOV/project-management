import { getContext, setContext } from '$lib/stores';
import { Projects } from './projects.svelte';

export const PROJECTS_CONTEXT_KEY = Symbol();
export function getProjects() {
	return getContext<Projects | undefined>(PROJECTS_CONTEXT_KEY);
}

export function setProjects(store: Projects, setToRoot: boolean = true) {
	return setContext(store, PROJECTS_CONTEXT_KEY, setToRoot);
}
