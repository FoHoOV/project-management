<script lang="ts">
	import toasts from '$lib/stores/toasts';
	import type { Toast } from '$lib/stores/toasts/toasts';
	import { fade, slide } from 'svelte/transition';

	function getToastTypeClass(toast: Toast): string {
		switch (toast.type) {
			case 'success':
				return 'alert-success';
			case 'error':
				return 'alert-error';
			case 'info':
				return 'alert-info';
			default:
				return 'alert-info';
		}
	}
</script>

<div class="toast toast-end">
	{#each $toasts as toast (toast.id)}
		<div
			class="alert {getToastTypeClass(toast)}"
			in:fade={{ duration: 200 }}
			out:slide={{ axis: 'x', duration: 200 }}
		>
			<span>{toast.message}</span>
		</div>
	{/each}
</div>
