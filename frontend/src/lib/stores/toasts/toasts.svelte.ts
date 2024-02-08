type MilliSeconds = number;
type MessageType = 'info' | 'warning' | 'success' | 'error';

export type Toast = {
	time: MilliSeconds;
	message: string;
	type: MessageType;
	id: string;
};

class ToastManager {
	private _toasts = $state<Toast[]>([]);

	addToast(toast: Omit<Toast, 'id'>): Toast {
		const toastWithId = { ...toast, id: crypto.randomUUID() };

		setTimeout(() => {
			this.removeToast(toastWithId);
		}, toastWithId.time);

		this._toasts.push(toastWithId);

		return toastWithId;
	}

	removeToast(toast: Toast): void {
		this._toasts = this._toasts.filter((item) => item.id !== toast.id);
	}

	public get toasts() {
		return this._toasts;
	}
}

export const toasts = new ToastManager();

export default toasts;
