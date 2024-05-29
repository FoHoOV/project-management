import { browser } from '$app/environment';

type PrimitiveStorageTypes = string | number | boolean | null;
type ObjectStorageTypes = Record<string, unknown> | null;

class _Persisted {
	primitive$<T extends PrimitiveStorageTypes>(key: string, value: T) {
		let reactiveValue = $state<PrimitiveStorageTypes>(
			value?.toString() ?? this.localStorage.getItem(key)
		);

		$effect.root(() => {
			$effect(() => {
				this.localStorage.setItem(key, reactiveValue?.toString() ?? '');
			});
		});

		return {
			get current(): PrimitiveStorageTypes {
				return reactiveValue;
			},
			set current(newValue: PrimitiveStorageTypes) {
				reactiveValue = newValue?.toString() + '';
			}
		};
	}

	object$<T extends ObjectStorageTypes>(key: string, value: T) {
		const storage = this.localStorage.getItem(key);
		const parsed: T = storage ? JSON.parse(storage) : null;
		let reactiveValue = $state<ObjectStorageTypes>(value ?? parsed);

		$effect.root(() => {
			$effect(() => {
				this.localStorage.setItem(key, JSON.stringify(reactiveValue));
			});
		});

		return {
			get current(): ObjectStorageTypes {
				return reactiveValue;
			},
			set current(newValue: ObjectStorageTypes) {
				reactiveValue = newValue;
			}
		};
	}

	get localStorage() {
		return browser
			? window.localStorage
			: {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					getItem(key: string) {
						return null;
					},
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					setItem(key: string, value: string | null) {}
				};
	}
}

export const persisted = new _Persisted();
