<script lang="ts" context="module">
	import FormInput from '$components/forms/FormInput.svelte';

	import { Permission } from '$lib/generated-client/models';
</script>

<script lang="ts">
</script>

{#each Object.values(Permission) as permission}
	<FormInput name={permission} label={permission} inputClasses="checkbox-warning"></FormInput>
{/each}
