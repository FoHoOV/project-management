<script lang="ts">
	export let name: string;
	export let href: string;
</script>

<li><a on:click class="btn btn-ghost normal-case text-xl" {href}>{name}</a></li>
