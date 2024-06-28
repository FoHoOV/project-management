import { Persisted } from '../persisted';
import { SHARED_KEYS } from '$lib/constants/cookie';

export type Theme = 'dark' | 'light';

export class ThemeManager {
	#storedTheme;

	constructor(persisted: Persisted) {
		this.#storedTheme = persisted.cookie$<{ value: Theme }>(SHARED_KEYS.theme, {
			initializer: { value: 'dark' }
		});
	}

	get value$() {
		return this.#storedTheme.value$.value;
	}

	change(theme: Theme) {
		this.#storedTheme.value$ = { value: theme };
	}
}
