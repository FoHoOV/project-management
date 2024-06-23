import type { Snippet } from 'svelte';
import type { SnippetParams } from '$components/Drawer.svelte';

type NavbarPosition = 'start' | 'end' | 'center';
export class Navbar {
	public end$: Snippet<SnippetParams>[] = $state([]);

	remove(from: NavbarPosition, snippet: Snippet<SnippetParams>) {
		switch (from) {
			case 'start': {
				throw new Error('not implemented');
				break;
			}
			case 'center': {
				throw new Error('not implemented');
				break;
			}
			case 'end': {
				this.end$ = this.end$.filter((value) => value != snippet);
				break;
			}
		}
	}
}
