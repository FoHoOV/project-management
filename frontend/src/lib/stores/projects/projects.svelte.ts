import type { Project } from '$lib/generated-client/models';
import { sortByIdInPlace } from '../todos/sort';

class Projects {
	private _projects = $state<Project[]>([]);

	set(projects: Project[]) {
		this._projects = projects;
		sortByIdInPlace(this.projects, true);
	}

	add(project: Project) {
		this._projects.push(project);
		sortByIdInPlace(this.projects, true);
	}

	update(project: Project) {
		this._projects = this._projects.map((value) => {
			if (value.id != project.id) {
				return value;
			}
			return project;
		});
		sortByIdInPlace(this.projects, true);
	}

	remove(project: Project) {
		this._projects = this._projects.filter((value) => value.id != project.id);
	}

	get projects() {
		return this._projects;
	}
}

export const projects = new Projects();

export default projects;
