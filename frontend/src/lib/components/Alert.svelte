<script lang="ts">
	import Fa from 'svelte-fa';
	import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

	export let message: string | undefined | null = null;
	export let type: 'success' | 'error' | 'info';
	export { className as class };

	let className: string = '';

	let _alertClassName = '';
	switch (type) {
		case 'success':
			_alertClassName = 'success';
			break;
		case 'error':
			_alertClassName = 'error';
			break;
		case 'info':
			_alertClassName = 'info';
			break;
		default:
			_alertClassName = 'info';
	}
</script>

{#if message}
	<div class="alert alert-{_alertClassName} rounded-md {className}">
		<Fa icon={faExclamationCircle} />
		<span>{message}</span>
	</div>
{/if}
