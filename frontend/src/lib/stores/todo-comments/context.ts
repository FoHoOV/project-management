import { getContext, setContext } from 'svelte';
import { TodoComments } from './todo-comments.svelte';

export const TODO_COMMENTS_CONTEXT_KEY = Symbol();

export function getTodoComments() {
	return getContext<TodoComments | undefined>(TODO_COMMENTS_CONTEXT_KEY);
}

export function setTodoComments(store: TodoComments) {
	return setContext(TODO_COMMENTS_CONTEXT_KEY, store);
}
