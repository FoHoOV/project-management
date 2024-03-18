import Fwal from '$components/popups/Fwal.svelte';
import { multiStepModal } from '$lib/stores/multi-step-modal';

export function popup(message: string) {
	multiStepModal.add({
		component: Fwal,
		props: () => {
			return {
				message: message
			};
		},
		title: '',
		closeModalButtonText: 'ok'
	});
}
