import { getContext, setContext } from 'svelte';
import { TodoCategories } from './todos.svelte';

export const TODOS_CONTEXT_KEY = Symbol();

export function getTodoCategories() {
	return getContext<TodoCategories | undefined>(TODOS_CONTEXT_KEY);
}

export function setTodoCategories(store: TodoCategories) {
	return setContext(TODOS_CONTEXT_KEY, store);
}
