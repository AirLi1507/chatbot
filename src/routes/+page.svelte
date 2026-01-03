<script lang="ts">
	import Message from '$lib/components/chat/Message.svelte';
  import MessageBar from '$lib/components/chat/MessageBar.svelte';
  import { unsubscribeSettings } from '$lib/stores/Settings';
	import { unsubscribeClient } from '$lib/stores/OpenAI';
  import { messageArray } from '$lib/stores/Message';
  import { loadSettings } from '$lib/utils/Settings';
	import { loadMessages } from '$lib/utils/Message';
	import { onDestroy, onMount } from 'svelte';

	onMount(() => {
    loadSettings();
    loadMessages();
    onDestroy(()=>{
      unsubscribeSettings();
      unsubscribeClient();
    })
	});
</script>

<ul class="box-border h-svh overflow-y-scroll pb-15 lg:px-[20%] lg:pt-5">
  {#each $messageArray as msg, index (index)}
    <Message msg={msg} />
  {/each}
</ul>
<MessageBar />
