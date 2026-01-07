<script lang="ts">
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import User from '@lucide/svelte/icons/user';
	import type { Message } from '$lib/types/Message.ts';
	import { parseMarkdown } from '$lib/utils/Text.ts';
	import Skeleton from '../ui/skeleton/skeleton.svelte';

	interface Props {
		msg: Message;
	}

	const { msg }: Props = $props();
</script>

{#if msg.role !== 'system'}
	<li class={msg.err && 'bg-red-100 font-semibold dark:bg-red-950/50'}>
		<div>
			<span
				class={msg.err
					? ' bg-red-50 text-red-900 outline-red-300 dark:bg-black/75 dark:text-red-300'
					: ' bg-zinc-50 outline-zinc-200 dark:bg-zinc-800 dark:stroke-white dark:outline-zinc-700'}
			>
				{#if msg.role === 'assistant'}
					<Sparkles />
				{:else}
					<User />
				{/if}
			</span>
			<div class={msg.err && 'text-red-900 dark:text-red-400'}>
				{#if msg.err}
					{'Error: ' + msg.content}
				{:else}
					{#await parseMarkdown(msg.content)}
						<Skeleton class="mb-3 h-2 w-full" />
						<Skeleton class="h-2 w-[80%]" />
					{:then html}
						{@html html}
					{/await}
				{/if}
			</div>
		</div>
	</li>
{/if}

<style lang="postcss">
	@reference "../../../routes/layout.css";

	li {
		@apply border-b border-b-black/10 p-4 last-of-type:border-b-0 lg:rounded-lg lg:border-0;

		div {
			@apply flex min-w-[85%] gap-3;

			div {
				@apply prose block dark:prose-invert;
			}
		}
		span {
			@apply h-fit rounded-md p-1 outline-2;
		}
	}

	:global {
		li > div > div > * {
			@apply mt-1!;
		}
	}
</style>
