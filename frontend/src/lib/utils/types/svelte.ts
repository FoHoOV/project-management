import type { Component } from 'svelte';

export type ComponentExports<TComponent extends Component<any, any>> =
	TComponent extends Component<any, infer TExports> ? TExports : never;
