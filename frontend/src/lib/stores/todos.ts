import { writable } from 'svelte/store';
import type { TodoCategory, TodoItem } from '$lib/generated-client/models';

const { set: _set, subscribe, update: _update } = writable<TodoCategory[]>([]);

const addTodo = (todo: TodoItem): void => {
	_update((categories) => {
		return categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items.unshift(todo);
			return category;
		});
	});
};

const removeTodo = (todo: TodoItem) => {
	_update((categories) => {
		return categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items = category.items.filter((value) => value.id !== todo.id);
			return category;
		});
	});
};

const updateTodo = (todo: TodoItem, isDone: boolean) => {
	_update((categories) => {
		return categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items.forEach((value) => {
				if (value.id !== todo.id) {
					return;
				}
				value.is_done = isDone;
			});
			return category;
		});
	});
};

const addCategory = (category: TodoCategory) => {
	_update((categories) => {
		categories.unshift(category);
		return categories;
	});
};

const removeCategory = (category: TodoCategory) => {
	_update((categories) => {
		return categories.filter((value) => value.id !== category.id);
	});
};

const setTodoCategories = (categories: TodoCategory[]) => {
	_set(categories);
};

const clearTodoCategories = () => {
	_set([]);
};

export default {
	setTodoCategories,
	addTodo,
	addCategory,
	removeCategory,
	removeTodo,
	updateTodo,
	clearTodoCategories,
	subscribe
};
