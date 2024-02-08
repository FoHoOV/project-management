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
		this._todoCategories = this._todoCategories.map<TodoCategory>((value) => {
			if (value.id !== todoCategory.id) {
				return value;
			}
			todoCategory.items = getSortedTodos(todoCategory.items);
			return todoCategory;
		});
		this._todoCategories = getSortedTodoCategories(this._todoCategories);
	}

	removeCategory(todoCategory: TodoCategory, removeDependencies = true) {
		if (removeDependencies) {
			this._todoCategories = this._todoCategories.map((value) => {
				value.items = value.items.map((item) => {
					item.dependencies = item.dependencies.filter((dependency) => {
						return todoCategory.items.some((item) => item.id == dependency.dependant_todo_id);
					});
					return item;
				});
				return value;
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
		newOrder: NonNullable<TodoCategoryPartialTodoItem['order']>,
		skipSort = false
	) {
		if (movingElement.category_id !== movingElementNewCategoryId) {
			this.removeTodo(movingElement, false);
			this.addTodo({ ...movingElement, category_id: movingElementNewCategoryId }, true);
			movingElement.category_id = movingElementNewCategoryId;
		}
		this._todoCategories = this._todoCategories.map<TodoCategory>((category) => {
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
		this._todoCategories = getSortedTodoCategories(this._todoCategories);
	}

	addTodo(todo: TodoCategoryPartialTodoItem, skipSort = false): void {
		this._todoCategories = this._todoCategories.map<TodoCategory>((category) => {
			if (category.id !== todo.category_id) {
				return category;
			}
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

			return category;
		});
	}

	removeTodo(todo: TodoCategoryPartialTodoItem, removeDependencies = true, skipSort = false) {
		this._todoCategories = this._todoCategories.map<TodoCategory>((category) => {
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

			return category;
		});
	}

	updateTodo(todo: TodoCategoryPartialTodoItem, skipSort = false) {
		this._todoCategories = this._todoCategories.map<TodoCategory>((category) => {
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
				category.items = getSortedTodos(category.items);
			}

			return category;
		});
	}

	addDependency(todoId: number, dependency: TodoItemPartialDependency) {
		this._todoCategories = this._todoCategories.map((category) => {
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
		this._todoCategories = this._todoCategories.map((category) => {
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
		this._todoCategories = this._todoCategories.map((category) => {
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
		this._todoCategories = this._todoCategories.map((category) => {
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
		this._todoCategories = this._todoCategories.map((category) => {
			category.items.forEach((todo) => {
				todo.tags = todo.tags.filter((value) => value.id !== tag.id);
				return todo;
			});
			return category;
		});
	}

	updateTag(tag: TodoItemPartialTag) {
		this._todoCategories = this._todoCategories.map((category) => {
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

	increaseTodoCommentsCounter(todoId: number) {
		this._todoCategories = this._todoCategories.map((category) => {
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

	decreaseTodoCommentsCounter(todoId: number) {
		this._todoCategories = this._todoCategories.map((category) => {
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

	clearCategories() {
		this._todoCategories = [];
	}

	get todoCategories() {
		return this._todoCategories;
	}
}

export const todoCategories = new TodoCategories();

export default todoCategories;
