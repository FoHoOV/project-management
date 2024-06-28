import { Persisted } from '../persisted';
import { SHARED_KEYS } from '$lib/constants/cookie';

export type Theme = 'dark' | 'light';

export class ThemeManager {
	#storedTheme;

	constructor(initial?: string) {
		let theme: Theme = 'dark';
		if (initial) {
			const parsed = JSON.parse(initial);
			theme = parsed.value ?? 'dark';
		}
		this.#storedTheme = Persisted.cookie$<{ value: Theme }>(SHARED_KEYS.theme, {
			initializer: { value: theme }
		});
	}

	get value$() {
		return this.#storedTheme.value$.value;
	}

	change(theme: Theme) {
		this.#storedTheme.value$ = { value: theme };
	}
}
