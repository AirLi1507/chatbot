export type Theme = 'light' | 'dark';

export interface Settings {
  prompt?: string;
  apiKey: string;
  baseUrl: string;
  prefModel?: string;
  theme: Theme;
}
