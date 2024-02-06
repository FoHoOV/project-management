import type {
	NullableOrderedItem,
	TodoItemPartialTag as TagModel,
	TodoCategory as TodoCategoryModel,
	TodoCategoryPartialTodoItem as TodoItemModel,
	TodoItemPartialDependency as TodoItemDependency
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

export class Todo {
	private _category = $state<TodoCategory>();

	constructor(category: TodoCategory) {
		this._category = category;
	}

	addDependency(todoId: number, dependency: TodoItemDependency) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				if (todo.id !== todoId) {
					return todo;
				}
				todo.dependencies.push(dependency);
				return todo;
			});
			return category;
		});
	}

	removeDependency(todoId: number, dependency: TodoItemDependency) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				if (todo.id !== todoId) {
					return todo;
				}
				todo.dependencies = todo.dependencies.filter((value) => value.id != dependency.id);
				return todo;
			});
			return category;
		});
	}
	addTag(todoId: number, tag: TagModel) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				if (todo.id !== todoId) {
					return todo;
				}
				todo.tags.unshift(tag);
				return todo;
			});
			return category;
		});
	}

	detachTag(todoId: number, tag: TagModel) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				if (todo.id !== todoId) {
					return todo;
				}
				todo.tags = todo.tags.filter((value) => value.id !== tag.id);
				return todo;
			});
			return category;
		});
	}

	deleteTag(tag: TagModel) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				todo.tags = todo.tags.filter((value) => value.id !== tag.id);
				return todo;
			});
			return category;
		});
	}

	updateTag(tag: TagModel) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				todo.tags = todo.tags.map((value) => {
					if (value.id !== tag.id) {
						return value;
					}
					value.name = tag.name;
					return value;
				});
				return todo;
			});
			return category;
		});
	}

	// TODO: todo should be its own state and counter is a derived state of comments count
	increaseTodoCommentsCounter(todoId: number) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				if (todo.id !== todoId) {
					return todo;
				}
				todo.comments_count += 1;
				return todo;
			});
			return category;
		});
	}

	// TODO: todo should be its own state and counter is a derived state of comments count
	decreaseTodoCommentsCounter(todoId: number) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				if (todo.id !== todoId) {
					return todo;
				}
				todo.comments_count -= 1;
				return todo;
			});
			return category;
		});
	}

	updateTodoSort(
		movingElement: TodoItemModel,
		movingElementNewCategoryId: number,
		newOrder: NonNullable<TodoItemModel['order']>,
		skipSort = false
	) {
		if (movingElement.category_id !== movingElementNewCategoryId) {
			this.removeTodo(movingElement, false);
			this.addTodo({ ...movingElement, category_id: movingElementNewCategoryId }, true);
			movingElement.category_id = movingElementNewCategoryId;
		}

		this._categories = this._categories.map<TodoCategoryModel>((category) => {
			if (category.id !== movingElement.category_id) {
				return category;
			}
			updateElementSortInPlace(
				category.items,
				movingElement.id,
				{ leftId: newOrder.left_id, rightId: newOrder.right_id },
				getTodoItemLeftId,
				getTodoItemRightId,
				setTodoItemLeftId,
				setTodoItemRightId
			);

			if (!skipSort) {
				category.items = getSortedTodos(category.items);
			}

			return category;
		});
		this._categories = getSortedTodoCategories(this._categories);
	}
}

export class TodoCategory {
	private _todoCategory: TodoCategoryModel;
	private _todoCategories: TodoCategories;

	constructor(todoCategories: TodoCategories, todoCategory: TodoCategoryModel) {
		this._todoCategory = $state(todoCategory);
		this._todoCategories = todoCategories;
	}

