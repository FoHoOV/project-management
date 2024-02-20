<script lang="ts" context="module">
	import Checkbox from '$components/forms/Checkbox.svelte';

	import { Permission } from '$lib/generated-client/models';
</script>

<script lang="ts">
</script>

{#each Object.values(Permission) as permission}
	<Checkbox label={permission} inputClasses="checkbox-warning"></Checkbox>
{/each}
