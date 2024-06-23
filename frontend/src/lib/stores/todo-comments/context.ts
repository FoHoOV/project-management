import { getContext, setContext } from '$lib/stores';
import { TodoComments } from './todo-comments.svelte';

export const TODO_COMMENTS_CONTEXT_KEY = Symbol();

export function getTodoComments() {
	return getContext<TodoComments | undefined>(TODO_COMMENTS_CONTEXT_KEY);
}

export function setTodoComments(store: TodoComments, setToRoot: boolean = true) {
	return setContext(store, TODO_COMMENTS_CONTEXT_KEY, setToRoot);
}
