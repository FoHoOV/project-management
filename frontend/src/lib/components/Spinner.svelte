<script lang="ts">
	export let visible: boolean = false;
	// it will position absolutely to the nearest position: relative parent.
</script>

<div
	class="align-center glass absolute left-0 top-0 z-10 flex h-full w-full justify-center rounded-lg bg-base-300 opacity-80"
	class:hidden={!visible}
>
	<span class="loading loading-spinner loading-md dark:text-black" />
</div>
