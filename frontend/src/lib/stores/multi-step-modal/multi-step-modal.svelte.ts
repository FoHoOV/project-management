import type { ComponentProps, SvelteComponent } from 'svelte';

type SvelteComponentClass<TComponent extends SvelteComponent> = new (...args: any[]) => TComponent;
type ComponentPropsGenerator<TComponent extends SvelteComponent> = () => ComponentProps<TComponent>;

type ModalStep<TComponent extends SvelteComponent> = {
	component: SvelteComponentClass<TComponent>;
	props: ComponentPropsGenerator<TComponent>;
	title: string;
	closeModalButtonText?: string;
};

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

export const multiStepModal = new MultiStepModal([], false);

export default multiStepModal;
