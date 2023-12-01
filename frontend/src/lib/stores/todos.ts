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

const updateTodoSort = (
	todo: Omit<TodoItem, 'order'> & { order: { next_id: number } },
	oldNextId: number | null | undefined
) => {
	_update((categories) => {
		categories = categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			_updateElementSort(
				category.items,
				{
					...todo,
					oldNextId: oldNextId ?? null,
					newNextId: todo.order.next_id
				},
				_getTodoItemNextId,
				_setTodoItemNextId
			);
			category.items = _sortedTodos(category.items);
			return category;
		});
		categories = _sortedCategories(categories);
		return categories;
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
		_sortedCategories(
			categories.map((category) => {
				category.items = _sortedTodos(category.items);
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
	oldNextId: number | null
) => {
	_update((categories) => {
		_updateElementSort(
			categories,
			{ ...category, oldNextId: oldNextId, newNextId: category.order.next_id },
			_getTodoCategoryNextId,
			_setTodoCategoryNextId
		);
		return _sortedCategories(categories);
	});
};

function _getTodoItemNextId(todo: TodoItem) {
	return todo.order?.next_id ?? null;
}

function _setTodoItemNextId(todo: TodoItem, nextId: number | null) {
	todo.order = { next_id: nextId };
}

function _getTodoCategoryNextId(todoCategory: TodoCategory) {
	return todoCategory.orders.length === 1 ? todoCategory.orders[0].next_id : null;
}

function _setTodoCategoryNextId(todoCategory: TodoCategory, nextId: number | null) {
	todoCategory.orders = [{ next_id: nextId }];
}

function _sortedTodos(todos: TodoItem[]) {
	_sortById(todos);
	return _sortByCustomOrder(todos, _getTodoItemNextId);
}

function _sortedCategories(categories: TodoCategory[]) {
	_sortById(categories);
	return _sortByCustomOrder(categories, _getTodoCategoryNextId);
}

function _sortByCustomOrder<T extends { id: number }>(
	elements: (T | null)[],
	getNextId: (element: T) => number | null | undefined
) {
	// improve later
	let index = 0;
	let alters = 0;

	const increaseIndex = () => {
		index += 1;
		if (index >= elements.length && alters > 0) {
			index = 0;
			alters = 0;
		}
	};

	while (index < elements.length) {
		const element = elements[index];

		if (element === null) {
			increaseIndex();
			continue;
		}

		const nextId = getNextId(element);

		if (nextId === null) {
			increaseIndex();
			continue;
		}

		const nextElementIndex = elements.findIndex((value) => value?.id == nextId);

		if (nextElementIndex === -1) {
			throw new Error(`could't find next element with id = ${nextElementIndex}`);
		}

		const newElementIndex = nextElementIndex == 0 ? 0 : nextElementIndex;
		if (elements[newElementIndex == 0 ? 0 : newElementIndex - 1]?.id !== element.id) {
			elements[index] = null;
			elements.splice(newElementIndex, 0, element);
			alters += 1;
		}

		increaseIndex();
	}

	return elements.filter((element) => element != null) as T[];
}

function _sortById(elements: { id: number }[]) {
	elements.sort((a, b) => {
		return b.id - a.id;
	});
}

function _updateElementSort<T extends { id: number }>(
	elements: T[],
	elementWithNewOrder: {
		id: number;
		oldNextId: number | null;
		newNextId: number;
	},
	getNextId: (element: T) => number | null,
	setNextId: (element: T, nextId: number | null) => void
) {
	console.log(JSON.stringify(elements));

	const existingItemPointingToUpdatingElement = elements.find(
		(element) => getNextId(element) === elementWithNewOrder.id
	);

	if (existingItemPointingToUpdatingElement) {
		setNextId(existingItemPointingToUpdatingElement, elementWithNewOrder.oldNextId);
	}

	const existingItemWithNewNext = elements.find(
		(element) => getNextId(element) === elementWithNewOrder.newNextId
	);

	if (existingItemWithNewNext) {
		setNextId(existingItemWithNewNext, elementWithNewOrder.id);
	}

	const currentElement = elements.find((element) => element.id == elementWithNewOrder.id);

	if (!currentElement) {
		throw new Error('current element not found in dataset');
	}

	setNextId(currentElement, elementWithNewOrder.newNextId);
	console.log(JSON.stringify(elements));
}

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
