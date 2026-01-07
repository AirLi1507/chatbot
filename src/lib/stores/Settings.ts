import { get, writable, type Writable } from 'svelte/store';
import type { Settings, Theme } from '$lib/types/Settings.ts';
import { client } from '$lib/stores/OpenAI.ts';
import OpenAI from 'openai';
import type { Message } from '$lib/types/Message';

const defaultPrompt: string =
	'Always respond in Markdown format. Always Use KaTeX format for any MathML text. An example for display MathML: "\\n\\n$$ 1 + 2 + 3 + ... + 999 $$\\n\\n".';

const apiKey = writable<string>('');
const baseUrl = writable<string>('https://api.openai.com/v1');
const prefModel = writable<string>('gpt-3.5-turbo');
const theme = writable<Theme>('light');
const systemPrompt = writable<string>(defaultPrompt);

let messageArray: Writable<Message[]>;

const settings = writable<Settings>({
	apiKey: get(apiKey),
	baseUrl: get(baseUrl),
	theme: get(theme),
	systemPrompt: get(systemPrompt),
	prefModel: get(prefModel)
});

const unsubscribeSettings = settings.subscribe(async (s) => {
	if (s.apiKey !== '') {
		client.set(
			new OpenAI({
				apiKey: s.apiKey,
				baseURL: s.baseUrl,
				dangerouslyAllowBrowser: true
			})
		);
	}
	if (s.theme === 'dark') {
		document.body.classList.add('dark');
	} else {
		document.body.classList.remove('dark');
	}
	if (messageArray == undefined) {
		messageArray = (await import('./Message.ts')).messageArray;
	}
	messageArray.update((m) => [
		{
			role: 'system',
			content: s.systemPrompt ?? defaultPrompt
		},
		...m.slice(1)
	]);
});

export { apiKey, baseUrl, prefModel, theme, systemPrompt, settings, unsubscribeSettings };
