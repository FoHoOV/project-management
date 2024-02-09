import type {
	NullableOrderedItem,
	TodoItemPartialTag,
	TodoCategory,
	TodoCategoryPartialTodoItem,
	TodoItemPartialDependency
} from '$lib/generated-client/models';
import {
	getLastTodoCategoryInSortedListExceptCurrent,
	getLastTodoItemInSortedListExceptCurrent,
	getTodoCategoryRightId,
	setTodoCategoryRightId,
	setTodoItemLeftId
} from './sort';
import {
	getSortedTodos,
	getTodoItemRightId,
	setTodoItemRightId,
	updateElementSortInPlace,
	getSortedTodoCategories,
	getTodoCategoryLeftId,
	setTodoCategoryLeftId,
	getTodoItemLeftId,
	removeElementFromSortedListInPlace
} from './sort';

class TodoCategories {
	private _todoCategories = $state<TodoCategory[]>([]);

	setCategories(todoCategories: TodoCategory[]) {
		this._todoCategories = getSortedTodoCategories(
			todoCategories.map((category) => {
				category.items = getSortedTodos(category.items);
				return category;
			})
		);
	}

	addCategory(category: TodoCategory) {
		category.items = getSortedTodos(category.items);
		this._todoCategories.push(category);
		updateElementSortInPlace(
			this._todoCategories,
			category.id,
			{
				leftId:
					getLastTodoCategoryInSortedListExceptCurrent(this._todoCategories, category.id)?.id ??
					null,
				rightId: null
			},
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);
		this._todoCategories = getSortedTodoCategories(this._todoCategories);
	}

	updateCategory(todoCategory: TodoCategory) {
		let foundTodoCategory = this._findCategory(todoCategory.id);
		foundTodoCategory = todoCategory;
		foundTodoCategory.items = getSortedTodos(todoCategory.items);
		this._todoCategories = getSortedTodoCategories(this._todoCategories);
	}

	removeCategory(todoCategory: TodoCategory, removeDependencies = true) {
		if (removeDependencies) {
			this._todoCategories.forEach((value) => {
				value.items.forEach((item) => {
					item.dependencies = item.dependencies.filter((dependency) => {
						return todoCategory.items.some((item) => item.id == dependency.dependant_todo_id);
					});
				});
			});
		}

		removeElementFromSortedListInPlace(
			this._todoCategories,
			todoCategory.id,
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);

		this._todoCategories = this._todoCategories.filter((value) => value.id !== todoCategory.id);
	}

	updateCategoriesSort(movingElement: TodoCategory, newOrder: NonNullable<NullableOrderedItem>) {
		updateElementSortInPlace(
			this._todoCategories,
			movingElement.id,
			{ leftId: newOrder.left_id, rightId: newOrder.right_id },
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);
		this._todoCategories = getSortedTodoCategories(this._todoCategories);
	}

	updateTodoSort(
		movingElement: TodoCategoryPartialTodoItem,
		movingElementNewCategoryId: number,
		newOrder: NonNullable<TodoCategoryPartialTodoItem['order']>
	) {
		if (movingElement.category_id !== movingElementNewCategoryId) {
			this.removeTodo(movingElement, false);
			this.addTodo({ ...movingElement, category_id: movingElementNewCategoryId }, true);
			movingElement.category_id = movingElementNewCategoryId;
		}

		const category = this._findCategory(movingElement.category_id);

		updateElementSortInPlace(
			category.items,
			movingElement.id,
			{ leftId: newOrder.left_id, rightId: newOrder.right_id },
			getTodoItemLeftId,
			getTodoItemRightId,
			setTodoItemLeftId,
			setTodoItemRightId
		);

		category.items = getSortedTodos(category.items);
	}

