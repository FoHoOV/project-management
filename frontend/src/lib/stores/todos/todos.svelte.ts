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

export class Todos {
	private _categories = $state<TodoCategory[]>([]);

	constructor(categories: TodoCategory[]) {
		this._categories = categories;
	}

	addTodo(todo: TodoCategoryPartialTodoItem, skipSort = false): void {
		this._categories = this._categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items.push(todo);

			updateElementSort(
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
				category.items = sortedTodos(category.items);
			}

			return category;
		});
	}

	removeTodo(todo: TodoCategoryPartialTodoItem, removeDependencies = true, skipSort = false) {
		this._categories = this._categories.map<TodoCategory>((category) => {
			if (removeDependencies) {
				category.items = category.items.map((item) => {
					item.dependencies = item.dependencies.filter((dependency) => {
						return dependency.dependant_todo_id !== todo.id;
					});
					return item;
				});
			}

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
	}

	updateTodo(todo: TodoCategoryPartialTodoItem, skipSort = false) {
		this._categories = this._categories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
			category.items = category.items.map((value) => {
				if (value.id !== todo.id) {
					return value;
				}
				return todo;
			});

			if (!skipSort) {
				category.items = sortedTodos(category.items);
			}

			return category;
		});
	}

	addDependency(todoId: number, dependency: TodoItemPartialDependency) {
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

	removeDependency(todoId: number, dependency: TodoItemPartialDependency) {
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
	addTag(todoId: number, tag: TodoItemPartialTag) {
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

	detachTag(todoId: number, tag: TodoItemPartialTag) {
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

	deleteTag(tag: TodoItemPartialTag) {
		this._categories = this._categories.map((category) => {
			category.items.forEach((todo) => {
				todo.tags = todo.tags.filter((value) => value.id !== tag.id);
				return todo;
			});
			return category;
		});
	}

	updateTag(tag: TodoItemPartialTag) {
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
		movingElement: TodoCategoryPartialTodoItem,
		movingElementNewCategoryId: number,
		newOrder: NonNullable<TodoCategoryPartialTodoItem['order']>,
		skipSort = false
	) {
		if (movingElement.category_id !== movingElementNewCategoryId) {
			this.removeTodo(movingElement, false);
			this.addTodo({ ...movingElement, category_id: movingElementNewCategoryId }, true);
			movingElement.category_id = movingElementNewCategoryId;
		}

		this._categories = this._categories.map<TodoCategory>((category) => {
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
		this._categories = sortedCategories(this._categories);
	}

	addCategory(category: TodoCategory) {
		category.items = sortedTodos(category.items);
		this._categories.push(category);
		updateElementSort(
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
		this._categories = sortedCategories(this._categories);
	}

	updateCategory(category: TodoCategory) {
		this._categories = this._categories.map<TodoCategory>((value) => {
			if (value.id !== category.id) {
				return value;
			}
			category.items = sortedTodos(category.items);
			return category;
		});
		this._categories = sortedCategories(this._categories);
	}

	removeCategory(category: TodoCategory, removeDependencies = true) {
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
		removeElementFromSortedList(
			this._categories,
			category.id,
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);
		this._categories = this._categories.filter((value) => value.id !== category.id);
	}

	updateCategoriesSort(
		movingElement: TodoCategory,
		newOrder: NonNullable<NullableOrderedItem>,
		skipSort = false
	) {
		updateElementSort(
			this._categories,
			movingElement.id,
			{ leftId: newOrder.left_id, rightId: newOrder.right_id },
			getTodoCategoryLeftId,
			getTodoCategoryRightId,
			setTodoCategoryLeftId,
			setTodoCategoryRightId
		);
		this._categories = skipSort ? this._categories : sortedCategories(this._categories);
	}
	setTodoCategories(categories: TodoCategory[]) {
		this._categories = sortedCategories(
			categories.map((category) => {
				category.items = sortedTodos(category.items);
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

	get categories(): TodoCategory[] {
		return this._categories;
	}
}

const todos = new Todos([]);

export default todos;
