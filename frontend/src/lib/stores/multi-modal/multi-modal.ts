import type { ComponentProps, SvelteComponent } from 'svelte';
import { writable } from 'svelte/store';

type MultiModalStep<TComponent extends SvelteComponent> = {
	component: new (...args: any[]) => TComponent;
	props: () => ReturnType<ComponentProps<TComponent>>;
	title: string;
};

const {
	subscribe,
	update: _update,
	set: _set
} = writable<{
	show: boolean;
	steps: MultiModalStep<any>[];
}>({ show: false, steps: [] });

function add<TComponent extends SvelteComponent>(step: MultiModalStep<TComponent>) {
	_update((config) => {
		config.steps.push(step);
		return config;
	});
	show();
}

function pop() {
	_update((config) => {
		config.steps.pop();
		return config;
	});
}

function show() {
	_update((config) => {
		config.show = true;
		return config;
	});
}

function hide() {
	_update((config) => {
		config.show = false;
		return config;
	});
}

function clear() {
	_set({ show: false, steps: [] });
}

export default {
	add: add,
	pop: pop,
	clear: clear,
	show: show,
	hide: hide,
	subscribe: subscribe
};
