<script lang="ts" context="module">
	import Fa from 'svelte-fa';
	import { toasts } from '$lib/stores/toasts';
	import type { Toast } from '$lib/stores/toasts/toasts.svelte';
	import { faClose } from '@fortawesome/free-solid-svg-icons';
	import { fade, slide } from '$lib/animations';
</script>

<script lang="ts">
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

<div class="toast toast-end z-50">
	{#each toasts.current as toast, i (toast.id)}
		<div
			class="alert flex flex-row {getToastTypeClass(toast)}"
			in:fade={{ duration: 150, classes: ['group', '-animation-activated'] }}
			out:slide={{ axis: 'x', duration: 500, classes: ['group', '-animation-activated'] }}
		>
			<span class="whitespace-normal text-start group-[.-animation-activated]:whitespace-nowrap"
				>{toast.message}
			</span>

			<button
				class="btn btn-square btn-sm"
				onclick={() => {
					toasts.removeToast(toast);
				}}
			>
				<Fa icon={faClose}></Fa>
			</button>
		</div>
	{/each}
</div>
