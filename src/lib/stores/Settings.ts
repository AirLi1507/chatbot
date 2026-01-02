import { get, writable } from "svelte/store";
import type { Settings, Theme } from "$lib/types/Settings.ts";
import { client } from "$lib/stores/OpenAI.ts";
import OpenAI from "openai/index.js";

const apiKey = writable<string>('');
const baseUrl = writable<string>('https://api.openai.com/v1');
const prefModel = writable<string>('gpt-3.5-turbo');
const theme = writable<Theme>('light');
const systemPrompt = writable<string>('Always respond in Markdown format. Always Use KaTeX format for any mathematical-related text.')

const settings = writable<Settings>({
  apiKey: get(apiKey),
  baseUrl: get(baseUrl),
  theme: get(theme),
  prompt: get(systemPrompt),
  prefModel: get(prefModel)
})

const unsubscribeSettings = settings.subscribe(s => {
  if (s.apiKey !== "") {
    client.set(new OpenAI({
      apiKey: s.apiKey,
      baseURL: s.baseUrl,
      dangerouslyAllowBrowser: true
    }));
  }
  if (s.theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
})


export {
  apiKey,
  baseUrl,
  prefModel,
  theme,
  systemPrompt,
  settings,
  unsubscribeSettings
}
