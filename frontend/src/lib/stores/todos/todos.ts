import { writable } from 'svelte/store';
import type { NullableOrderedItem, TodoCategory, TodoItem } from '$lib/generated-client/models';
import { getTodoCategoryRightId, setTodoCategoryRightId, setTodoItemLeftId } from './sort';
import {
	sortedTodos,
	getTodoItemRightId,
	setTodoItemRightId,
	updateElementSort,
	sortedCategories,
	getTodoCategoryLeftId,
	setTodoCategoryLeftId,
	getTodoItemLeftId,
	removeElementFromSortedList
} from './sort';

const { set: _set, subscribe, update: _update } = writable<TodoCategory[]>([]);

const addTodo = (todo: TodoItem, skipSort = false): void => {
	_update((categories) => {
		return categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items.push(todo);

			if (!skipSort) {
				category.items = sortedTodos(category.items);
			}

			return category;
		});
	});
};

const removeTodo = (todo: TodoItem, skipSort = false) => {
	_update((categories) => {
		return categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}

			removeElementFromSortedList(
				category.items,
				todo.id,
				getTodoItemLeftId,
				getTodoItemRightId,
				setTodoItemLeftId,
				setTodoItemRightId
			);

			if (!skipSort) {
				category.items = sortedTodos(category.items.filter((value) => value.id !== todo.id));
			}

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
	movingElement: TodoItem,
	movingElementNewCategoryId: number,
	newOrder: NonNullable<TodoItem['order']>,
	skipSort = false
) => {
	if (movingElement.category_id !== movingElementNewCategoryId) {
		removeTodo(movingElement);
		addTodo({ ...movingElement, category_id: movingElementNewCategoryId }, true);
		movingElement.category_id = movingElementNewCategoryId;
	}
	_update((categories) => {
		categories = categories.map<TodoCategory>((category) => {
			if (category.id !== movingElement.category_id) {
				return category;
			}
			updateElementSort(
				category.items,
				movingElement.id,
				{ leftId: newOrder.left_id, rightId: newOrder.right_id },
				getTodoItemLeftId,
				getTodoItemRightId,
				setTodoItemLeftId,
				setTodoItemRightId
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
		removeElementFromSortedList(
			categories,
			category.id,
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);
		return categories.filter((value) => value.id !== category.id);
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
	movingElement: TodoCategory,
	newOrder: NonNullable<NullableOrderedItem>,
	skipSort = false
) => {
	_update((categories) => {
		updateElementSort(
			categories,
			movingElement.id,
			{ leftId: newOrder.left_id, rightId: newOrder.right_id },
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
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