	addTodo(todo: TodoItemModel, skipSort = false): void {
		this._todoCategory.items.push(todo);

		updateElementSortInPlace(
			this._todoCategory.items,
			todo.id,
			{
				leftId:
					getLastTodoItemInSortedListExceptCurrent(this._todoCategory.items, todo.id)?.id ?? null,
				rightId: null
			},
			getTodoItemLeftId,
			getTodoItemRightId,
			setTodoItemLeftId,
			setTodoItemRightId
		);

		if (!skipSort) {
			this._todoCategory.items = getSortedTodos(this._todoCategory.items);
		}
	}

	removeTodo(todo: TodoItemModel, removeDependencies = true, skipSort = false) {
		if (removeDependencies) {
			this._todoCategories.categories.forEach((category) => {
				category.items = category.items.map((item) => {
					item.dependencies = item.dependencies.filter((dependency) => {
						return dependency.dependant_todo_id !== todo.id;
					});
					return item;
				});
			});
		}

		removeElementFromSortedListInPlace(
			this._todoCategory.items,
			todo.id,
			getTodoItemLeftId,
			getTodoItemRightId,
			setTodoItemLeftId,
			setTodoItemRightId
		);

		if (!skipSort) {
			this._todoCategory.items = getSortedTodos(
				this._todoCategory.items.filter((value) => value.id !== todo.id)
			);
		}
	}

	updateTodo(todo: TodoItemModel, skipSort = false) {
		this._todoCategory.items.forEach((value, index) => {
			if (value.id !== todo.id) {
				return;
			}
			this._todoCategory.items[index] = todo;
		});

		if (!skipSort) {
			this._todoCategory.items = getSortedTodos(this._todoCategory.items);
		}
	}

	get todos() {
		return this._todoCategory.items;
	}

	get current() {
		return this._todoCategory;
	}
}

export class TodoCategories {
	private _categories: TodoCategory[];

	constructor(categories: TodoCategoryModel[]) {
		this._categories = $state(categories.map((category) => new TodoCategory(this, category)));
	}

	addCategory(category: TodoCategoryModel) {
		category.items = getSortedTodos(category.items);
		this._categories.push(new TodoCategory(this, category));
		updateElementSortInPlace(
			this._categories,
			category.id,
			{
				leftId:
					getLastTodoCategoryInSortedListExceptCurrent(this._categories, category.id)?.id ?? null,
				rightId: null
			},
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);
		this._categories = getSortedTodoCategories(this._categories);
	}

	removeCategory(category: TodoCategoryModel, removeDependencies = true) {
		if (removeDependencies) {
			this._categories = this._categories.map((value) => {
				value.items = value.items.map((item) => {
					item.dependencies = item.dependencies.filter((dependency) => {
						return category.items.some((item) => item.id == dependency.dependant_todo_id);
					});
					return item;
				});
				return value;
			});
		}
		removeElementFromSortedListInPlace(
			this._categories,
			category.id,
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);
		this._categories = this._categories.filter((value) => value.id !== category.id);
	}

	updateCategory(category: TodoCategoryModel) {
		this._categories = this._categories.map<TodoCategoryModel>((value) => {
			if (value.id !== category.id) {
				return value;
			}
			category.items = getSortedTodos(category.items);
			return category;
		});
		this._categories = getSortedTodoCategories(this._categories);
	}

	updateCategoriesSort(
		movingElement: TodoCategoryModel,
		newOrder: NonNullable<NullableOrderedItem>,
		skipSort = false
	) {
		updateElementSortInPlace(
			this._categories,
			movingElement.id,
			{ leftId: newOrder.left_id, rightId: newOrder.right_id },
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);
		this._categories = skipSort ? this._categories : getSortedTodoCategories(this._categories);
	}

	setTodoCategories(categories: TodoCategoryModel[]) {
		this._categories = getSortedTodoCategories(
			categories.map((category) => {
				category.items = getSortedTodos(category.items);
				return category;
			})
		);
	}

	clearTodoCategories() {
		this._categories = [];
	}

	get length(): number {
		return this._categories.length;
	}

	get categories(): TodoCategoryModel[] {
		return this._categories;
	}
}

const todos = new TodoCategories([]);

export default todos;
