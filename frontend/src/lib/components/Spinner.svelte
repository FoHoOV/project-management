<script lang="ts" module>
	export type Props = {
		visible?: boolean;
	};
</script>

<script lang="ts">
	// it will position absolutely to the nearest position: relative parent.
	let { visible = $bindable(false) }: Props = $props();

	export function show() {
		visible = true;
	}

	export function hide() {
		visible = false;
	}
</script>

<div
	class="align-center glass absolute left-0 top-0 z-10 flex h-full w-full justify-center rounded-lg bg-base-300 opacity-80"
	class:hidden={!visible}
	data-testid="spinner-loading-state"
>
	<span class="loading loading-spinner loading-md dark:text-black"></span>
</div>
