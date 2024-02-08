import type { Project } from '$lib/generated-client/models';
import { sortByIdInPlace } from '../todos/sort';

class Projects {
	private _projects = $state<Project[]>([]);

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

	get current() {
		return this._projects;
	}
}

export const projects = new Projects();

export default projects;
