<script lang="ts" context="module">
	import Fa from 'svelte-fa';
	import { faClose, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
	import { untrack } from 'svelte';

	export type Props = {
		message?: string | null;
		type?: 'success' | 'error' | 'info';
		class?: string;
	};
</script>

<script lang="ts">
	const { type, message = null, class: className = '' } = $props<Props>();
	let closedByUser = $state<boolean>(false);

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
		untrack(() => {
			closedByUser = false;
		});
	});
</script>

{#if message && !closedByUser}
	<div role="alert" class="alert alert-{alertClassName} rounded-md {className}">
		<Fa icon={faExclamationCircle} />
		<span>{message}</span>
		<button class="btn-sm" onclick={() => (closedByUser = true)}>
			<Fa class="cursor-pointer" icon={faClose} />
		</button>
	</div>
{/if}
