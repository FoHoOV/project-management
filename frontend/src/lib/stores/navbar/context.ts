import { getContext, setContext } from 'svelte';
import { Navbar } from './navbar.svelte';

export const NAVBAR_CONTEXT_KEY = Symbol();

export function getNavbar() {
	return getContext<Navbar>(NAVBAR_CONTEXT_KEY);
}

export function setNavbar(store: Navbar) {
	return setContext(NAVBAR_CONTEXT_KEY, store);
}
