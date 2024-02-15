<script lang="ts" context="module">
	import Fa from 'svelte-fa';
	import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

	export type Props = {
		message?: string | null;
		type?: 'success' | 'error' | 'info';
		class?: string;
	};
</script>

<script lang="ts">
	const { type, message = null, class: className = '' } = $props<Props>();

	const alertClassName = $derived.by(() => {
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
	<div class="alert alert-{alertClassName} rounded-md {className}">
		<Fa icon={faExclamationCircle} />
		<span>{message}</span>
	</div>
{/if}
