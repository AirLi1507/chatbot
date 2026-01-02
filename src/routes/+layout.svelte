<script lang="ts">
	import './layout.css';

	const { children } = $props();
</script>

<div class="dark:bg-black dark:text-white">
  {@render children()}
</div>
