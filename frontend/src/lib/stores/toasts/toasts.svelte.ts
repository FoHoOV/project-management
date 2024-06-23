type MilliSeconds = number;
type MessageType = 'info' | 'warning' | 'success' | 'error';

export type Toast = {
	time: MilliSeconds;
	message: string;
	type: MessageType;
	readonly id: symbol;
};

export class ToastManager {
	private _toasts = $state<Toast[]>([]);

	addToast(toast: Omit<Toast, 'id'>): Toast {
		const toastWithId = { ...toast, id: Symbol() as symbol };

		setTimeout(() => {
			this.removeToast(toastWithId);
		}, toastWithId.time);

		this._toasts.push(toastWithId);

		return toastWithId;
	}

	removeToast(toast: Toast): void {
		this._toasts = this._toasts.filter((item) => item.id !== toast.id);
	}

	public get value$() {
		return this._toasts;
	}
}
