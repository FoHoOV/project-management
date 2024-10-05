import type { Component, ComponentProps } from 'svelte';

type ComponentPropsGenerator<TComponent extends Component<any, any>> =
	() => ComponentProps<TComponent>;

type ModalStep<TComponent extends Component<any, any>> = {
	component: TComponent;
	props: ComponentPropsGenerator<TComponent>;
	title: string;
	closeModalButtonText?: string;
};

export class MultiStepModal {
	private _steps = $state<ModalStep<any>[]>()!;
	private _show = $state<boolean>()!;

	constructor(steps: ModalStep<any>[], show: boolean) {
		this._steps = steps;
		this._show = show;
	}

	add<TComponent extends Component<any, any>>(step: ModalStep<TComponent>) {
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

	get steps$() {
		return this._steps;
	}

	get showing$() {
		return this._show;
	}
}
