<script lang="ts" module>
	import LoadingButton from '#lib/components/buttons/LoadingButton.svelte';
	import Alert from '#lib/components/alerts/Alert.svelte';

	import { page } from '$app/state';
	import { superEnhance } from '#lib/actions/form/index.js';
</script>

<script lang="ts">
	let status = $state<'submitting' | 'none'>('none');
</script>

<svelte:head>
	<title>logout</title>
</svelte:head>

<div class="flex flex-col items-center justify-center">
	<Alert type="error" message={new String(page.error?.message)} />
	<h2>Are sure you are gonna miss out on this?</h2>
	<form
		method="post"
		{@attach superEnhance({
			onSubmitStarted: () => (status = 'submitting'),
			onSubmitEnded: () => (status = 'none')
		})}
	>
		<LoadingButton
			class="btn-warning btn-wide mt-2"
			text="Yes 👋🏾"
			loading={status === 'submitting'}
			type="submit"
			data-testid="logout-btn"
		/>
	</form>
</div>
