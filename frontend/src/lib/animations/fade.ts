import type { FadeParams, TransitionConfig } from 'svelte/transition';
import { fade as builtInFade } from 'svelte/transition';
export function fade(
	node: Element,
	fadePrams: FadeParams & { classes: string[] }
): TransitionConfig {
	const svelteFade = builtInFade(node, fadePrams);
	return {
		...svelteFade,
		css: (t, u) => {
			fadePrams.classes.forEach((value) => {
				node.classList.add(value);
			});
			return svelteFade['css']?.(t, u) ?? '';
		}
	};
}
