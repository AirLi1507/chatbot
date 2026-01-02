import type { Message } from "$lib/types/Message.ts";
import { get, writable } from "svelte/store";
import { systemPrompt } from "./Settings";

const userMessage = writable<string>("");

const messageArray = writable<Message[]>([
  {
    role: "system",
    content: get(systemPrompt)
  }
])

const messageLoading = writable<boolean>(false)

export {
  userMessage,
  messageArray,
  messageLoading,
}
