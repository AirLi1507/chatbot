import { get, writable } from "svelte/store";
import { OpenAI } from "openai/client.js";
import type { ModelInfo } from "$lib/types/OpenAI";

const client = writable<OpenAI | undefined>();
const modelList = writable<ModelInfo[]>([]);

const unsubscribeClient = client.subscribe(c => {
  if (c) {
    c.models.list().then((r) => {
      modelList.set(r.data.sort((a, b) => a.id.localeCompare(b.id)));
      modelList.set([
        ...new Set(get(modelList).map((i) => get(modelList).find((m) => i.id === m.id)))
      ] as ModelInfo[]);
    });
  }
})

export {
  client,
  modelList,
  unsubscribeClient
}
