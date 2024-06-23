import { Persisted } from '../persisted';
import { THEME_COOKIE_KEY } from './constants';

export type Theme = 'dark' | 'light';

export class ThemeManager {
	#storedTheme = Persisted.cookie$<{ value: Theme }>(THEME_COOKIE_KEY, {
		initializer: { value: 'dark' }
	});

	get value$() {
		return this.#storedTheme.current.value;
	}

	change(theme: Theme) {
		this.#storedTheme.current = { value: theme };
	}
}
