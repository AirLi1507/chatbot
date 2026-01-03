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
	import Textarea from '../ui/textarea/textarea.svelte';
	import BrushCleaning from '@lucide/svelte/icons/brush-cleaning';
	import Settings from '@lucide/svelte/icons/settings';
	import Send from '@lucide/svelte/icons/send';
	import { apiKey, baseUrl, prefModel, settings, systemPrompt, theme } from '$lib/stores/Settings';
	import { clearAlertDialogOpen, settingsDialogOpen } from '$lib/stores/UI';
	import { messageLoading, userMessage } from '$lib/stores/Message';
	import { modelList } from '$lib/stores/OpenAI';
	import { clearHistory, sendMessage } from '$lib/utils/Message';
	import { applySettings } from '$lib/utils/Settings';
</script>

<form
	onsubmit={sendMessage}
	class="absolute bottom-0 z-40 flex h-fit w-full gap-2 border-t-2 bg-white p-3 shadow-[0_0_8px_rgba(0,0,0,.125)] lg:left-[20%] lg:w-[60%] lg:rounded-t-2xl lg:border-2 lg:border-b-0 lg:border-black/10 dark:border-white/10 dark:bg-zinc-950"
>
	<AlertDialog bind:open={$clearAlertDialogOpen}>
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
				<AlertDialogAction onclick={clearHistory}>Confirm</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
	<Dialog
		bind:open={$settingsDialogOpen}
		onOpenChange={() => {
			apiKey.set($settings.apiKey);
			baseUrl.set($settings.baseUrl);
			prefModel.set($settings.prefModel ?? 'gpt-3.5-turbo');
			theme.set($settings.theme);
			systemPrompt.set($settings.prompt!);
		}}
	>
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
					bind:value={$apiKey}
					type="password"
					class="text-sm"
				/>
				<Input
					required
					placeholder="Base URL for API Endpoint"
					bind:value={$baseUrl}
					class="text-sm"
				/>
				<Select type="single" bind:value={$prefModel}>
					<SelectTrigger class="w-full">{$settings.prefModel}</SelectTrigger>
					<SelectContent class="h-75">
						<SelectGroup>
							<SelectLabel>Models</SelectLabel>
							{#each $modelList as model, index (index)}
								<SelectItem value={model.id}>{model.id}</SelectItem>
							{/each}
						</SelectGroup>
					</SelectContent>
				</Select>
				<Select type="single" bind:value={$theme}>
					<SelectTrigger class="w-full">
						{#if $theme === 'dark'}
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
	<Textarea
		required
		placeholder="Type your message..."
		bind:value={$userMessage}
		disabled={$messageLoading}
		class="max-h-9 min-h-0 resize-none text-sm"
		onkeydown={(e) => {
			if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim() !== '') {
				sendMessage(new SubmitEvent('submit'));
			}
		}}
	/>
	<Button type="submit" disabled={$messageLoading}>
		<Send />
	</Button>
</form>
