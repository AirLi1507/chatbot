import {
  apiKey,
  baseUrl,
  prefModel,
  theme,
  systemPrompt,
  settings
} from "../stores/Settings.ts";
import { get } from "svelte/store";
import { settingsDialogOpen } from "$lib/stores/UI.ts";

function loadSettings() {
  const userSettings = JSON.parse(localStorage.getItem("settings")!)
  if (
    userSettings &&
    typeof userSettings.apiKey === "string" &&
    typeof userSettings.baseUrl === "string" &&
    typeof userSettings.prefModel === "string" &&
    typeof userSettings.theme === "string" &&
    typeof userSettings.prompt === "string"
  ) {
    settings.set(userSettings);
  }
}

function applySettings() {
  settings.set({
    apiKey: get(apiKey),
    baseUrl: get(baseUrl),
    prefModel: get(prefModel),
    theme: get(theme),
    prompt: get(systemPrompt)
  });
  localStorage.setItem("settings", JSON.stringify(get(settings)));
  settingsDialogOpen.set(false);
}

export {
  loadSettings,
  applySettings
}
