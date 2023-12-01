import type { TodoCategory, TodoItem } from '$lib/generated-client/models';

export function getTodoItemNextId(todo: TodoItem) {
	return todo.order?.next_id ?? null;
}

export function setTodoItemNextId(todo: TodoItem, nextId: number | null) {
	todo.order = { next_id: nextId };
}

export function getTodoCategoryNextId(todoCategory: TodoCategory) {
	return todoCategory.orders.length === 1 ? todoCategory.orders[0].next_id : null;
}

export function setTodoCategoryNextId(todoCategory: TodoCategory, nextId: number | null) {
	todoCategory.orders = [{ next_id: nextId }];
}

export function sortedTodos(todos: TodoItem[]) {
	sortById(todos);
	return sortByCustomOrder(todos, getTodoItemNextId);
}

export function sortedCategories(categories: TodoCategory[]) {
	sortById(categories);
	return sortByCustomOrder(categories, getTodoCategoryNextId);
}

export function sortByCustomOrder<T extends { id: number }>(
	elements: (T | null)[],
	getNextId: (element: T) => number | null | undefined
) {
	// improve later
	let index = 0;
	let mutations = 0;

	const increaseIndex = () => {
		index += 1;
		if (index >= elements.length && mutations > 0) {
			// if the list had mutations it is not sorted yet
			// mutations should be 0 when the list is sorted
			index = 0;
			mutations = 0;
		}
	};

	const movedIds: number[] = [];

	const moveCurrentToLeftOfNext = (
		currentIndex: number,
		nextElementIndex: number,
		currentElement: T
	) => {
		if (elements[nextElementIndex == 0 ? 0 : nextElementIndex - 1]?.id === currentElement.id) {
			return;
		}
		elements[currentIndex] = null;
		elements.splice(nextElementIndex, 0, currentElement);
		mutations += 1;
		movedIds.push(currentElement.id);
	};

	const moveOtherToRightOfCurrent = (
		currentIndex: number,
		nextElementIndex: number,
		currentElement: T
	) => {
		if (elements[nextElementIndex == 0 ? 0 : nextElementIndex + 1]?.id === currentElement.id) {
			return;
		}

		const nextId = elements[nextElementIndex]?.id as number;
		elements[currentIndex] = null;
		elements.splice(nextElementIndex + 1, 0, currentElement);
		mutations += 1;
		movedIds.push(nextId);
	};

	while (index < elements.length) {
		const element = elements[index];

		if (element === null) {
			increaseIndex();
			continue;
		}

		const nextId = getNextId(element);

		if (nextId === null || nextId === undefined) {
			increaseIndex();
			continue;
		}

		const nextElementIndex = elements.findIndex((value) => value?.id == nextId);

		if (nextElementIndex === -1) {
			throw new Error(`could't find next element with id = ${nextElementIndex}`);
		}

		if (nextId < element.id) {
			moveCurrentToLeftOfNext(index, nextElementIndex, element);
		} else {
			moveOtherToRightOfCurrent(index, nextElementIndex, element);
		}

		increaseIndex();
	}

	return elements.filter((element) => element != null) as T[];
}

export function sortById(elements: { id: number }[]) {
	elements.sort((a, b) => {
		return b.id - a.id;
	});
}

export function updateElementSort<T extends { id: number }>(
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
