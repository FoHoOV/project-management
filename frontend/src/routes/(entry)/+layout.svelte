<script>
	import { page } from '$app/stores';
</script>

<div class="flex items-center gap-5 rounded-2xl bg-base-200 shadow-md">
	<div class="flex-1">
		<slot />
	</div>
	<div class="hidden flex-1 md:block lg:text-center">
		<h1 class="text-5xl font-bold text-info">Account management</h1>
		<h2 class="pt-5 text-xl font-semibold">
			{#if $page.url.href.endsWith('/login')}
				Login to your existing account
			{:else if $page.url.href.endsWith('/signup')}
				Create a new account
			{/if}
		</h2>
	</div>
</div>
