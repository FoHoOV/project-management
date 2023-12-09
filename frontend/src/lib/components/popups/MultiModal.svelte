<script context="module" lang="ts">
	export type Action<TName, TComponentType extends SvelteComponent> = {
		component: TComponentType;
		name: TName;
		title: string;
	};

	type ActionsAny = readonly Action<any, any>[];
</script>

<script lang="ts" generics="TActions extends ActionsAny">
	import Modal from '$components/popups/Modal.svelte';
	import type { ComponentProps, SvelteComponent } from 'svelte';

	export let actions: TActions;
	export let selectedActionProps: ComponentProps<any> | null = null;

	let selectedAction: Action<any, any> | null;

	let modal: Modal;

	type ExtractComponentType<
		TAction extends Action<any, any>,
		Name extends TActions[number]['name']
	> = TAction extends { name: Name } ? TAction['component'] : never;

	export function show<TName extends TActions[number]['name']>(name: TName) {
		selectedAction = actions.find((action) => action.name === name) ?? null;
		//selectedActionProps = props ?? null;
		// props was a param that i removed for now
		// till svelte5 comes out i can simply use signals to make this a reactive value
		// for instance if we pass in {form: form, title: title} and these values are reactive only the initial value of
		// these things will be passed to this function
		// we can work around this by passing getters but the API will look like shit
		// so for now I'll still to passing props as a Prop to this component itself to make it fully reactive by nature
		modal.show();
	}

	function handleCloseModal() {
		selectedAction = null;
	}
</script>

<Modal title={selectedAction?.title} bind:this={modal} on:closed={handleCloseModal}>
	<svelte:component this={selectedAction?.component} slot="body" {...selectedActionProps}
	></svelte:component>
</Modal>
