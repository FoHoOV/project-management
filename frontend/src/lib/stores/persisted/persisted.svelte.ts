import { PUBLIC_COOKIES_EXPIRATION_SPAN_SECONDS } from '$env/static/public';
import { StorageTypes } from '$lib';

type PrimitiveStorageTypes = string | number | boolean;
type ObjectStorageTypes = Record<string, unknown>;

type Options<T extends PrimitiveStorageTypes | ObjectStorageTypes> = {
	initializer?: T;
	default?: T;
};

export class Persisted {
	#storageTypes: StorageTypes;

	constructor(storageTypes: StorageTypes) {
		this.#storageTypes = storageTypes;
	}

	/**
	 * stores to localStorage
	 */
	primitive$<T extends PrimitiveStorageTypes>(key: string, options?: Options<T>) {
		const storage = this.#storageTypes.localStorage.getItem(key);
		let reactiveValue = $state<string>(
			storage ? (storage ?? options?.default?.toString()) : (options?.initializer?.toString() ?? '')
		);

		$effect.root(() => {
			$effect(() => {
				this.#storageTypes.localStorage.setItem(key, reactiveValue?.toString() ?? '');
			});
		});

		return {
			get value$(): string {
				return reactiveValue;
			},
			set value$(newValue: T) {
				reactiveValue = newValue?.toString() + '';
			}
		};
	}

	/**
	 * stores to localStorage
	 */
	object$<T extends ObjectStorageTypes>(key: string, options?: Options<T>) {
		const storage = this.#storageTypes.localStorage.getItem(key);
		const parsed: T = storage ? JSON.parse(storage) : options?.default;
		let reactiveValue = $state<T>(parsed ?? options?.initializer);

		$effect.root(() => {
			$effect(() => {
				this.#storageTypes.localStorage.setItem(key, JSON.stringify(reactiveValue));
			});
		});

		return {
			get value$(): T {
				return reactiveValue;
			},
			set value$(newValue: T) {
				reactiveValue = newValue;
			}
		};
	}

	/**
	 * stores to cookie
	 */
	cookie$<T extends ObjectStorageTypes>(key: string, options?: Options<T>) {
		const storage = this.#storageTypes.cookies.get(key);
		const parsed: T = storage ? JSON.parse(storage) : options?.default;
		let reactiveValue = $state<T>(parsed ?? options?.initializer);

		$effect.root(() => {
			$effect(() => {
				const expirationDate = new Date(Date.now());
				expirationDate.setSeconds(
					expirationDate.getSeconds() + parseInt(PUBLIC_COOKIES_EXPIRATION_SPAN_SECONDS)
				);
				this.#storageTypes.cookies.set(key, JSON.stringify(reactiveValue), {
					expires: expirationDate,
					path: '/',
					httpOnly: false
				});
			});
		});

		return {
			get value$(): T {
				return reactiveValue;
			},
			set value$(newValue: T) {
				reactiveValue = newValue;
			}
		};
	}
}
