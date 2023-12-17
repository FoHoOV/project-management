import type { SlideParams, TransitionConfig } from 'svelte/transition';
import { slide as builtInSlide } from 'svelte/transition';

export function slide(
	node: Element,
	slideParas: SlideParams & { classes: string[] }
): TransitionConfig {
	const svelteSlide = builtInSlide(node, slideParas);
	return {
		...svelteSlide,
		css: (t, u) => {
			if (t == 0) {
				slideParas.classes.forEach((value) => {
					node.classList.add(value);
				});
			}
			if (t == 1) {
				slideParas.classes.forEach((value) => {
					node.classList.remove(value);
				});
			}
			return svelteSlide['css']?.(t, u) ?? '';
		}
	};
}
