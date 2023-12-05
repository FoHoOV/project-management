import type { TodoCategory, TodoItem } from '$lib/generated-client/models';

export function getTodoItemNextId(todo: TodoItem) {
	return todo.order?.next_id ?? null;
}

export function setTodoItemNextId(todo: TodoItem, nextId: number | null) {
	todo.order = { moving_id: todo.id, ...todo.order, next_id: nextId };
}

export function getTodoItemMovingId(todo: TodoItem) {
	return todo.order?.moving_id;
}

export function setTodoItemMovingId(todo: TodoItem, movingId: number) {
	todo.order = { next_id: null, ...todo.order, moving_id: movingId };
}

export function getTodoCategoryNextId(todoCategory: TodoCategory) {
	return todoCategory.orders.length === 1 ? todoCategory.orders[0].next_id : null;
}

export function setTodoCategoryNextId(todoCategory: TodoCategory, nextId: number | null) {
	const existingOrder = todoCategory.orders.length > 0 ? { ...todoCategory.orders[0] } : {};
	todoCategory.orders = [{ moving_id: todoCategory.id, ...existingOrder, next_id: nextId }];
}

export function getTodoCategoryMovingId(todoCategory: TodoCategory) {
	return todoCategory.orders.length === 1 ? todoCategory.orders[0].moving_id : undefined;
}
export function setTodoCategoryMovingId(todoCategory: TodoCategory, movingId: number) {
	const existingOrder = todoCategory.orders.length > 0 ? { ...todoCategory.orders[0] } : {};
	todoCategory.orders = [{ next_id: null, ...existingOrder, moving_id: movingId }];
}
export function sortedTodos(todos: TodoItem[]) {
	sortById(todos);
	return sortByCustomOrder(todos, getTodoItemNextId, getTodoItemMovingId);
}

export function sortedCategories(categories: TodoCategory[]) {
	sortById(categories);
	return sortByCustomOrder(categories, getTodoCategoryNextId, getTodoCategoryMovingId);
}

