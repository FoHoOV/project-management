import { writable } from 'svelte/store';
import type { Project } from '$lib/generated-client/models';

const { set: _set, subscribe } = writable<Project[]>([]);

const setProjects = (projects: Project[]) => {
	_set(projects);
};

export default {
	setProjects,
	subscribe
};
