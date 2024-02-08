import type { ComponentProps, SvelteComponent } from 'svelte';

type SvelteComponentClass<TComponent extends SvelteComponent> = new (...args: any[]) => TComponent;
type ComponentPropsGenerator<TComponent extends SvelteComponent> = () => ComponentProps<TComponent>;

class ModalStep<TComponent extends SvelteComponent> {
	public readonly component = $state<SvelteComponentClass<TComponent>>()!;
	public readonly props = $state<ComponentPropsGenerator<TComponent>>()!;
	public readonly title = $state<string>()!;

	constructor(
		component: SvelteComponentClass<TComponent>,
		props: ComponentPropsGenerator<TComponent>,
		title: string
	) {
		this.component = component;
		this.props = props;
		this.title = title;
	}
}

class MultiStepModal {
	private _steps = $state<ModalStep<any>[]>()!;
	private _show = $state<boolean>()!;

	constructor(steps: ModalStep<any>[], show: boolean) {
		this._steps = steps;
		this._show = show;
	}

	add<TComponent extends SvelteComponent>(step: ModalStep<TComponent>) {
		this._steps.push(step);
		this.show();
	}

	pop() {
		this._steps.pop();
	}

	show() {
		this._show = true;
	}

	hide() {
		this._show = false;
	}

	clear() {
		this._steps = [];
		this.hide();
	}

	get steps() {
		return this._steps;
	}

	get showing() {
		return this._show;
	}
}

export const multiStepModal = $state<MultiStepModal>(new MultiStepModal([], false));

export default multiStepModal;
