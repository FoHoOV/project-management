import { writable } from 'svelte/store';
import type { TodoComment } from '$lib/generated-client/models';
import todos from '../todos';

const { subscribe, update: _update, set: _set } = writable<TodoComment[]>([]);

const setOpenedTodoComments = (comments: TodoComment[]) => {
	_set(comments);
};

const addComment = (comment: TodoComment) => {
	_update((comments) => [comment, ...comments]);
	todos.increaseTodoCommentsCounter(comment.todo_id);
};

const updateComment = (comment: TodoComment) => {
	_update((comments) => {
		return comments.map((value) => {
			if (value.id != comment.id) {
				return value;
			}
			return comment;
		});
	});
};

const deleteComment = (comment: TodoComment) => {
	_update((comments) => {
		return comments.filter((value) => value.id != comment.id);
	});
	todos.decreaseTodoCommentsCounter(comment.todo_id);
};

export default {
	setOpenedTodoComments,
	addComment,
	updateComment,
	deleteComment,
	subscribe
};
