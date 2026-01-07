<script lang="ts">
	import './layout.css';

	const { children } = $props();
</script>

<div>{@render children()}</div>

<style lang="postcss">
	@reference "$css";

	div {
		@apply dark:bg-black dark:text-white;
	}
</style>
