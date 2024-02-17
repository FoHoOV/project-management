import type { PartialUser, Project } from '$lib/generated-client/models';
import { sortByIdInPlace } from '../todos/sort';

export class Projects {
	private _projects = $state<Project[]>([]);

	constructor(projects: Project[]) {
		this.set(projects);
	}

	set(projects: Project[]) {
		this._projects = projects;
		sortByIdInPlace(this.current, true);
	}

	add(project: Project) {
		this._projects.push(project);
		sortByIdInPlace(this.current, true);
	}

	update(project: Project) {
		this._projects = this._projects.map((value) => {
			if (value.id != project.id) {
				return value;
			}
			return project;
		});
		sortByIdInPlace(this.current, true);
	}

	remove(project: Project) {
		this._projects = this._projects.filter((value) => value.id != project.id);
	}

	addAssociation(project: Project, newUser: PartialUser) {
		const target = this._projects.find((value) => value.id == project.id);
		if (!target) {
			throw new Error('project not found in the store');
		}
		target.users.push(newUser);
	}

	get current() {
		return this._projects;
	}
}
