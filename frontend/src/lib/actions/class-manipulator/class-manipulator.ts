import type { ClassManipulatorOptions } from './class-manipulator-types';

export function classManipulator(node: HTMLElement, options: ClassManipulatorOptions) {
	let targetElements: NodeListOf<HTMLElement> | HTMLElement[] = options.selector
		? node.querySelectorAll(options.selector)
		: [node];

	function updateClasses(e: Event) {
		targetElements.forEach((element) => {
			element.classList.remove(...options.classes);
		});

		(e.target as HTMLElement).classList.add(...options.classes);
	}

	targetElements.forEach((element) => {
		element.addEventListener(options.event, updateClasses);
	});

	return {
		update(newOptions: ClassManipulatorOptions) {
			targetElements.forEach((element) => {
				element.removeEventListener(options.event, updateClasses);
			});

			options = newOptions;
			targetElements = options.selector ? node.querySelectorAll(options.selector) : [node];

			targetElements.forEach((element) => {
				element.addEventListener(options.event, updateClasses);
			});
		},
		destroy() {
			targetElements.forEach((element) => {
				element.removeEventListener(options.event, updateClasses);
			});
		}
	};
}
