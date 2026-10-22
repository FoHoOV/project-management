import { getContext, setContext } from 'svelte';
import type { TodoActions } from './todo-actions';

export const TODO_ACTIONS_CONTEXT_KEY = Symbol();

export function getTodoActions() {
	return getContext<TodoActions | undefined>(TODO_ACTIONS_CONTEXT_KEY);
}

export function setTodoActions(actions: TodoActions) {
	return setContext(TODO_ACTIONS_CONTEXT_KEY, actions);
}
