import { messageLoading, userMessage, messageArray } from "$lib/stores/Message.ts";
import { get } from "svelte/store";
import { client } from "$lib/stores/OpenAI.ts";
import { settings, systemPrompt } from "$lib/stores/Settings.ts";
import { clearAlertDialogOpen } from "$lib/stores/UI.ts"

function loadMessages() {
  const roles = ["system", "assistant", "user"];
  let arr = JSON.parse(localStorage.getItem("messages")!);
  if (
    Array.isArray(arr) &&
    arr.every(v =>
      (roles.includes(v.role)) &&
      (typeof v.content === "string")
    )
  ) {
    messageArray.set(arr)
  }
}

async function sendMessage(e: SubmitEvent) {
  e.preventDefault();
  messageLoading.set(true);
  messageArray.update(m => [...m, {
    role: "user",
    content: get(userMessage)
  }]);

  if (get(client) == undefined) {
    messageArray.update(m => [...m, {
      role: "assistant",
      content: "Go to settings and configure for the AI endpoint.",
      err: true
    }]);
    messageLoading.set(false);
    scrollToLatestMessage();
    return
  }

  userMessage.set("");

  try {
    const chat = await get(client)!.chat.completions.create({
      model: get(settings).prefModel || "gpt-3.5-turbo",
      messages: [...get(messageArray), {
        role: "user",
        content: get(userMessage)
      }],
      stream: true
    });

    let fullResponse = '';

    messageArray.update(m => [...m, {
      role: 'assistant',
      content: fullResponse
    }]);

    for await (const chunk of chat) {
      fullResponse += chunk.choices[0] ? (chunk.choices[0].delta.content || "") : "";
      messageArray.update(m => [...m.slice(0, m.length - 1), { role: 'assistant', content: fullResponse }]);
      localStorage.setItem("messages", JSON.stringify(get(messageArray)));
    }
  } catch (err) {
    if (err instanceof Error) {
      messageArray.update(m => [...m, { role: 'assistant', content: err.message, err: true }]);
    }
  } finally {
    localStorage.setItem("messages", JSON.stringify(get(messageArray)));
    messageLoading.set(false);
    scrollToLatestMessage();
  }
}

function scrollToLatestMessage(instant?: true) {
  const list = document.querySelector('ul');
  if (list) {
    list.scrollTo({
      top: list.scrollHeight,
      behavior: instant ? 'instant' : 'smooth'
    });
  }
}

function clearHistory() {
  console.log("CLEARED")
  messageArray.set([
    {
      role: "system",
      content: get(systemPrompt)
    }
  ]);
  localStorage.removeItem("messages");
  clearAlertDialogOpen.set(false);
}

export {
  loadMessages,
  sendMessage,
  scrollToLatestMessage,
  clearHistory
}