export function sortByCustomOrder<T extends { id: number }>(
	elements: (T | null)[],
	getNextId: (element: T) => number | null | undefined,
	getMovingId: (element: T) => number | undefined
) {
	const MAX_NUMBER_OF_REASONABLE_ITERATIONS = elements.length * elements.length * elements.length;
	// improve later
	let index = 0;
	let mutations = 0;
	let numberOfIterations = 0;
	let movedElementIds: number[] = [];

	const increaseIndex = () => {
		index += 1;
		if (index >= elements.length && mutations > 0) {
			// if the list had mutations it is not sorted yet
			// mutations should be 0 when the list is sorted
			index = 0;
			mutations = 0;
			movedElementIds = [];
		}
	};

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
		movedElementIds.push(currentElement.id);
	};

	const moveOtherToRightOfCurrent = (
		currentIndex: number,
		nextElementIndex: number,
		nextId: number
	) => {
		if (
			elements[currentIndex == elements.length - 1 ? currentIndex : currentIndex + 1]?.id === nextId
		) {
			return;
		}
		const savedNextElement = elements[nextElementIndex];
		elements[nextElementIndex] = null;
		elements.splice(currentIndex + 1, 0, savedNextElement);
		mutations += 1;
		movedElementIds.push(nextId);
	};

	const updateNumberOfIterations = () => {
		numberOfIterations += 1;
		if (numberOfIterations > MAX_NUMBER_OF_REASONABLE_ITERATIONS) {
			throw new Error('reached maximum number of iterations');
		}
	};

	while (index < elements.length) {
		updateNumberOfIterations();

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

		if (nextId == element.id) {
			throw new Error('database error, for some reason element.next = element.id');
		}

		if (
			getMovingId(element) === element.id &&
			!movedElementIds.find((value) => value == element.id)
		) {
			moveCurrentToLeftOfNext(index, nextElementIndex, element);
		} else {
			moveOtherToRightOfCurrent(index, nextElementIndex, nextId);
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
	newOrder: {
		id: number;
		nextId: number;
	},
	movingElementId: number,
	getNextId: (element: T) => number | null,
	getMovingId: (element: T) => number | undefined,
	setNextId: (element: T, nextId: number | null) => void,
	setMovingId: (element: T, movingId: number) => void
) {
	console.log(JSON.stringify(elements));

	const movingElement = elements.find((value) => value.id == movingElementId);

	if (!movingElement) {
		throw new Error('moving element not found in dataset');
	}

	removeElementFromSortedList(
		elements,
		movingElementId,
		getNextId,
		getMovingId,
		setNextId,
		setMovingId
	);

	if (movingElementId == newOrder.id) {
		// X 4 3 2 1 Y
		// 4 -> 1 with (moving = 4): X 3 2 4 1 Y
		// or
		// X 4 3 2 1 Y
		// 1 -> 4 with (moving = 1): X 1 4 3 2 Y

		const existingElementPointingToNewNext = elements.find(
			(value) => getNextId(value) == newOrder.nextId
		);

		let movingElementNewMovingId: number | undefined;

		if (
			existingElementPointingToNewNext &&
			getMovingId(existingElementPointingToNewNext) == newOrder.nextId
		) {
			movingElementNewMovingId = newOrder.nextId;
		} else {
			movingElementNewMovingId = movingElementId;
		}

		if (existingElementPointingToNewNext) {
			setNextId(existingElementPointingToNewNext, movingElementId);
			if (getMovingId(existingElementPointingToNewNext) == newOrder.nextId) {
				setMovingId(existingElementPointingToNewNext, movingElementId);
			}
		}
		setNextId(movingElement, newOrder.nextId);
		setMovingId(movingElement, movingElementNewMovingId);
	} else if (movingElementId == newOrder.nextId) {
		// X 4 3 2 1 Y
		// 4 -> 1 with (moving = 1): X 4 1 3 2 Y
		// or
		// X 4 3 2 1 Y
		// 1 -> 4 with (moving = 4): X 3 2 1 4 Y

		const elementWithNewOrderId = elements.find((value) => value.id == newOrder.id);
		if (!elementWithNewOrderId) {
			throw new Error('elementWithNewOrder.id not found in dataset');
		}

		if (getNextId(elementWithNewOrderId)) {
			let movingElementNewMovingId: number | undefined;
			if (getMovingId(elementWithNewOrderId) == newOrder.id) {
				movingElementNewMovingId = movingElementId;
			} else {
				movingElementNewMovingId = getMovingId(elementWithNewOrderId);
			}
			if (movingElementNewMovingId == undefined) {
				throw new Error(
					'unexpected behavior, calculated movingElementMovingId was undefined whilst updating elements sorting'
				);
			}
			setMovingId(movingElement, movingElementNewMovingId);
		}

		setNextId(movingElement, getNextId(elementWithNewOrderId));
		setNextId(elementWithNewOrderId, movingElementId);
		setMovingId(elementWithNewOrderId, movingElementId);
	} else {
		throw new Error('unhandled sorting case');
	}

	console.log(JSON.stringify(elements));
}

export function removeElementFromSortedList<T extends { id: number }>(
	elements: T[],
	deletingElementId: number,
	getNextId: (element: T) => number | null,
	getMovingId: (element: T) => number | undefined,
	setNextId: (element: T, nextId: number | null) => void,
	setMovingId: (element: T, movingId: number) => void
) {
	console.log(JSON.stringify(elements));

	const deletingElement = elements.find((value) => value.id == deletingElementId);

	if (!deletingElement) {
		throw new Error('deletingElement element not found in dataset');
	}

	const existingItemPointingToDeletingItem = elements.find(
		(value) => getNextId(value) == deletingElementId
	);

	if (existingItemPointingToDeletingItem) {
		let movingId: number;
		if (getMovingId(existingItemPointingToDeletingItem) == deletingElementId) {
			movingId = existingItemPointingToDeletingItem.id;
		} else {
			const deletingItemNextId = getNextId(deletingElement);
			movingId =
				deletingItemNextId !== null ? deletingItemNextId : existingItemPointingToDeletingItem.id;
		}
		setNextId(existingItemPointingToDeletingItem, getNextId(deletingElement));
		setMovingId(existingItemPointingToDeletingItem, movingId);
	}

	setNextId(deletingElement, null);

	console.log(JSON.stringify(elements));
}
