import type { TodoCategory, TodoItem, Project } from '$lib/generated-client/models';

export function generateNewOrderForTodoItem(
	target: TodoItem,
	movingItem: TodoItem,
	moveItemToLeftOfTarget: boolean,
	category: TodoCategory
) {
	let newOrder: { left_id: number | null; right_id: number | null };
	const leftTodoItemId = getLeftTodoItemId(target.id, category);
	const rightTodoItemId = getRightTodoItemId(target.id, category);
	if (moveItemToLeftOfTarget) {
		newOrder = {
			left_id: leftTodoItemId == movingItem.id ? null : leftTodoItemId,
			right_id: target.id
		};
	} else {
		newOrder = {
			left_id: target.id,
			right_id: rightTodoItemId == movingItem.id ? null : rightTodoItemId
		};
	}
	return newOrder;
}

export function generateNewOrderForTodoCategory(
	target: TodoCategory,
	movingItem: TodoCategory,
	moveItemToLeftOfTarget: boolean,
	todoCategories: TodoCategory[]
) {
	let newOrder: { left_id: number | null; right_id: number | null };
	const leftTodoCategoryId = getLeftTodoCategoryId(target.id, todoCategories);
	const rightTodoCategoryId = getRightTodoCategoryId(target.id, todoCategories);
	if (moveItemToLeftOfTarget) {
		newOrder = {
			left_id: leftTodoCategoryId == movingItem.id ? null : leftTodoCategoryId,
			right_id: target.id
		};
	} else {
		newOrder = {
			left_id: target.id,
			right_id: rightTodoCategoryId == movingItem.id ? null : rightTodoCategoryId
		};
	}
	return newOrder;
}

export function getRightTodoCategoryId(id: number, todoCategories: TodoCategory[]) {
	const currentIndex = todoCategories.findIndex((category) => category.id == id);
	return currentIndex === todoCategories.length - 1 ? null : todoCategories[currentIndex + 1].id;
}

export function getLeftTodoCategoryId(id: number, todoCategories: TodoCategory[]) {
	const currentIndex = todoCategories.findIndex((category) => category.id == id);
	return currentIndex === 0 ? null : todoCategories[currentIndex - 1].id;
}

export function getRightTodoItemId(id: number, category: TodoCategory) {
	const currentIndex = category.items.findIndex((todo) => todo.id == id);
	return currentIndex === category.items.length - 1 ? null : category.items[currentIndex + 1].id;
}

export function getLeftTodoItemId(id: number, category: TodoCategory) {
	const currentIndex = category.items.findIndex((todo) => todo.id == id);
	return currentIndex === 0 ? null : category.items[currentIndex - 1].id;
}
