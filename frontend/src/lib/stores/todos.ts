import { writable } from 'svelte/store';
import type { Todo } from '$lib/client/models/Todo';

const { set: _set, subscribe, update: _update } = writable<Todo[]>([]);

const addTodo = (todo: Todo): void => {
	_update((value) => {
		return [...value, todo];
	});
};

const removeTodo = (todo: Todo) => {
	_update((value) => {
		return value.filter((value) => value.id !== todo.id);
	});
};

const updateTodo = (todo: Todo, isDone: boolean) => {
	_update((todos) => {
		return todos.map((value) => {
			if(value.id !== todo.id) {
				return value;
			}
			value.is_done = isDone;
			return value;
		});
	});
};

const setTodos = (todos: Todo[]) => {
	_set(todos);
};

const clearTodos = () => {
	_set([]);
};

export default { addTodo, setTodos, removeTodo, updateTodo, clearTodos, subscribe };
