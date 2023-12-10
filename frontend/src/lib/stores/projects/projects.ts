import { writable } from 'svelte/store';
import type { Project } from '$lib/generated-client/models';

const { subscribe, update: _update, set: _set } = writable<Project[]>([]);

const setProjects = (projects: Project[]) => {
	_set(projects);
};

const addProject = (project: Project) => {
	_update((projects) => [project, ...projects]);
};

const updateProject = (project: Project) => {
	_update((projects) => {
		return projects.map((value) => {
			if (value.id != project.id) {
				return value;
			}
			return project;
		});
	});
};

const deleteProject = (project: Project) => {
	_update((comments) => {
		return comments.filter((value) => value.id != project.id);
	});
};

export default {
	setProjects,
	addProject,
	updateProject,
	deleteProject,
	subscribe
};
