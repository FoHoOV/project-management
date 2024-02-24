import type { TodoCategory, TodoCategoryPartialTodoItem } from '$lib/generated-client/models';

export function getTodoItemLeftId(todo: TodoCategoryPartialTodoItem) {
	return todo.order?.left_id ?? null;
}

export function setTodoItemLeftId(todo: TodoCategoryPartialTodoItem, leftId: number | null) {
	todo.order = { ...todo.order, left_id: leftId };
}

export function getTodoItemRightId(todo: TodoCategoryPartialTodoItem) {
	return todo.order?.right_id ?? null;
}

export function setTodoItemRightId(todo: TodoCategoryPartialTodoItem, rightId: number | null) {
	todo.order = { ...todo.order, right_id: rightId };
}

export function getTodoCategoryLeftId(todoCategory: TodoCategory) {
	return todoCategory.orders.length === 1 ? todoCategory.orders[0].left_id : null;
}

export function setTodoCategoryLeftId(todoCategory: TodoCategory, leftId: number | null) {
	const existingOrder = todoCategory.orders.length > 0 ? { ...todoCategory.orders[0] } : {};
	todoCategory.orders = [{ right_id: null, ...existingOrder, left_id: leftId }];
}

export function getTodoCategoryRightId(todoCategory: TodoCategory) {
	return todoCategory.orders.length === 1 ? todoCategory.orders[0].right_id : null;
}
export function setTodoCategoryRightId(todoCategory: TodoCategory, rightId: number | null) {
	const existingOrder = todoCategory.orders.length > 0 ? { ...todoCategory.orders[0] } : {};
	todoCategory.orders = [{ left_id: null, ...existingOrder, right_id: rightId }];
}

/**
 * mutates the original elements array, always replace the returned list with the original
 */
export function getSortedTodos(todos: TodoCategoryPartialTodoItem[]) {
	sortByIdInPlace(todos, false);
	return sortByCustomOrder(todos, getTodoItemLeftId, getTodoItemRightId);
}

/**
 * mutates the original elements array, always replace the returned list with the original
 */
export function getSortedTodoCategories(categories: TodoCategory[]) {
	sortByIdInPlace(categories, true);
	return sortByCustomOrder(categories, getTodoCategoryLeftId, getTodoCategoryRightId);
}

/**
 * mutates the original elements array, always replace the returned list with the original
 */
export function sortByCustomOrder<T extends { id: number }>(
	elements: (T | null)[],
	getLeftId: (element: T) => number | null,
	getRightId: (element: T) => number | null
) {
	const MAX_NUMBER_OF_REASONABLE_ITERATIONS = elements.length * elements.length * elements.length;
	// improve later
	let index = 0;
	let mutations = 0;
	let numberOfIterations = 0;
	//let movedElementIds: number[] = [];

	const increaseIndex = () => {
		index += 1;
		if (index >= elements.length && mutations > 0) {
			// if the list had mutations it is not sorted yet
			// mutations should be 0 when the list is sorted
			index = 0;
			mutations = 0;
			//movedElementIds = [];
		}
	};

	const moveCurrentToLeftOfOther = (
		currentIndex: number,
		rightElementIndex: number,
		rightId: number
	) => {
		if (
			elements[currentIndex == elements.length - 1 ? currentIndex : currentIndex + 1]?.id ===
			rightId
		) {
			return;
		}
		const savedCurrentElement = elements[currentIndex];
		elements[currentIndex] = null;
		elements.splice(rightElementIndex, 0, savedCurrentElement);
		mutations += 1;
		//movedElementIds.push(nextId);
	};

	const moveCurrentToRightOfOther = (
		currentIndex: number,
		leftElementIndex: number,
		leftId: number
	) => {
		if (elements[currentIndex == 0 ? currentIndex : currentIndex - 1]?.id === leftId) {
			return;
		}
		const savedCurrentElement = elements[currentIndex];
		elements[currentIndex] = null;
		elements.splice(leftElementIndex + 1, 0, savedCurrentElement);
		mutations += 1;
		//movedElementIds.push(nextId);
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

		const leftId = getLeftId(element);

		if (leftId !== null) {
			const leftElementIndex = elements.findIndex((value) => value?.id == leftId);

			if (leftElementIndex === -1) {
				throw new Error(`could't find next element with id = ${leftId}`);
			}

			if (leftId == element.id) {
				throw new Error('database error: for some reason element.leftId = element.id');
			}

			moveCurrentToRightOfOther(index, leftElementIndex, leftId);
			increaseIndex();
			continue;
		}

		const rightId = getRightId(element);

		if (rightId !== null) {
			const rightElementIndex = elements.findIndex((value) => value?.id == rightId);

			if (rightElementIndex === -1) {
				throw new Error(`could't find next element with id = ${rightId}`);
			}

			if (rightId == element.id) {
				throw new Error('database error: for some reason element.rightId = element.id');
			}

			moveCurrentToLeftOfOther(index, rightElementIndex, rightId);
			increaseIndex();
			continue;
		}

		increaseIndex();
	}

	return elements.filter((element) => element != null) as T[];
}

