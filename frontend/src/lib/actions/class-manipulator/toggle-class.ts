import type { ToggleClassOptions } from './toggle-class-types';

export function toggleClass(node: HTMLElement, options: ToggleClassOptions) {
	_updateClasses(node, options);

	return {
		update(newOptions: ToggleClassOptions) {
			_updateClasses(node, newOptions);
		}
	};
}

function _updateClasses(node: HTMLElement, options: ToggleClassOptions) {
	if (options.isActive) {
		node.classList.add(...options.classes);
	} else {
		node.classList.remove(...options.classes);
	}
}
