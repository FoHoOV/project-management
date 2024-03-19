<script lang="ts" context="module">
	import Fa from 'svelte-fa';
	import { faClose, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

	export type Props = {
		message?: String | null;
		type?: 'success' | 'error' | 'info';
		class?: string;
	};
</script>

<script lang="ts">
	const { type, message = null, class: className = '' }: Props = $props();

	let closed = $state<boolean>(false);
	let autoClosePercentage = $state<number>(0);

	const isMessageNull = $derived.by(() => {
		if ((message?.trim()?.length ?? 0) === 0) {
			return true;
		}
		return !message || message == 'null' || message == 'undefined';
	});

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

	$effect(() => {
		message;
		let intervalId: NodeJS.Timeout;

		closed = false;
		autoClosePercentage = 0;

		intervalId = setInterval(() => {
			autoClosePercentage += 1;
		}, 90);

		return () => {
			clearInterval(intervalId);
		};
	});

	$effect(() => {
		if (autoClosePercentage >= 100) {
			closed = true;
		}
	});
</script>

{#if !isMessageNull && !closed}
	<div role="alert" class="alert alert-{alertClassName} rounded-md {className}">
		<Fa icon={faExclamationCircle} />
		<span data-testid="alert-message">{message}</span>
		<button
			class="h-8 w-8"
			onclick={() => (closed = true)}
			tabindex="-1"
			data-testid="alert-close-dismiss-btn"
		>
			<div
				class="radial-progress max-h-full max-w-full overflow-hidden"
				style="--value:{autoClosePercentage}; --thickness: 2px;"
				role="progressbar"
			>
				<Fa class="cursor-pointer" icon={faClose} />
			</div>
		</button>
	</div>
{/if}
