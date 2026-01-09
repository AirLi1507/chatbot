import type { Message } from '$lib/types/Message.ts';
import { writable } from 'svelte/store';

const userMessage = writable<string>('');

const messageArray = writable<Message[]>([]);

const messageLoading = writable<boolean>(false);

export { userMessage, messageArray, messageLoading };
