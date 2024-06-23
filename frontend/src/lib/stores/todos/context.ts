import { getContext, setContext } from '$lib/stores';
import { TodoCategories } from './todos.svelte';

export const TODOS_CONTEXT_KEY = Symbol();

export function getTodoCategories() {
	return getContext<TodoCategories | undefined>(TODOS_CONTEXT_KEY);
}

export function setTodoCategories(store: TodoCategories, setToRoot: boolean = true) {
	return setContext(store, TODOS_CONTEXT_KEY, setToRoot);
}
