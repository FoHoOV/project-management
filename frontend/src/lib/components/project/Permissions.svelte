<script lang="ts" context="module">
	import { Permission } from '$lib/generated-client/models';
</script>

<script lang="ts">
</script>

{#each Object.values(Permission) as permission}
	<div class="relative">
		<label
			class="label flex max-w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-info p-3"
		>
			<span> {permission} </span>
			<input type="checkbox" class="checkbox-warning checkbox" />
		</label>
	</div>
{/each}
