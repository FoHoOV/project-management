import type { TodoComment } from '$lib/generated-client/models';
import { todoCategories } from '../todos';

class TodoComments {
	private _comments = $state<TodoComment[]>([]);

	set(comments: TodoComment[]) {
		this._comments = comments;
	}

	add(comment: TodoComment) {
		this._comments.push(comment);
		todoCategories.increaseTodoCommentsCounter(comment.todo_id);
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
		todoCategories.decreaseTodoCommentsCounter(comment.todo_id);
	}

	get current() {
		return this._comments;
	}
}

export const todoComments = new TodoComments();

export default todoComments;
