import type { TodoCategory, TodoCategoryPartialTodoItem } from '$lib/generated-client/models';
import type { TodoCategories } from '$lib/stores/todos';
import { TODO_CATEGORIES_CONTEXT_NAME } from './constants';
import { getRootContextManager } from '$lib/stores/context-manager';
import { getContext, setContext } from 'svelte';

export function generateNewOrderForTodoItem(
	target: TodoCategoryPartialTodoItem,
	movingItem: TodoCategoryPartialTodoItem,
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

export function setTodosStoreToContext<TContext extends TodoCategories | undefined>(
	store: TContext,
	setToRootContext?: boolean
) {
	if (setToRootContext) {
		return getRootContextManager().add(TODO_CATEGORIES_CONTEXT_NAME, store);
	}

	return setContext(TODO_CATEGORIES_CONTEXT_NAME, store);
}

export function getTodosStoreFromContext() {
	return (
		getContext<TodoCategories | undefined>(TODO_CATEGORIES_CONTEXT_NAME) ??
		getRootContextManager().get<TodoCategories>(TODO_CATEGORIES_CONTEXT_NAME)
	);
}
