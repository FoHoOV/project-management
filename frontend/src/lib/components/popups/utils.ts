import Fwal from '$components/popups/Fwal.svelte';
import { getMultiStepModal } from '../../stores';

export function popup(message: string) {
	getMultiStepModal()?.add({
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
