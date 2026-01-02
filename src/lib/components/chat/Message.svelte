<script lang="ts">
	import Sparkles from "@lucide/svelte/icons/sparkles";
	import User from "@lucide/svelte/icons/user";
  import type { Message } from "$lib/types/Message.ts";
  import { parseMarkdown } from "$lib/utils/Text.ts";

  interface Props {
    msg: Message
  }

  const { msg }: Props = $props()
</script>

{#if msg.role !== "system"}
  <li
    class={'flex max-w-full gap-3 border-b border-b-black/10 lg:border-0 lg:rounded-lg p-4' +
      (msg.err ? ' bg-red-100 dark:bg-red-950/50' : '')}
  >
    <span
      class={'h-fit rounded-md p-1 outline-2' +
        (msg.err
          ? ' bg-red-50 text-red-900 outline-red-300 dark:bg-black/75 dark:text-red-300'
          : ' bg-zinc-50 outline-zinc-200 dark:bg-zinc-800 dark:stroke-white dark:outline-zinc-700')}
    >
      {#if msg.role === 'assistant'}
        <Sparkles />
      {:else}
        <User />
      {/if}
    </span>
    <div
      class={'my-auto max-w-[85%]' +
        (msg.err ? ' font-semibold text-red-900 dark:text-red-400' : '')}
    >
      {#await parseMarkdown(msg.err ? 'Error: ' + msg.content : msg.content) then html}
        {@html html}
      {/await}
    </div>
  </li>
{/if}
