import type { PartialUserWithPermission, Project } from '$lib/generated-client/models';
import { sortByIdInPlace } from '../todos/sort';

export class Projects {
	private _projects = $state<Project[]>([]);

	constructor(projects: Project[]) {
		this.set(projects);
	}

	set(projects: Project[]) {
		this._projects = projects;
		sortByIdInPlace(this.value$, true);
	}

	add(project: Project) {
		this._projects.push(project);
		sortByIdInPlace(this.value$, true);
	}

	update(project: Project) {
		this._projects = this._projects.map((value) => {
			if (value.id != project.id) {
				return value;
			}
			return project;
		});
		sortByIdInPlace(this.value$, true);
	}

	remove(project: Project) {
		this._projects = this._projects.filter((value) => value.id != project.id);
	}

	addAssociation(project: Project, newUser: PartialUserWithPermission) {
		const target = this._projects.find((value) => value.id == project.id);
		if (!target) {
			throw new Error('project not found in the store');
		}
		target.users.push(newUser);
	}

	get value$() {
		return this._projects;
	}
}
