import { writable } from 'svelte/store';
import type { TodoCategory, TodoItem } from '$lib/generated-client/models';

const { set: _set, subscribe, update: _update } = writable<TodoCategory[]>([]);

const addTodo = (todo: TodoItem): void => {
	_update((categories) => {
		return categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items.push(todo);
			category.items = _sortedTodos(category.items);
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
			category.items = _sortedTodos(category.items);
			return category;
		});
	});
};

const addCategory = (category: TodoCategory) => {
	_update((categories) => {
		category.items = _sortedTodos(category.items);
		categories.push(category);
		categories = _sortedCategories(categories);
		return categories;
	});
};

const updateCategory = (category: TodoCategory) => {
	_update((categories) => {
		categories = categories.map<TodoCategory>((value) => {
			if (value.id !== category.id) {
				return value;
			}
			category.items = _sortedTodos(category.items);
			return category;
		});
		categories = _sortedCategories(categories);
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
			category.items = _sortedTodos(category.items);
			return category;
		})
	);
};

const clearTodoCategories = () => {
	_set([]);
};

function _sortedTodos(todos: TodoItem[]) {
	_sortById(todos);
	return _sortByCustomOrder(todos, (element) => {
		return (element as TodoItem).order?.next_id;
	});
}

function _sortedCategories(categories: TodoCategory[]) {
	_sortById(categories);
	return _sortByCustomOrder(categories, (element) => {
		return (element as TodoCategory).orders.length === 1
			? (element as TodoCategory).orders[0].next_id
			: null;
	});
}

function _sortByCustomOrder<T extends { id: number }>(
	elements: T[],
	getNextId: (element: T) => number | null | undefined
) {
	elements.forEach((element, index) => {
		const nextId = getNextId(element);

		if (nextId === null) {
			return;
		}

		const nextElementIndex = elements.findIndex((value) => value.id == nextId);
		const savedNextElement = elements[index + 1];

		if (nextElementIndex === -1) {
			throw new Error(`could't find next element with id = ${nextElementIndex}`);
		}

		elements[index + 1] = elements[nextElementIndex];
		elements[nextElementIndex] = savedNextElement;
	});

	return elements.filter((element) => element != null);
}

function _sortById(elements: { id: number }[]) {
	elements.sort((a, b) => {
		let state: 'same-place' | 'go-left' | 'go-right' = 'same-place';

		if (a.id !== b.id) {
			state = a.id > b.id ? 'go-left' : 'go-right';
		}

		switch (state) {
			case 'go-left':
				return -1;
			case 'go-right':
				return 1;
			case 'same-place':
				return 0;
		}
	});
}

export default {
	setTodoCategories,
	addTodo,
	addCategory,
	updateCategory,
	removeCategory,
	removeTodo,
	updateTodo,
	clearTodoCategories,
	subscribe
};
