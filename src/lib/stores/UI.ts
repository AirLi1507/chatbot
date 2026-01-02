import { writable } from "svelte/store";

const clearAlertDialogOpen = writable<boolean>(false);
const settingsDialogOpen = writable<boolean>(false);

export {
  clearAlertDialogOpen,
  settingsDialogOpen
}
