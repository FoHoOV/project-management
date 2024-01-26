<script context="module" lang="ts">
	export type Props = {
		message?: string | null;
		type?: 'success' | 'error' | 'info';
		class?: string;
	};
</script>

<script lang="ts">
	import Fa from 'svelte-fa';
	import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

	const { type, message = null, class: className = '' } = $props<Props>();

	let _getAlertClassName = $derived(() => {
		switch (type) {
			case 'success':
				return 'success';
			case 'error':
				return 'error';
			case 'info':
				return 'info';
			default:
				return 'info';
		}
	});
</script>

{#if message}
	<div class="alert alert-{_getAlertClassName()} rounded-md {className}">
		<Fa icon={faExclamationCircle} />
		<span>{message}</span>
	</div>
{/if}
