import { get, writable } from 'svelte/store';
import type { Settings, Theme } from '$lib/types/Settings.ts';
import { client } from '$lib/stores/OpenAI.ts';
import OpenAI from 'openai';
import { messageArray } from './Message';

const defaultPrompt: string = `
Always respond in Markdown. Use KaTeX for ALL math.
1. Standalone blocks: Use $$exclusively. You MUST leave one full blank line before and after the$$ block. The $$ delimiters must be on their own lines.
2. Inline math: Use $ exclusively.
3. Restrictions: NEVER use \\begin{aligned}, \\[ \\], \\( \\), or [ ]. Write multi-line steps as separate $$ blocks.
4. Punctuation: Place all periods and commas outside the $ or $$ tags.

Template for Standalone Math:
Text ends here.

$$
math_expression_here
$$

New paragraph starts here.`;

const apiKey = writable<string>('');
const baseUrl = writable<string>('https://api.openai.com/v1');
const prefModel = writable<string>('gpt-3.5-turbo');
const theme = writable<Theme>('light');
const systemPrompt = writable<string>(defaultPrompt);

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
  if (document) {
    if (s.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
  messageArray.update((m) => 
    [
      {
        role: 'system',
        content: s.systemPrompt || defaultPrompt
      },
      ...m.slice(1)
    ]
  );
  if (window) {
    localStorage.setItem('messages', JSON.stringify(get(messageArray)));
  }
});

export { apiKey, baseUrl, prefModel, theme, systemPrompt, settings, unsubscribeSettings };
