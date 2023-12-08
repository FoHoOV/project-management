<script lang="ts">
	import Modal from '$components/popups/Modal.svelte';
	import type { SvelteComponent, ComponentProps, ComponentType } from 'svelte';

	type Action = {
		component: ComponentType;
		name: string;
		title: string;
	};

	export let actions: Action[];

	let selectedAction: Action | null;
	let selectedActionProps: ComponentProps<SvelteComponent<ComponentType>> | null = null;

	let modal: Modal;

	export function show(
		name: (typeof actions)[number]['name'],
		props?: ComponentProps<SvelteComponent<ComponentType>>
	) {
		selectedAction = actions.find((action) => action.name === name) ?? null;
		if (props) {
			selectedActionProps = props;
		}
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
