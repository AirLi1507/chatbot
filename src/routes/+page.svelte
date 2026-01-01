<script lang="ts">
	import {
		AlertDialog,
		AlertDialogTrigger,
		AlertDialogContent,
		AlertDialogHeader,
		AlertDialogTitle,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogCancel,
		AlertDialogAction
	} from '$lib/components/ui/alert-dialog';
	import {
		Dialog,
		DialogTrigger,
		DialogHeader,
		DialogTitle,
		DialogDescription,
		DialogContent
	} from '$lib/components/ui/dialog';
	import {
		Select,
		SelectTrigger,
		SelectContent,
		SelectGroup,
		SelectLabel,
		SelectItem
	} from '$lib/components/ui/select';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Computer from '@lucide/svelte/icons/computer';
	import User from '@lucide/svelte/icons/user';
	import BrushCleaning from '@lucide/svelte/icons/brush-cleaning';
	import Settings from '@lucide/svelte/icons/settings';
	import Send from '@lucide/svelte/icons/send';
	import OpenAI from 'openai';
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import { createHighlighter } from 'shiki';
  import markedKatex from "marked-katex-extension"

	// Interface Declaration

	interface Message {
		role: 'assistant' | 'user' | 'system';
		content: string;
		err?: boolean;
	}

	interface ModelInfo {
		id: string;
	}

	// User Data / Configuration

	let userMsg = $state<string>('');
	let userApiKey = $state<string>('');
	let userBaseUrl = $state<string>('https://api.openai.com/v1');
	let userModelPref = $state<string>('gpt-3.5-turbo');

	// Data

	let modelList = $state<ModelInfo[]>([]);
	let msgArray = $state<Message[]>([
		{
			role: 'system',
			content: 'Always respond in Markdown format.'
		}
	]);

	// Status

	let clearAlertOpen = $state<boolean>(false);
	let settingsOpen = $state<boolean>(false);
	let loading = $state<boolean>(false);
	let theme = $state<string>('light');

	// Client

	let client = $state<OpenAI | undefined>();

	// Function

	const highlighterPromise = createHighlighter({
		themes: ['catppuccin-mocha'],
		langs: [
			'jsx',
			'tsx',
			'js',
			'ts',
			'javascript',
			'typescript',
			'html',
			'css',
			'json',
			'svelte',
			'markdown',
			'md',
			'mdx',
			'php',
			'bash',
			'c',
			'c++',
			'c#',
			'rust'
		]
	});

	function cleanHistory() {
		localStorage.removeItem('messages');
		msgArray = [
			{
				role: 'system',
				content: 'Always respond in Markdown format. Always Use Katex format for any mathematical-related text.'
			}
		];
		clearAlertOpen = false;
	}

	function applySettings(e: SubmitEvent) {
		e.preventDefault();
		localStorage.setItem(
			'settings',
			JSON.stringify({
				apiKey: userApiKey,
				baseUrl: userBaseUrl,
				modelPref: userModelPref,
				theme: theme
			})
		);
		client = new OpenAI({
			apiKey: userApiKey,
			baseURL: userBaseUrl,
			dangerouslyAllowBrowser: true
		});
		settingsOpen = false;
	}

	async function sendMsg(e: SubmitEvent) {
		e.preventDefault();
		msgArray.push({
			role: 'user',
			content: userMsg
		});
		userMsg = '';
		loading = true;
		if (client == undefined) {
			msgArray.push({
				role: 'assistant',
				content: 'In-complete or incorrect configuration for chat bot.',
				err: true
			});
			scrollToLatestMsg();
			loading = false;
			return;
		}
		try {
			const chat = await client.chat.completions.create({
				model: userModelPref,
				messages: msgArray.filter((i) => i.err == undefined),
				stream: true
			});

			let fullResponse = '';
			msgArray.push({
				role: 'assistant',
				content: fullResponse
			});

			for await (const chunk of chat) {
				fullResponse += chunk.choices[0]?.delta?.content ?? '';
				msgArray[msgArray.length - 1].content = fullResponse;
				localStorage.setItem('messages', JSON.stringify(msgArray));
				scrollToLatestMsg(true);
			}
		} catch (err) {
			if (err instanceof Error) {
				msgArray.push({
					role: 'assistant',
					content: err.message,
					err: true
				});
			}
		} finally {
			loading = false;
			scrollToLatestMsg();
		}
	}

	async function parseMarkdown(content: string) {
		const highlighter = await highlighterPromise;
		marked.use({
			async: true, // Crucial: enables awaiting the highlighter inside tokens
			renderer: {
				code({ text, lang }) {
					return highlighter.codeToHtml(text, {
						lang: lang || 'text',
						theme: 'catppuccin-mocha'
					});
				}
			}
		});

    marked.use(markedKatex({
      throwOnError: false,
      displayMode:true,
      output: "mathml" 
    }))

		return await marked.parse(content);
	}

	function scrollToLatestMsg(instant: boolean = false) {
		const list = document.querySelector('ul');
		if (list) {
			list.scrollTo({
				top: list.scrollHeight,
				behavior: instant ? 'instant' : 'smooth'
			});
		}
	}

	onMount(() => {
		const settingsStr = localStorage.getItem('settings');
		const messagesStr = localStorage.getItem('messages');
		const messages = JSON.parse(messagesStr!);
		const settings = JSON.parse(settingsStr!);
		if (settings && settings.apiKey && settings.baseUrl && settings.modelPref && settings.theme) {
			userApiKey = settings.apiKey;
			userBaseUrl = settings.baseUrl;
			userModelPref = settings.modelPref;
			theme = settings.theme;
			applySettings(new SubmitEvent(''));
		}
		if (messages && messages.length > 1) {
			msgArray = messages;
			scrollToLatestMsg();
		}
	});

	$effect(() => {
		if (!client) return;
		client.models.list().then((r) => {
			modelList = r.data.sort((a, b) => a.id.localeCompare(b.id));
			modelList = [
				...new Set(modelList.map((i) => modelList.find((m) => i.id === m.id)))
			] as ModelInfo[];
		});
	});

	$effect(() => {
		if (theme === 'dark') {
			document.body.classList.add('dark');
		} else {
			document.body.classList.remove('dark');
		}
	});
