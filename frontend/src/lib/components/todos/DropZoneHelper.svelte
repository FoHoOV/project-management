<script lang="ts" module>
	import {
		faArrowDown,
		faArrowLeft,
		faArrowRight,
		faArrowUp,
		faCross
	} from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export type Props = {
		visible?: boolean;
		direction: 'top' | 'bottom' | 'right' | 'left';
	};
</script>

<script lang="ts">
	const { visible = false, direction }: Props = $props();

	const { icon, flexDirection } = $derived.by(() => {
		switch (direction) {
			case 'top':
				return {
					icon: faArrowUp,
					flexDirection: 'flex-col'
				};
			case 'bottom':
				return {
					icon: faArrowDown,
					flexDirection: 'flex-col-reverse'
				};
			case 'right':
				return {
					icon: faArrowRight,
					flexDirection: 'flex-row-reverse'
				};
			case 'left':
				return {
					icon: faArrowLeft,
					flexDirection: 'flex-row'
				};
			default:
				return {
					icon: faCross,
					flexDirection: 'flex-row'
				};
		}
	});
</script>

<div
	class="glass absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-base-300 opacity-80 {flexDirection}"
	class:hidden={!visible}
>
	<Fa {icon} />
	{#if direction == 'top'}
		<span>Move to on top of this item</span>
	{:else if direction == 'bottom'}
		<span>Move under this item</span>
	{:else if direction == 'right'}
		<span>Move to right of this item</span>
	{:else if direction == 'left'}
		<span>Move to left of this item</span>
	{/if}
</div>
