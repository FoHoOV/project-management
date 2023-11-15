<script lang="ts">
	import DarkModeSwitch from '$components/DarkModeSwitch.svelte';

	export let title: string;
	export let titleHref: string;
	export { className as class };

	let className: string = '';
</script>

<div
	class="navbar sticky top-0 z-30 flex h-16 w-full justify-center bg-base-100 bg-opacity-90 text-base-content shadow-2xl backdrop-blur transition-shadow duration-100 [transform:translate3d(0,0,0)] {className}"
>
	<div class="navbar-start">
		<slot name="start" />
		<a class="btn btn-ghost text-xl normal-case" href={titleHref}>{title}</a>
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal px-1">
			<slot name="center" />
		</ul>
	</div>
	<div class="navbar-end">
		<DarkModeSwitch />
		<ul class="menu px-1">
			<slot name="end" />
		</ul>
	</div>
</div>
