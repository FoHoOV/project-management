import { writable } from 'svelte/store';

type MilliSeconds = number;

export type Toast = {
	time: MilliSeconds;
	text: string;
	type: 'info' | 'warning' | 'success' | 'error';
	id: string;
};

const { subscribe, update: _update } = writable<Toast[]>([]);

const addToast = (toast: Omit<Toast, 'id'>): Toast => {
	const toastWithId: Toast = { ...toast, id: crypto.randomUUID() };
	_update((toasts) => {
		setTimeout(() => {
			//removeToast(toastWithId);
		}, toastWithId.time);
		return [...toasts, toastWithId];
	});

	return toastWithId;
};

const removeToast = (toast: Toast): void => {
	_update((toasts) => {
		return toasts.filter((item) => item.id !== toast.id);
	});
};

export default {
	addToast,
	removeToast,
	subscribe
};
