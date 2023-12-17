<script lang="ts">
	import { onMount } from 'svelte';
	import { Datepicker } from 'vanillajs-datepicker';
	import type { DatepickerOptions } from 'vanillajs-datepicker/Datepicker';

	export let input: HTMLInputElement;
	export let options: DatepickerOptions = {};

	let datePicker: Datepicker;

	onMount(() => {
		datePicker = new Datepicker(input, options);
	});
</script>
