import { writable } from 'svelte/store';
import type { Project } from '$lib/generated-client/models';
import { sortByIdInPlace } from '../todos/sort';

const { subscribe, update: _update, set: _set } = writable<Project[]>([]);

const setProjects = (projects: Project[]) => {
	_set(projects);
};

const addProject = (project: Project) => {
	_update((projects) => {
		projects.push(project);
		return projects;
	});
};

const updateProject = (project: Project) => {
	_update((projects) => {
		projects = projects.map((value) => {
			if (value.id != project.id) {
				return value;
			}
			return project;
		});
		sortByIdInPlace(projects, true);
		return projects;
	});
};

const deleteProject = (project: Project) => {
	_update((projects) => {
		return projects.filter((value) => value.id != project.id);
	});
};

export default {
	setProjects,
	addProject,
	updateProject,
	deleteProject,
	subscribe
};
