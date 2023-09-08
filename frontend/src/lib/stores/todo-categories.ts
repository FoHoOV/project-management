import { writable } from 'svelte/store';
import type { TodoCategory, TodoItem } from '$lib/client/models';

const { set: _set, subscribe, update: _update } = writable<TodoCategory[]>([]);

const addTodo = (todo: TodoItem): void => {
	_update((categories) => {
		return categories.map((category) => {
			if (category.id !== todo.id) {
				return category;
			}
			category.todos.push(todo);
			return category;
		});
	});
};

const removeTodo = (todo: TodoItem) => {
	_update((categories) => {
		return categories.map((category) => {
			if (category.id !== todo.id) {
				return category;
			}
			category.todos = category.todos.filter((value) => value.id !== todo.id);
			return category;
		});
	});
};

const updateTodo = (todo: TodoItem, isDone: boolean) => {
	_update((categories) => {
		return categories.map((category) => {
			if (category.id !== todo.id) {
				return category;
			}
			category.todos.map((value) => {
				if (value.id !== todo.id) {
					return value;
				}
				value.is_done = isDone;
				return value;
			});
			return category;
		});
	});
};

const addCategory = (category: TodoCategory) => {
	_update((categories) => [...categories, category]);
};

const setTodoCategories = (categories: TodoCategory[]) => {
	_set(categories);
};

const clearTodoCategories = () => {
	_set([]);
};

export default {
	addTodo,
	addCategory,
	setTodoCategories,
	removeTodo,
	updateTodo,
	clearTodoCategories,
	subscribe
};
