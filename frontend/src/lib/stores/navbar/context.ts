import { getContext, setContext } from '$lib/stores';
import { Navbar } from './navbar.svelte';

export const NAVBAR_CONTEXT_KEY = Symbol();

export function getNavbar() {
	return getContext<Navbar>(NAVBAR_CONTEXT_KEY);
}

export function setNavbar(store: Navbar) {
	return setContext(store, NAVBAR_CONTEXT_KEY);
}
