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
			_sortTodos(category.items);
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

const updateTodo = (todo: TodoItem) => {
	_update((categories) => {
		return categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items = category.items.map((value) => {
				if (value.id !== todo.id) {
					return value;
				}
				return todo;
			});
			_sortTodos(category.items);
			return category;
		});
	});
};

const addCategory = (category: TodoCategory) => {
	_update((categories) => {
		_sortTodos(category.items);
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
	_set(
		categories.map((category) => {
			_sortTodos(category.items);
			return category;
		})
	);
};

const clearTodoCategories = () => {
	_set([]);
};

function _sortTodos(todos: TodoItem[]) {
	console.log('--------');
	console.log(todos);
	todos.sort((a, b) => {
		let state: 'same-place' | 'go-up' | 'go-down' = 'same-place';

		if (a.order != b.order) {
			state = a.order > b.order ? 'go-up' : 'go-down';
		}

		if (state == 'same-place') {
			state = a.id > b.id ? 'go-up' : 'go-down';
		}

		if (a.is_done != b.is_done) {
			state = a.is_done ? 'go-down' : 'go-up';
		}

		switch (state) {
			case 'go-up':
				return -1;
			case 'go-down':
				return 1;
		}
	});
	console.log(todos);
	console.log('--------');
}

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
