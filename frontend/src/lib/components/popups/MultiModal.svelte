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

	let selectedAction: Action<any, any> | null;
	let selectedActionProps: ComponentProps<any> | null = null;

	let modal: Modal;

	type ExtractComponentType<
		TAction extends Action<any, any>,
		Name extends TActions[number]['name']
	> = TAction extends { name: Name } ? TAction['component'] : never;
	export function show<TName extends TActions[number]['name']>(
		name: TName,
		props: ComponentProps<ExtractComponentType<TActions[number], TName>>
	) {
		selectedAction = actions.find((action) => action.name === name) ?? null;
		selectedActionProps = props ?? null;
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