</script>

<div class="dark:bg-black dark:text-white">
	<ul class="box-border h-svh overflow-y-scroll pb-15 lg:px-[20%] lg:pt-5">
		{#each msgArray as msg, index (index)}
			{#if msg.role !== 'system'}
				<li
					class={'flex max-w-full gap-3 border-b border-b-black/10 p-4' +
						(msg.err ? ' bg-red-100' : '')}
				>
					<span
						class={'h-fit rounded-md p-1 outline-2' +
							(msg.err
								? ' bg-red-50 text-red-900 outline-red-300 dark:bg-red-400 dark:text-red-300'
								: ' bg-zinc-50 outline-zinc-200 dark:bg-zinc-800 dark:stroke-white dark:outline-zinc-700')}
					>
						{#if msg.role === 'assistant'}
							<Computer />
						{:else}
							<User />
						{/if}
					</span>
					<div
						class={'my-auto max-w-[85%]' +
							(msg.err ? 'font-semibold text-red-900 dark:text-red-400' : '')}
					>
						{#await parseMarkdown(msg.err ? 'Error: ' + msg.content : msg.content) then html}
							{@html html}
						{/await}
					</div>
				</li>
			{/if}
		{/each}
	</ul>

	<form
		onsubmit={sendMsg}
		class="absolute bottom-0 z-40 flex h-fit w-full gap-2 bg-white p-3 shadow-[0_0_8px_rgba(0,0,0,.125)] lg:left-[20%] lg:w-[60%] lg:rounded-t-2xl dark:bg-zinc-800"
	>
		<AlertDialog bind:open={clearAlertOpen}>
			<AlertDialogTrigger type="button">
				<Button variant="destructive" class="w-9">
					<BrushCleaning />
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader class="text-start">
					<AlertDialogTitle>Are you sure to clear your chat history?</AlertDialogTitle>
					<AlertDialogDescription
						>This action cannot be reverted and all history will be deleted permanetly.</AlertDialogDescription
					>
				</AlertDialogHeader>
				<AlertDialogFooter class="flex flex-row justify-end">
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction onclick={cleanHistory}>Confirm</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
		<Dialog bind:open={settingsOpen}>
			<DialogTrigger type="button">
				<Button variant="outline" class="w-9">
					<Settings />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader class="flex flex-col items-start">
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>Configuration for your chatbot.</DialogDescription>
				</DialogHeader>
				<form onsubmit={applySettings} class="flex flex-col gap-4">
					<Input
						required
						placeholder="Your API Key"
						bind:value={userApiKey}
						type="password"
						class="text-sm"
					/>
					<Input
						required
						placeholder="Base URL for API Endpoint"
						bind:value={userBaseUrl}
						class="text-sm"
					/>
					<Select type="single" bind:value={userModelPref}>
						<SelectTrigger class="w-full">{userModelPref}</SelectTrigger>
						<SelectContent class="max-h-100">
							<SelectGroup>
								<SelectLabel>Models</SelectLabel>
								{#each modelList as model, index (index)}
									<SelectItem value={model.id}>{model.id}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
					<Select type="single" bind:value={theme}>
						<SelectTrigger class="w-full">
							{#if theme === 'dark'}
								Dark
							{:else}
								Light
							{/if}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>Theme Selection</SelectLabel>
								<SelectItem value="light">Light</SelectItem>
								<SelectItem value="dark">Dark</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
					<Button type="submit">Apply</Button>
				</form>
			</DialogContent>
		</Dialog>
		<Input
			required
			placeholder="Type your message..."
			bind:value={userMsg}
			disabled={loading}
			class="text-sm"
		/>
		<Button type="submit" disabled={loading}>
			<Send />
		</Button>
	</form>
</div>

<style lang="postcss">
	@reference "./layout.css";
	@custom-variant dark (&:where(.dark, .dark *));
	:global {
		li > div {
			:first-child {
				@apply mt-1;
			}
			* {
				@apply my-2;
			}
			ul {
				@apply list-disc pl-4;
			}
			h1 {
				@apply text-3xl;
			}
			h2 {
				@apply text-2xl;
			}
			h3 {
				@apply text-xl;
			}
			pre {
				@apply w-fit max-w-full overflow-x-scroll rounded-lg border-2 border-white/50 p-3 dark:border-white/10;
				code {
					@apply rounded-none bg-transparent p-0;
				}
			}
			code {
				@apply rounded-sm bg-black/10 px-1 dark:bg-white/20;
			}
		}
		li:last-of-type {
			@apply border-b-0;
		}
	}
</style>
