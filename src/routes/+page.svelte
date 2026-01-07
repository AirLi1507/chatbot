<script lang="ts">
	import { unsubscribeSettings } from '$lib/stores/Settings';
	import { unsubscribeClient } from '$lib/stores/OpenAI';
	import { messageArray } from '$lib/stores/Message';
	import { loadSettings } from '$lib/utils/Settings';
	import { loadMessages } from '$lib/utils/Message';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
		loadSettings();
		loadMessages();
		onDestroy(() => {
			unsubscribeSettings();
			unsubscribeClient();
		});
	});
</script>

<ul class="box-border h-svh overflow-y-scroll pb-15 lg:px-[20%] lg:pt-5">
	{#each $messageArray as msg, index (index)}
		{#await import('$lib/components/chat/Message.svelte') then Message}
			<Message.default {msg} />
		{/await}
	{/each}
</ul>
{#await import('$lib/components/chat/MessageBar.svelte') then MessageBar}
	<MessageBar.default />
{/await}
