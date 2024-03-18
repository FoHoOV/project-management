<script lang="ts" context="module">
	export type Props = {
		message: string;
	};
</script>

<script lang="ts">
	const { message }: Props = $props();
</script>

<p class="text font-bold">{message}</p>