export function sortByIdInPlace(elements: { id: number }[], ascending: boolean) {
	elements.sort((a, b) => {
		return ascending ? a.id - b.id : b.id - a.id;
	});
}

export function moveElementInPlace<T extends { id: number }>(
	elements: T[],
	movingElementId: number,
	movingElementNewOrder: {
		rightId: number | null;
		leftId: number | null;
	},
	getLeftId: (element: T) => number | null,
	getRightId: (element: T) => number | null,
	setLeftId: (element: T, leftId: number | null) => void,
	setRightId: (element: T, rightId: number | null) => void
) {
	console.log(JSON.stringify(elements));

	const movingElement = elements.find((value) => value.id == movingElementId);

	if (!movingElement) {
		throw new Error('moving element not found in dataset');
	}

	if (
		movingElement.id === movingElementNewOrder.rightId ||
		movingElement.id === movingElementNewOrder.leftId
	) {
		throw new Error('inputs values create a cyclic order');
	}

	removeElementFromSortedListInPlace(
		elements,
		movingElementId,
		getLeftId,
		getRightId,
		setLeftId,
		setRightId
	);

	elements
		.filter(
			(element) =>
				movingElementNewOrder.leftId != null &&
				getLeftId(element) == movingElementNewOrder.leftId &&
				element.id !== movingElementId
		)
		.forEach((element) => {
			setLeftId(element, movingElementId);
		});

	elements
		.filter(
			(element) =>
				movingElementNewOrder.leftId != null && element.id == movingElementNewOrder.leftId
		)
		.forEach((element) => {
			setRightId(element, movingElementId);
		});

	elements
		.filter(
			(element) =>
				movingElementNewOrder.rightId != null &&
				getRightId(element) == movingElementNewOrder.rightId &&
				element.id !== movingElementId
		)
		.forEach((element) => {
			setRightId(element, movingElementId);
		});

	elements
		.filter(
			(element) =>
				movingElementNewOrder.rightId != null && element.id == movingElementNewOrder.rightId
		)
		.forEach((element) => {
			setLeftId(element, movingElementId);
		});

	setLeftId(movingElement, movingElementNewOrder.leftId);
	setRightId(movingElement, movingElementNewOrder.rightId);

	console.log(JSON.stringify(elements));
}

export function removeElementFromSortedListInPlace<T extends { id: number }>(
	elements: T[],
	deletingElementId: number,
	getLeftId: (element: T) => number | null,
	getRightId: (element: T) => number | null,
	setLeftId: (element: T, leftId: number | null) => void,
	setRightId: (element: T, rightId: number | null) => void
) {
	console.log(JSON.stringify(elements));

	const deletingElement = elements.find((element) => element.id == deletingElementId);

	if (!deletingElement) {
		throw new Error('deletingElement element not found in dataset');
	}

	const deletingElementLeftId = getLeftId(deletingElement);
	const deletingElementRightId = getRightId(deletingElement);

	setLeftId(deletingElement, null);
	setRightId(deletingElement, null);

	elements
		.filter((element) => getRightId(element) == deletingElementId)
		.forEach((element) => {
			setRightId(element, deletingElementRightId);
		});

	elements
		.filter((element) => getLeftId(element) == deletingElementId)
		.forEach((element) => {
			setLeftId(element, deletingElementLeftId);
		});

	if (deletingElementLeftId !== null) {
		elements
			.filter((element) => element.id == deletingElementLeftId)
			.forEach((element) => {
				setRightId(element, deletingElementRightId);
			});
	}

	if (deletingElementRightId !== null) {
		elements
			.filter((element) => element.id == deletingElementRightId)
			.forEach((element) => {
				setLeftId(element, deletingElementLeftId);
			});
	}

	console.log(JSON.stringify(elements));
}

export function getLastTodoItemInSortedListExceptCurrent(
	items: TodoCategoryPartialTodoItem[],
	currentTodoId: number
) {
	const lastItemInList = items.find(
		(item) => item.id !== currentTodoId && getTodoItemRightId(item) === null
	);
	if (lastItemInList !== undefined) {
		return lastItemInList;
	}
	return items.find((item) => item.id != currentTodoId) ?? null;
}

export function getLastTodoCategoryInSortedListExceptCurrent(
	items: TodoCategory[],
	currentTodoCategoryId: number
) {
	const lastItemInList = items.find(
		(item) => item.id !== currentTodoCategoryId && getTodoCategoryRightId(item) === null
	);
	if (lastItemInList !== undefined) {
		return lastItemInList;
	}
	return items.find((item) => item.id != currentTodoCategoryId) ?? null;
}
