<script lang="ts">
	import { page } from '$app/stores';
	import LoadingButton from '$lib/components/buttons/LoadingButton.svelte';
	import Error from '$components/Error.svelte';
	import { superEnhance } from '$lib/enhance/form';

	let isSubmitting = false;
</script>

<svelte:head>
	<title>logout</title>
</svelte:head>

<div class="flex flex-col justify-center items-center">
	<Error message={$page.error?.message} />
	<h2>Are sure you are gonna miss out on this?</h2>
	<form
		method="post"
		use:superEnhance
		on:submitstarted={() => (isSubmitting = true)}
		on:submitended={() => (isSubmitting = false)}
	>
		<LoadingButton
			className="btn-warning mt-2"
			text="Yes, I'm a piece of shit"
			loading={isSubmitting}
			type="submit"
		/>
	</form>
</div>
