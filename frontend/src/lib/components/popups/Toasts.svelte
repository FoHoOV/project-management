<script lang="ts">
	import toasts, { type Toast } from '$lib/stores/toasts';

	function getToastTypeClass(toast: Toast): string {
		switch (toast.type) {
			case 'success':
				return 'success';
			case 'error':
				return 'error';
			case 'info':
				return 'info';
			default:
				return 'info';
		}
	}
</script>

<div class="toast toast-end">
	{#each $toasts as toast}
		<div class="alert {getToastTypeClass(toast)}">
			<span>{toast.text}</span>
		</div>
	{/each}
</div>
