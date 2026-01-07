export type Theme = 'light' | 'dark';

export interface Settings {
	apiKey: string;
	baseUrl: string;
	systemPrompt: string;
	prefModel?: string;
	theme: Theme;
}
