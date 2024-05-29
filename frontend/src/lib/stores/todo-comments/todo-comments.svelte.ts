import type { TodoComment } from '$lib/generated-client/models';
import { TodoCategories } from '../todos';

export class TodoComments {
	private _comments = $state<TodoComment[]>([]);
	private _todoCategoriesStore?: TodoCategories = undefined;

	constructor(_todoCategoriesStore?: TodoCategories) {
		this._todoCategoriesStore = _todoCategoriesStore;
	}

	set(comments: TodoComment[]) {
		this._comments = comments;
	}

	add(comment: TodoComment) {
		this._comments.push(comment);
		this._todoCategoriesStore?.increaseTodoCommentsCounter(comment.todo_id);
	}

	update(comment: TodoComment) {
		this._comments = this._comments.map((value) => {
			if (value.id != comment.id) {
				return value;
			}
			return comment;
		});
	}

	remove(comment: TodoComment) {
		this._comments = this._comments.filter((value) => value.id != comment.id);
		this._todoCategoriesStore?.decreaseTodoCommentsCounter(comment.todo_id);
	}

	get value$() {
		return this._comments;
	}
}
