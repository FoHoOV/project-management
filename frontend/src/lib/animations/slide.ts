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
			slideParas.classes.forEach((value) => {
				node.classList.add(value);
			});
			return svelteSlide['css']?.(t, u) ?? '';
		}
	};
}
