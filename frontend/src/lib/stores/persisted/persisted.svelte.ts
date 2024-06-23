import { PUBLIC_COOKIES_EXPIRATION_SPAN_SECONDS } from '$env/static/public';
import { StorageTypes } from '$lib';

type PrimitiveStorageTypes = string | number | boolean;
type ObjectStorageTypes = Record<string, unknown>;

type Options<T extends PrimitiveStorageTypes | ObjectStorageTypes> = {
	initializer?: T;
	default?: T;
};

export class Persisted {
	/**
	 * stores to localStorage
	 */
	static primitive$<T extends PrimitiveStorageTypes>(key: string, options?: Options<T>) {
		const storage = StorageTypes.localStorage.getItem(key);
		let reactiveValue = $state<string>(
			storage ? storage ?? options?.default?.toString() : options?.initializer?.toString() ?? ''
		);

		$effect.root(() => {
			$effect(() => {
				StorageTypes.localStorage.setItem(key, reactiveValue?.toString() ?? '');
			});
		});

		return {
			get current(): string {
				return reactiveValue;
			},
			set current(newValue: T) {
				reactiveValue = newValue?.toString() + '';
			}
		};
	}

	/**
	 * stores to localStorage
	 */
	static object$<T extends ObjectStorageTypes>(key: string, options?: Options<T>) {
		const storage = StorageTypes.localStorage.getItem(key);
		const parsed: T = storage ? JSON.parse(storage) : options?.default;
		let reactiveValue = $state<T>(parsed ?? options?.initializer);

		$effect.root(() => {
			$effect(() => {
				StorageTypes.localStorage.setItem(key, JSON.stringify(reactiveValue));
			});
		});

		return {
			get current(): T {
				return reactiveValue;
			},
			set current(newValue: T) {
				reactiveValue = newValue;
			}
		};
	}

	/**
	 * stores to cookie
	 */
	static cookie$<T extends ObjectStorageTypes>(key: string, options?: Options<T>) {
		const storage = StorageTypes.cookies.get(key);
		const parsed: T = storage ? JSON.parse(storage) : options?.default;
		let reactiveValue = $state<T>(parsed ?? options?.initializer);

		$effect.root(() => {
			$effect(() => {
				const expirationDate = new Date(Date.now());
				expirationDate.setSeconds(
					expirationDate.getSeconds() + parseInt(PUBLIC_COOKIES_EXPIRATION_SPAN_SECONDS)
				);
				StorageTypes.cookies.set(key, JSON.stringify(reactiveValue), {
					expires: expirationDate,
					path: '/'
				});
			});
		});

		return {
			get current(): T {
				return reactiveValue;
			},
			set current(newValue: T) {
				reactiveValue = newValue;
			}
		};
	}
}