	addTodo(todo: TodoCategoryPartialTodoItem, skipSort = false): void {
		const category = this._findCategory(todo.category_id);

		category.items.push(todo);

		updateElementSortInPlace(
			category.items,
			todo.id,
			{
				leftId: getLastTodoItemInSortedListExceptCurrent(category.items, todo.id)?.id ?? null,
				rightId: null
			},
			getTodoItemLeftId,
			getTodoItemRightId,
			setTodoItemLeftId,
			setTodoItemRightId
		);

		if (!skipSort) {
			category.items = getSortedTodos(category.items);
		}
	}

	removeTodo(todo: TodoCategoryPartialTodoItem, removeDependencies = true, skipSort = false) {
		this._todoCategories.forEach((category) => {
			if (removeDependencies) {
				category.items = category.items.map((item) => {
					item.dependencies = item.dependencies.filter((dependency) => {
						return dependency.dependant_todo_id !== todo.id;
					});
					return item;
				});
			}

			if (category.id !== todo.category_id) {
				return;
			}

			removeElementFromSortedListInPlace(
				category.items,
				todo.id,
				getTodoItemLeftId,
				getTodoItemRightId,
				setTodoItemLeftId,
				setTodoItemRightId
			);

			if (!skipSort) {
				category.items = getSortedTodos(category.items.filter((value) => value.id !== todo.id));
			}
		});
	}

	updateTodo(todo: TodoCategoryPartialTodoItem, skipSort = false) {
		const category = this._findCategory(todo.category_id);

		category.items = category.items.map((value) => {
			if (value.id !== todo.id) {
				return value;
			}
			return todo;
		});

		// let foundTodo = this._findTodo(todo.id);
		// // eslint-disable-next-line @typescript-eslint/no-unused-vars
		// foundTodo = todo;

		if (!skipSort) {
			category.items = getSortedTodos(category.items);
		}
	}

	addDependency(todoId: number, dependency: TodoItemPartialDependency) {
		const todo = this._findTodo(todoId);
		todo.dependencies.push(dependency);
	}

	removeDependency(todoId: number, dependency: TodoItemPartialDependency) {
		const todo = this._findTodo(todoId);
		todo.dependencies = todo.dependencies.filter((value) => value.id != dependency.id);
	}

	addTag(todoId: number, tag: TodoItemPartialTag) {
		const todo = this._findTodo(todoId);
		todo.tags.unshift(tag);
	}

	detachTag(todoId: number, tag: TodoItemPartialTag) {
		const todo = this._findTodo(todoId);
		todo.tags = todo.tags.filter((value) => value.id !== tag.id);
	}

	deleteTag(tag: TodoItemPartialTag) {
		this._todoCategories.forEach((category) => {
			category.items.forEach((todo) => {
				todo.tags = todo.tags.filter((value) => value.id !== tag.id);
			});
		});
	}

	updateTag(tag: TodoItemPartialTag) {
		this._todoCategories.forEach((category) => {
			category.items.forEach((todo) => {
				todo.tags.forEach((value) => {
					if (value.id !== tag.id) {
						return;
					}
					value.name = tag.name;
				});
			});
		});
	}

	increaseTodoCommentsCounter(todoId: number) {
		const todo = this._findTodo(todoId);
		todo.comments_count += 1;
	}

	decreaseTodoCommentsCounter(todoId: number) {
		const todo = this._findTodo(todoId);
		todo.comments_count -= 1;
	}

	clearCategories() {
		this._todoCategories = [];
	}

	private _findTodo(todoId: number) {
		const result = this._todoCategories
			.find((category) => category.items.some((item) => item.id == todoId))
			?.items.find((item) => item.id == todoId);

		if (!result) {
			throw new Error(`todo item not found in store: todoId=${todoId}`);
		}

		return result;
	}

	private _findCategory(categoryId: number) {
		const result = this._todoCategories.find((category) => category.id == categoryId);

		if (!result) {
			throw new Error(`todo category not found store: todoCategoryId=${categoryId}`);
		}

		return result;
	}

	get current() {
		return this._todoCategories;
	}
}

export const todoCategories = new TodoCategories();

export default todoCategories;
