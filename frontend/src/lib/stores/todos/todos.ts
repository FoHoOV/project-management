import { writable } from 'svelte/store';
import type { TodoCategory, TodoItem } from '$lib/generated-client/models';
import {
	sortedTodos,
	getTodoItemNextId,
	setTodoItemNextId,
	updateElementSort,
	sortedCategories,
	getTodoCategoryNextId,
	setTodoCategoryNextId
} from './sort';

const { set: _set, subscribe, update: _update } = writable<TodoCategory[]>([]);

const addTodo = (todo: TodoItem): void => {
	_update((categories) => {
		return categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items.push(todo);
			category.items = sortedTodos(category.items);
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
			category.items.forEach((item) => {
				if (getTodoItemNextId(item) === todo.id) {
					setTodoItemNextId(item, getTodoItemNextId(todo));
				}
			});
			category.items = sortedTodos(category.items.filter((value) => value.id !== todo.id));
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
			category.items = sortedTodos(category.items);
			return category;
		});
	});
};

const updateTodoSort = (
	todo: Omit<TodoItem, 'order'> & { order: { next_id: number } },
	oldNextId: number | null | undefined,
	skipSort = false
) => {
	_update((categories) => {
		categories = categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			updateElementSort(
				category.items,
				{
					...todo,
					oldNextId: oldNextId ?? null,
					newNextId: todo.order.next_id
				},
				getTodoItemNextId,
				setTodoItemNextId
			);

			if (!skipSort) {
				category.items = sortedTodos(category.items);
			}

			return category;
		});
		categories = sortedCategories(categories);
		return categories;
	});
};

const addCategory = (category: TodoCategory) => {
	_update((categories) => {
		category.items = sortedTodos(category.items);
		categories.push(category);
		categories = sortedCategories(categories);
		return categories;
	});
};

const updateCategory = (category: TodoCategory) => {
	_update((categories) => {
		categories = categories.map<TodoCategory>((value) => {
			if (value.id !== category.id) {
				return value;
			}
			category.items = sortedTodos(category.items);
			return category;
		});
		categories = sortedCategories(categories);
		return categories;
	});
};

const removeCategory = (category: TodoCategory) => {
	_update((categories) => {
		const result = categories.filter((value) => value.id !== category.id);
		result.forEach((value) => {
			if (getTodoCategoryNextId(value) === category.id) {
				setTodoCategoryNextId(value, getTodoCategoryNextId(category));
			}
		});
		return sortedCategories(result);
	});
};

const setTodoCategories = (categories: TodoCategory[]) => {
	_set(
		sortedCategories(
			categories.map((category) => {
				category.items = sortedTodos(category.items);
				return category;
			})
		)
	);
};

const clearTodoCategories = () => {
	_set([]);
};

const updateCategoriesSort = (
	category: Omit<TodoCategory, 'orders'> & { order: { next_id: number } },
	oldNextId: number | null,
	skipSort = false
) => {
	_update((categories) => {
		updateElementSort(
			categories,
			{ ...category, oldNextId: oldNextId, newNextId: category.order.next_id },
			getTodoCategoryNextId,
			setTodoCategoryNextId
		);
		return skipSort ? categories : sortedCategories(categories);
	});
};

export default {
	setTodoCategories,
	addTodo,
	addCategory,
	updateCategory,
	updateCategoriesSort,
	removeCategory,
	removeTodo,
	updateTodo,
	updateTodoSort,
	clearTodoCategories,
	subscribe
};
